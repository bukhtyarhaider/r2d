"""Transactional local extraction history, shared by the browser and CLI."""
from __future__ import annotations

import hashlib
import json
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from extractor import RegisterError, combine


class HistoryError(RegisterError):
    pass


class HistorySelectionError(RegisterError):
    pass


def document_key(document):
    # Source names can change when the same register is downloaded again.
    records = [{k: v for k, v in record.items() if k != "source"}
               for record in document["records"]]
    content = {"pages": document["pages"], "register_date": document.get("register_date", ""),
               "records": sorted(records, key=lambda r: json.dumps(r, sort_keys=True))}
    return hashlib.sha256(json.dumps(content, sort_keys=True).encode()).hexdigest()


def documents_from_audit(audit):
    """Recover original occurrences from an earlier full audit export."""
    documents = []
    remaining = [record for lead in audit["leads"] for record in lead["evidence"]]
    for metadata in audit["documents"]:
        records = [r for r in remaining if r["source"] == metadata["filename"]
                   and r["register_date"] == metadata.get("register_date", "")]
        if not records and metadata.get("record_count") != 0:
            raise ValueError("Audit has missing or ambiguous document evidence")
        documents.append({**metadata, "records": records})
        remaining = [r for r in remaining if r not in records]
    if remaining or sum(len(d["records"]) for d in documents) != audit["summary"]["rows"]:
        raise ValueError("Audit evidence does not match its receipt")
    # Validate before persisting anything; never discard a damaged audit silently.
    combine(documents)
    return documents


class History:
    def __init__(self, path: Path, legacy_audit: Path | None = None):
        self.path = Path(path)
        self.legacy_audit = legacy_audit

    @contextmanager
    def transaction(self):
        connection = None
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            connection = sqlite3.connect(self.path, timeout=30)
            connection.execute("BEGIN IMMEDIATE")
            connection.execute("CREATE TABLE IF NOT EXISTS documents ("
                               "key TEXT PRIMARY KEY, content TEXT NOT NULL)")
            connection.execute("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY)")
            connection.execute("CREATE TABLE IF NOT EXISTS trash (id TEXT PRIMARY KEY, "
                               "kind TEXT NOT NULL, targets TEXT NOT NULL, label TEXT NOT NULL, "
                               "deleted_at TEXT NOT NULL)")
            if not connection.execute("SELECT 1 FROM settings WHERE key='legacy-imported'").fetchone():
                if self.legacy_audit and self.legacy_audit.exists():
                    audit = json.loads(self.legacy_audit.read_text(encoding="utf-8-sig"))
                    for document in documents_from_audit(audit):
                        self.insert(connection, document)
                connection.execute("INSERT INTO settings VALUES ('legacy-imported')")
            yield connection
            connection.commit()
        except Exception as error:
            if connection:
                connection.rollback()
            if isinstance(error, HistorySelectionError):
                raise
            raise HistoryError("Could not read or save local history. Existing history and audit files "
                               "were left intact. Check that the output folder is writable and "
                               "the history database and extraction-audit.json are valid.") from error
        finally:
            if connection:
                connection.close()

    @staticmethod
    def insert(connection, document):
        return connection.execute("INSERT OR IGNORE INTO documents VALUES (?, ?)",
                                  (document_key(document), json.dumps(document))).rowcount

    @staticmethod
    def result(connection, include_movers=True):
        trash, hidden = [], {"dots": set(), "documents": set()}
        for key, kind, targets, label, deleted_at in connection.execute(
                "SELECT id, kind, targets, label, deleted_at FROM trash ORDER BY rowid DESC"):
            targets = json.loads(targets)
            hidden[kind].update(targets)
            trash.append(dict(id=key, kind=kind, label=label, count=len(targets), deleted_at=deleted_at))
        documents = []
        for key, content in connection.execute("SELECT key, content FROM documents ORDER BY rowid"):
            if key in hidden["documents"]:
                continue
            document = json.loads(content)
            document["records"] = [r for r in document["records"] if r["dot"] not in hidden["dots"]]
            document.update(id=key, record_count=len(document["records"]))
            documents.append(document)
        result = combine(documents, include_movers)
        result["trash"] = trash
        return result

    def load(self, include_movers=True):
        with self.transaction() as connection:
            return self.result(connection, include_movers)

    def add(self, documents, include_movers=True):
        with self.transaction() as connection:
            added = sum(self.insert(connection, document) for document in documents)
            result = self.result(connection, include_movers)
        return result, {"added": added, "skipped": len(documents) - added}

    def delete(self, kind, targets):
        if kind not in ("dots", "documents") or not targets:
            raise HistorySelectionError("Choose DOT records or saved registers to delete.")
        targets = sorted(set(targets))
        with self.transaction() as connection:
            current = self.result(connection)
            if kind == "dots":
                available = {r["dot"]: r for r in current["leads"]}
                label = (f"USDOT {targets[0]} · {available[targets[0]]['name']}"
                         if len(targets) == 1 and targets[0] in available else f"{len(targets)} DOT records")
            else:
                available = {d["id"]: d for d in current["documents"]}
                label = (available[targets[0]]["filename"] if len(targets) == 1 and targets[0] in available
                         else f"{len(targets)} saved registers")
            if any(target not in available for target in targets):
                raise HistorySelectionError("These items changed or were already deleted. Reload history and try again.")
            connection.execute("INSERT INTO trash VALUES (?, ?, ?, ?, ?)",
                               (uuid.uuid4().hex, kind, json.dumps(targets), label,
                                datetime.now(timezone.utc).isoformat()))
            return self.result(connection)

    def restore(self, key):
        with self.transaction() as connection:
            if not connection.execute("DELETE FROM trash WHERE id=?", (key,)).rowcount:
                raise HistorySelectionError("This deletion was already restored. Reload history and try again.")
            return self.result(connection)
