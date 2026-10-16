"""Deterministic extraction of the six-column FMCSA application register.

PDF contents are data only. No network calls, language models, or execution of
document instructions are involved. A changed/unsupported layout fails visibly.
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Callable

import pdfplumber

PROPERTY = "MOTOR CARRIER OF PROPERTY (EXCEPT HOUSEHOLD GOODS)"
ENTERPRISE = "ENTERPRISE " + PROPERTY
HHG = "MOTOR CARRIER OF HOUSEHOLD GOODS"
PASSENGERS = "MOTOR CARRIER OF PASSENGERS"
CATEGORIES = (
    PROPERTY, ENTERPRISE, HHG, PASSENGERS,
    "BROKER OF PROPERTY (EXCEPT HOUSEHOLD GOODS)",
    "BROKER OF HOUSEHOLD GOODS",
    "FREIGHT FORWARDER OF PROPERTY (EXCEPT HOUSEHOLD GOODS)",
    "FREIGHT FORWARDER OF HOUSEHOLD GOODS",
)
HEADERS = ("USDOT Number", "Legal Business Name", "Filing Date",
           "Business Mailing Address", "Company Officer", "Business Telephone")
NOTICE = "Application notice; current operating authority not verified"


class RegisterError(ValueError):
    """A document cannot be extracted with a trustworthy supported layout."""


class Cancelled(Exception):
    pass


def clean(value: str | None) -> str:
    return " ".join((value or "").split())


def extract_pdf(data: bytes, filename: str, progress: Callable | None = None,
                cancelled: Callable = lambda: False) -> dict:
    if not data.startswith(b"%PDF-"):
        raise RegisterError("This file is not a PDF.")
    records, warnings = [], []
    category, section, register_date = "", "", ""
    pending = None

    def finish():
        nonlocal pending
        if pending is None:
            return
        cells = pending.pop("cells")
        if not cells[1] or not re.fullmatch(r"\d{2}/\d{2}/\d{4}", cells[2]):
            raise RegisterError(f"Incomplete company row on page {pending['pages'][0]}.")
        try:
            datetime.strptime(cells[2], "%m/%d/%Y")
        except ValueError as error:
            raise RegisterError("Invalid filing date in a company row.") from error
        pending.update(zip(("dot", "name", "filing_date", "address", "officer", "phone"), cells))
        if pending["officer"].lower() in ("undefined undefined", "undefined", "null"):
            pending["officer"] = ""
        if pending["phone"] in ("0", "undefined", "null"):
            pending["phone"] = ""
        records.append(pending)
        pending = None

    with pdfplumber.open(io.BytesIO(data)) as pdf:
        if not 1 <= len(pdf.pages) <= 500:
            raise RegisterError("Use a register with between 1 and 500 pages.")
        first = pdf.pages[0].extract_text() or ""
        if "REGISTER" not in first or "Federal Motor Carrier Safety Administration" not in first:
            raise RegisterError("Expected an FMCSA Register with the six-column USDOT application tables.")
        match = re.search(r"NOTICES RELEASED\s+([A-Za-z]+ \d{1,2}, \d{4})", first)
        if match:
            try:
                register_date = datetime.strptime(match[1], "%B %d, %Y").date().isoformat()
            except ValueError:
                pass
        if not register_date:
            warnings.append("Register date was not recognized; dates are not inferred from the filename.")
        for page_number, page in enumerate(pdf.pages, 1):
            if cancelled():
                raise Cancelled()
            if progress:
                progress(page_number, len(pdf.pages), filename)
            if not page.chars:
                raise RegisterError(f"Page {page_number} has no text layer. OCR is required; scanned PDFs are not supported.")
            tables = sorted(page.find_tables(), key=lambda table: table.bbox[1])
            events = []
            for line in page.extract_text_lines():
                # Only headings outside table cells may change context.
                y = line["top"]
                if any(t.bbox[1] <= y <= t.bbox[3] for t in tables):
                    continue
                text = clean(line["text"])
                if text in CATEGORIES:
                    events.append((y, "category", text))
                elif text == "OPERATING AUTHORITY APPLICATIONS":
                    events.append((y, "section", text))
                elif text.isupper() and max((c.get("size", 0) for c in line["chars"]), default=0) >= 10:
                    if text not in ("REGISTER",) and not text.startswith("NOTICES RELEASED"):
                        events.append((y, "unknown", text))
            events.extend((t.bbox[1], "table", t) for t in tables)
            if not tables:
                raise RegisterError(f"No supported table on page {page_number}; extraction stopped to avoid an incomplete list.")
            for _, kind, item in sorted(events, key=lambda event: event[0]):
                if kind in ("category", "section", "unknown"):
                    finish()
                    if kind == "category":
                        category = item
                    elif kind == "section":
                        section, category = item, ""
                    else:
                        section, category = "", ""
                    continue
                rows = item.extract(x_tolerance=2, y_tolerance=3)
                if not rows or tuple(clean(c) for c in rows[0]) != HEADERS:
                    raise RegisterError(f"Unsupported table layout on page {page_number}. Expected six USDOT application columns.")
                if not category or section != "OPERATING AUTHORITY APPLICATIONS":
                    raise RegisterError(f"Unrecognized category or notice section on page {page_number}.")
                for row in rows[1:]:
                    cells = [clean(c) for c in row]
                    if not any(cells):
                        continue
                    if cells[0]:
                        if not re.fullmatch(r"[1-9]\d{0,9}", cells[0]):
                            raise RegisterError(f"Invalid USDOT cell on page {page_number}.")
                        finish()
                        pending = {"cells": cells, "category": category, "notice": NOTICE,
                                   "source": Path(filename).name, "register_date": register_date,
                                   "pages": [page_number]}
                    else:
                        if pending is None or pending["category"] != category:
                            raise RegisterError(f"Unmatched continuation row on page {page_number}.")
                        pending["cells"] = [clean(a + " " + b) for a, b in zip(pending["cells"], cells)]
                        if page_number not in pending["pages"]:
                            pending["pages"].append(page_number)
            page.close()
        finish()
        pages = len(pdf.pages)
    if not records:
        raise RegisterError("No company rows were found in this register.")
    return {"filename": Path(filename).name, "pages": pages, "register_date": register_date,
            "records": records, "warnings": warnings}


def classify(categories: list[str], include_movers: bool = True) -> tuple[str, str]:
    if PROPERTY in categories:
        extra = " Also has other category listings; review those before outreach." if len(categories) > 1 else ""
        return "relevant", "Listed as a property/freight motor carrier. Confirm equipment and dispatch need." + extra
    if include_movers and HHG in categories:
        return "relevant", "Household-goods motor carrier; included because movers were enabled. Confirm your service fit."
    if ENTERPRISE in categories:
        return "relevant", "Enterprise property carrier; potential dispatch fit. Confirm international-cargo operating scope and service fit."
    if HHG in categories:
        return "excluded", "Household-goods mover; excluded because the movers option is off."
    if PASSENGERS in categories:
        return "excluded", "Passenger operator; outside freight dispatch."
    if any(c.startswith("BROKER") for c in categories):
        return "excluded", "Broker listing with no property motor-carrier listing in these uploads."
    if any(c.startswith("FREIGHT FORWARDER") for c in categories):
        return "excluded", "Freight forwarder listing with no property motor-carrier listing in these uploads."
    return "review", "Unrecognized business category; manual review required."


def combine(documents: list[dict], include_movers: bool = True) -> dict:
    grouped = {}
    for document in documents:
        for record in document["records"]:
            grouped.setdefault(record["dot"], []).append(record)
    leads = []
    for dot, evidence in grouped.items():
        # Prefer the newest property-carrier record for contact details; preserve all variants below.
        ordered = sorted(evidence, key=lambda r: (
            r["category"] == PROPERTY, r["register_date"],
            datetime.strptime(r["filing_date"], "%m/%d/%Y")), reverse=True)
        categories = sorted({r["category"] for r in evidence})
        decision, reason = classify(categories, include_movers)
        chosen = ordered[0]
        flags = []
        if ENTERPRISE in categories:
            flags.append("Enterprise carrier: verify authorized international-cargo scope before offering loads.")
        for field, label in (("name", "business names"), ("address", "addresses"), ("phone", "phone numbers")):
            if len({r[field].casefold() for r in evidence if r[field]}) > 1:
                flags.append(f"Multiple {label} in source records; review evidence.")
        if not chosen["phone"]:
            flags.append("No usable phone number in the preferred source record.")
        leads.append({"dot": dot, "name": chosen["name"], "phone": chosen["phone"],
                      "officer": chosen["officer"], "address": chosen["address"],
                      "filing_date": chosen["filing_date"], "register_date": chosen["register_date"],
                      "categories": categories, "decision": decision, "reason": reason,
                      "flags": flags, "notice": NOTICE, "occurrences": len(evidence),
                      "equipment": "Not provided in register", "evidence": evidence})
    leads.sort(key=lambda r: (r["decision"] != "relevant", r["decision"] != "review", r["name"].casefold(), r["dot"]))
    counts = Counter(r["decision"] for r in leads)
    rows = sum(len(d["records"]) for d in documents)
    return {"leads": leads, "summary": {"rows": rows, "unique": len(leads),
            "duplicates": rows - len(leads), "relevant": counts["relevant"],
            "excluded": counts["excluded"], "review": counts["review"],
            "pages": sum(d["pages"] for d in documents)},
            "documents": [{k: v for k, v in d.items() if k != "records"} for d in documents]}


CSV_FIELDS = ("dot", "name", "categories", "phone", "officer", "address", "filing_date",
              "register_date", "decision", "reason", "flags", "notice", "equipment", "occurrences", "sources")


def csv_text(leads: list[dict]) -> str:
    def safe(value):
        value = str(value)
        # Prevent spreadsheet formula execution, including telephone values beginning with +.
        return "'" + value if value.lstrip().startswith(("=", "+", "-", "@")) or value.startswith(("\t", "\r", "\n")) else value
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=CSV_FIELDS)
    writer.writeheader()
    for lead in leads:
        row = {k: lead.get(k, "") for k in CSV_FIELDS}
        row["categories"] = " | ".join(lead["categories"])
        row["flags"] = " | ".join(lead["flags"])
        row["sources"] = " | ".join(f"{r['source']} p.{','.join(map(str,r['pages']))}: {r['category']} ({r['filing_date']})" for r in lead["evidence"])
        writer.writerow({k: safe(v) for k, v in row.items()})
    return stream.getvalue()


def main():
    parser = argparse.ArgumentParser(description="Extract dispatch prospects from FMCSA Register PDFs locally.")
    parser.add_argument("pdfs", nargs="+", type=Path)
    parser.add_argument("--out", type=Path, default=Path("output"))
    parser.add_argument("--freight-only", action="store_true", help="Exclude companies listed only as household-goods movers")
    args = parser.parse_args()
    documents = []
    for path in args.pdfs:
        try:
            documents.append(extract_pdf(path.read_bytes(), path.name))
        except Exception as error:
            parser.exit(1, f"{path.name}: {error}\nNo exports written.\n")
    result = combine(documents, not args.freight_only)
    args.out.mkdir(parents=True, exist_ok=True)
    relevant = [r for r in result["leads"] if r["decision"] == "relevant"]
    (args.out / "dispatch-leads.csv").write_text(csv_text(relevant), encoding="utf-8-sig")
    (args.out / "dot-numbers.txt").write_text("\n".join(r["dot"] for r in relevant) + "\n", encoding="utf-8")
    (args.out / "all-records.csv").write_text(csv_text(result["leads"]), encoding="utf-8-sig")
    (args.out / "extraction-audit.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result["summary"], indent=2))


if __name__ == "__main__":
    main()
