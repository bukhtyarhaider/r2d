"""Small real PDFs exercise layout boundaries without extra test dependencies."""
import collections
import re
import unittest
from pathlib import Path

import pdfplumber

from extractor import (HEADERS, HHG, MEXICO_PRIVATE_PROPERTY, MEXICO_PROPERTY,
                       PROPERTY, RegisterError, classify, combine, extract_pdf)


def text(value, top, x=50, size=12):
    escaped = value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    return f"BT /F1 {size} Tf {x} {792 - top - size} Td ({escaped}) Tj ET\n"


def table(dot="1234567", top=300, name="Example Carrier", values=None):
    columns = [45.5, 120, 210, 270, 420, 490, 566.5]
    commands = [f"{x} {792-top-60} m {x} {792-top} l S" for x in columns]
    commands += [f"45.5 {792-y} m 566.5 {792-y} l S" for y in (top, top+22, top+60)]
    values = values if values is not None else [dot, name, "08/05/2026", "Town, TX 12345 US", "A Person", "2223334444"]
    for y, row in ((top+6, HEADERS), (top+30, values)):
        commands += [text(value, y, x+4, 5) for x, value in zip(columns, row)]
    return "\n".join(commands)+"\n"


INTRO = "\n".join([text("Federal Motor Carrier Safety Administration REGISTER", 30),
                    text("NOTICES RELEASED August 6, 2026", 50),
                    text("OPERATING AUTHORITY APPLICATIONS", 90), text(PROPERTY, 120)])


def pdf_bytes(pages):
    objects = [b"<< /Type /Catalog /Pages 2 0 R >>",
               ("<< /Type /Pages /Count %d /Kids [%s] >>" %
                (len(pages), " ".join(f"{4+2*i} 0 R" for i in range(len(pages))))).encode(),
               b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]
    for i, content in enumerate(pages):
        footer = "\n".join([text("Run Date = 08/06/2026", 732, size=10),
                             text("Run Time = 09:26", 744, size=10),
                             text(f"Page {i+1} of {len(pages)}", 756, size=10)])
        stream = (content + "\n" + footer).encode()
        objects.extend([(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
                         f"/Resources << /Font << /F1 3 0 R >> >> /Contents {5+2*i} 0 R >>").encode(),
                        f"<< /Length {len(stream)} >>\nstream\n".encode()+stream+b"\nendstream"])
    output, offsets = b"%PDF-1.4\n", [0]
    for i, obj in enumerate(objects, 1):
        offsets.append(len(output))
        output += f"{i} 0 obj\n".encode()+obj+b"\nendobj\n"
    xref = len(output)
    output += f"xref\n0 {len(offsets)}\n0000000000 65535 f \n".encode()
    output += b"".join(f"{offset:010d} 00000 n \n".encode() for offset in offsets[1:])
    return output+f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()


class LayoutBoundaryTests(unittest.TestCase):
    def test_footer_only_last_page_is_reported_without_losing_last_record(self):
        doc = extract_pdf(pdf_bytes([INTRO+table(), ""]), "footer.pdf")
        self.assertEqual(len(doc["records"]), 1)
        self.assertEqual(doc["records"][0]["dot"], "1234567")
        self.assertEqual(doc["records"][0]["pages"], [1])
        self.assertEqual(doc["pages"], 2)
        self.assertIn("Page 2 contains only the register footer", doc["warnings"][0])

    def test_nonempty_page_without_tables_is_still_rejected(self):
        for content in (text("Company records missing their grid", 200), text("9999999", 200)):
            with self.subTest(content=content), self.assertRaisesRegex(RegisterError, "No supported table on page 2"):
                extract_pdf(pdf_bytes([INTRO+table(), content]), "broken-grid.pdf")

    def test_footer_text_with_an_image_is_not_treated_as_an_empty_page(self):
        image = "q 100 0 0 100 50 300 cm BI /W 1 /H 1 /CS /DeviceGray /BPC 8 /F /AHx ID 00> EI Q\n"
        with self.assertRaisesRegex(RegisterError, "No supported table on page 2"):
            extract_pdf(pdf_bytes([INTRO+table(), image]), "scan-with-footer.pdf")

    def test_footer_only_page_does_not_drop_a_pending_row_continuation(self):
        continuation = table(top=30, values=["", "LLC", "", "", "", ""])
        doc = extract_pdf(pdf_bytes([INTRO+table(), "", continuation]), "continued.pdf")
        self.assertEqual(len(doc["records"]), 1)
        self.assertEqual(doc["records"][0]["name"], "Example Carrier LLC")
        self.assertEqual(doc["records"][0]["pages"], [1, 3])

    def test_wrapped_category_on_same_page_does_not_change_following_category(self):
        prefix, suffix = MEXICO_PRIVATE_PROPERTY.rsplit(" ", 1)
        page = (INTRO+table()+text(prefix, 400)+text(suffix, 414)+table("7654321", 440)
                +text(HHG, 530)+table("3333333", 560))
        doc = extract_pdf(pdf_bytes([page]), "wrapped.pdf")
        self.assertEqual([r["category"] for r in doc["records"]], [PROPERTY, MEXICO_PRIVATE_PROPERTY, HHG])

    def test_heading_wraps_across_page_footer(self):
        prefix, suffix = MEXICO_PRIVATE_PROPERTY.rsplit(" ", 1)
        doc = extract_pdf(pdf_bytes([INTRO+table()+text(prefix, 700), text(suffix, 24)+table("7654321", 60)]), "split.pdf")
        self.assertEqual([r["category"] for r in doc["records"]], [PROPERTY, MEXICO_PRIVATE_PROPERTY])
        self.assertEqual(doc["records"][1]["pages"], [2])
        self.assertEqual(classify([MEXICO_PRIVATE_PROPERTY])[0], "excluded")

    def test_unknown_and_incomplete_categories_are_still_rejected(self):
        with self.assertRaisesRegex(RegisterError, "Unrecognized category"):
            extract_pdf(pdf_bytes([INTRO+table()+text("UNSUPPORTED CARRIER TYPE", 400)+table("7654321", 440)]), "unknown.pdf")
        prefix, _ = MEXICO_PRIVATE_PROPERTY.rsplit(" ", 1)
        with self.assertRaisesRegex(RegisterError, "Incomplete category heading"):
            extract_pdf(pdf_bytes([INTRO+table()+text(prefix, 700)]), "unfinished.pdf")
        with self.assertRaisesRegex(RegisterError, "Incomplete category heading"):
            extract_pdf(pdf_bytes([INTRO+table()+text(prefix, 400)+table("7654321", 440)]), "missing-suffix.pdf")

    def test_mexico_categories_preserve_for_hire_distinction(self):
        self.assertEqual(classify([MEXICO_PROPERTY])[0], "relevant")
        self.assertEqual(classify([MEXICO_PRIVATE_PROPERTY])[0], "excluded")
        self.assertEqual(classify([MEXICO_PRIVATE_PROPERTY, PROPERTY])[0], "relevant")
        self.assertEqual(classify([MEXICO_PROPERTY, HHG], include_movers=False)[0], "relevant")
        doc = extract_pdf(pdf_bytes([INTRO+text(MEXICO_PROPERTY, 200)+table()]), "mexico.pdf")
        self.assertTrue(any("cross-border" in flag for flag in combine([doc])["leads"][0]["flags"]))


SOURCE_DIR = Path.home() / "Downloads" / "August"
SOURCE_CASES = {10: (30, 675), 19: (27, 622), 20: (26, 596), 21: (20, 457), 24: (55, 1323), 26: (25, 587)}


@unittest.skipUnless(all((SOURCE_DIR/f"REGISTER202608{day}.pdf").exists() for day in SOURCE_CASES),
                     "The six reported August register PDFs are not installed")
class ReportedAugustTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.documents = {day: extract_pdf((SOURCE_DIR/f"REGISTER202608{day}.pdf").read_bytes(), f"REGISTER202608{day}.pdf")
                         for day in SOURCE_CASES}

    def test_every_source_dot_matches_independent_position_scan(self):
        for day, doc in self.documents.items():
            with self.subTest(day=day):
                self.assertEqual((doc["pages"], len(doc["records"])), SOURCE_CASES[day])
                expected = collections.Counter()
                with pdfplumber.open(SOURCE_DIR/f"REGISTER202608{day}.pdf") as pdf:
                    for number, page in enumerate(pdf.pages, 1):
                        for word in page.extract_words():
                            if 49 <= word["x0"] <= 51 and word["height"] < 8 and re.fullmatch(r"[1-9]\d{0,9}", word["text"]):
                                expected[(word["text"], number)] += 1
                        page.close()
                actual = collections.Counter((r["dot"], r["pages"][0]) for r in doc["records"])
                self.assertEqual(expected, actual)

    def test_specific_categories_contacts_and_page_transition(self):
        expected = [(19, "9362791", 5, MEXICO_PROPERTY), (20, "845519", 4, MEXICO_PRIVATE_PROPERTY),
                    (21, "9980511", 4, HHG), (24, "6046187", 4, "BROKER OF PROPERTY (EXCEPT HOUSEHOLD GOODS)"),
                    (26, "9711425", 4, MEXICO_PRIVATE_PROPERTY), (26, "4054616", 4, HHG)]
        for day, dot, page, category in expected:
            with self.subTest(day=day, dot=dot):
                record = next(r for r in self.documents[day]["records"] if r["dot"] == dot and page in r["pages"])
                self.assertEqual(record["category"], category)
        private = next(r for r in self.documents[26]["records"] if r["dot"] == "9711425")
        self.assertEqual(private["name"], "Construction World de Mexico SA de CV")
        self.assertEqual(private["phone"], "+1 (619) 454-2740")
        self.assertEqual(private["pages"], [4])
        self.assertIn("Page 30", self.documents[10]["warnings"][0])


if __name__ == "__main__":
    unittest.main()
