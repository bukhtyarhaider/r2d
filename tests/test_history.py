import io
import json
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from unittest.mock import patch

import app
import extractor
from extractor import Cancelled, PROPERTY, RegisterError, combine
from history import History, HistoryError, HistorySelectionError


def document(name="old.pdf", dot="1234567", date="2026-08-06", phone="+1 2223334444"):
    record = dict(dot=dot, name="Example Transport", filing_date="08/05/2026",
                  category=PROPERTY, phone=phone, address="Town, TX 12345 US",
                  officer="A", notice="Application", source=name, pages=[1], register_date=date)
    return dict(filename=name, pages=1, register_date=date, warnings=[], records=[record])


class HistoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / "history.sqlite3"
        self.audit = self.path.with_name("extraction-audit.json")
        self.history = History(self.path, self.audit)

    def test_later_batches_and_restart_preserve_every_source(self):
        old = document()
        self.history.add([old])
        new = document("new.pdf", date="2026-08-07", phone="+1 5553334444")
        result, imported = self.history.add([new, document("other.pdf", "7654321")])
        self.assertEqual((imported["added"], imported["skipped"]), (2, 0))
        self.assertEqual(imported["details"]["new_dots"], 1)
        restored = History(self.path).load()
        self.assertEqual(result, restored)
        self.assertEqual(restored["summary"]["unique"], 2)
        self.assertEqual(restored["summary"]["rows"], 3)
        lead = next(r for r in restored["leads"] if r["dot"] == "1234567")
        self.assertEqual(lead["phone"], new["records"][0]["phone"])
        self.assertEqual({r["source"] for r in lead["evidence"]}, {"old.pdf", "new.pdf"})
        self.assertTrue(any("phone numbers" in flag for flag in lead["flags"]))

    def test_reupload_and_renamed_register_do_not_inflate_history(self):
        original, _ = self.history.add([document()])
        result, imported = self.history.add([document(), document("renamed.pdf")])
        self.assertEqual((imported["added"], imported["skipped"]), (0, 2))
        self.assertEqual(imported["details"]["already_saved"], 2)
        self.assertEqual(original, result)
        # A changed register with the same filename still preserves both versions.
        changed, imported = self.history.add([document(phone="+1 5553334444")])
        self.assertEqual(imported["added"], 1)
        self.assertEqual(changed["summary"]["rows"], 2)

    def test_recovers_legacy_audit_once_without_modifying_it(self):
        audit = json.dumps(combine([document()]))
        self.audit.write_text(audit)
        restored = self.history.load()
        self.assertEqual(restored["summary"]["rows"], 1)
        result, imported = self.history.add([document("renamed.pdf")])
        self.assertEqual(imported["skipped"], 1)
        self.assertEqual(restored, result)
        # A later export is not silently reimported after the one-time migration.
        self.audit.write_text(json.dumps(combine([document("unrelated.pdf", "7654321")])))
        self.assertEqual(History(self.path, self.audit).load(), restored)
        self.audit.write_text(audit)
        self.assertEqual(self.audit.read_text(), audit)

    def test_corrupt_audit_is_not_discarded(self):
        self.audit.write_text("broken export")
        with self.assertRaises(HistoryError):
            self.history.add([document()])
        self.assertEqual(self.audit.read_text(), "broken export")
        # A corrected audit remains eligible for migration after rollback.
        self.audit.write_text(json.dumps(combine([document()])))
        self.assertEqual(self.history.load()["summary"]["rows"], 1)

    def test_bad_batch_rolls_back_every_document(self):
        original, _ = self.history.add([document()])
        bad = document("bad.pdf", "2222222")
        bad["records"][0]["filing_date"] = "invalid"
        with self.assertRaises(HistoryError):
            self.history.add([document("valid.pdf", "3333333"), bad])
        self.assertEqual(History(self.path).load(), original)

    def test_concurrent_imports_do_not_lose_or_duplicate_records(self):
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(lambda i: History(self.path).add([
                document(), document(f"{i}.pdf", str(2000000 + i))]), range(4)))
        result = self.history.load()
        self.assertEqual(result["summary"]["unique"], 5)
        self.assertEqual(result["summary"]["rows"], 5)

    def test_failed_cancelled_and_unsavable_jobs_leave_history_intact(self):
        original, _ = self.history.add([document()])
        for failure in (RegisterError("Unsupported register"), Cancelled()):
            with self.subTest(failure=type(failure).__name__):
                job = {"cancel": threading.Event()}
                files = [("valid.pdf", b"%PDF-"), ("bad.pdf", b"%PDF-")]
                with patch.object(app, "HISTORY", self.history), patch.object(
                        app, "extract_pdf", side_effect=[document("valid.pdf", "3333333"), failure]):
                    app.work(job, files)
                self.assertEqual(job["status"], "cancelled" if isinstance(failure, Cancelled) else "error")
                self.assertEqual(self.history.load(), original)
                self.assertEqual(files, [])
        job = {"cancel": threading.Event()}
        with patch.object(app, "HISTORY", self.history), patch.object(
                app, "extract_pdf", return_value=document("new.pdf", "3333333")), patch.object(
                self.history, "add", side_effect=HistoryError("Disk is full")):
            app.work(job, [("new.pdf", b"%PDF-")])
        self.assertEqual(job["status"], "error")
        self.assertEqual(self.history.load(), original)

    def test_cancellation_after_parsing_does_not_commit(self):
        original, _ = self.history.add([document()])
        job = {"cancel": threading.Event()}

        def parse(*args):
            job["cancel"].set()
            return document("new.pdf", "3333333")

        with patch.object(app, "HISTORY", self.history), patch.object(app, "extract_pdf", side_effect=parse):
            app.work(job, [("new.pdf", b"%PDF-")])
        self.assertEqual(job["status"], "cancelled")
        self.assertEqual(self.history.load(), original)

    def test_cli_exports_accumulate_and_failed_batch_keeps_previous_exports(self):
        pdf = self.path.with_name("input.pdf")
        pdf.write_bytes(b"%PDF-test")
        args = ["extractor.py", str(pdf), "--out", self.temp.name]
        for source in (document(), document("new.pdf", "7654321"), document()):
            with patch("sys.argv", args), patch.object(extractor, "extract_pdf", return_value=source), redirect_stdout(io.StringIO()):
                extractor.main()
        audit = json.loads(self.audit.read_text())
        self.assertEqual(audit["summary"]["rows"], 2)
        self.assertEqual(audit["summary"]["unique"], 2)
        self.assertEqual(self.path.with_name("dot-numbers.txt").read_text().splitlines(), ["1234567", "7654321"])
        before = {p.name: p.read_bytes() for p in self.path.parent.iterdir()}
        with patch("sys.argv", ["extractor.py", str(pdf), str(pdf), "--out", self.temp.name]), patch.object(
                extractor, "extract_pdf", side_effect=[document("valid.pdf", "3333333"),
                                                        RegisterError("Unsupported")]) as parse, redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as error:
                extractor.main()
        self.assertEqual(error.exception.code, 1)
        self.assertEqual(parse.call_count, 2)
        self.assertEqual({p.name: p.read_bytes() for p in self.path.parent.iterdir()}, before)

    def test_delete_dot_removes_all_occurrences_and_restores_after_restart(self):
        original, _ = self.history.add([document(), document("new.pdf", date="2026-08-07"),
                                        document("other.pdf", "7654321")])
        deleted = self.history.delete("dots", ["1234567"])
        self.assertEqual([lead["dot"] for lead in deleted["leads"]], ["7654321"])
        self.assertEqual(deleted["summary"]["rows"], 1)
        self.assertEqual(deleted["trash"][0]["count"], 1)
        self.assertEqual(History(self.path).load(), deleted)
        reimported, imported = self.history.add([document()])
        self.assertEqual(imported["skipped"], 1)
        self.assertEqual(reimported, deleted)
        restored = History(self.path).restore(deleted["trash"][0]["id"])
        self.assertEqual(restored, original)

    def test_delete_register_preserves_shared_dot_and_updates_preferred_contact(self):
        old, new = document(), document("new.pdf", date="2026-08-07", phone="+1 5553334444")
        new["records"].append(document("new.pdf", "7654321", date="2026-08-07")["records"][0])
        original, _ = self.history.add([old, new])
        key = next(d["id"] for d in original["documents"] if d["filename"] == "new.pdf")
        deleted = self.history.delete("documents", [key])
        self.assertEqual(deleted["summary"]["unique"], 1)
        self.assertEqual(deleted["leads"][0]["phone"], old["records"][0]["phone"])
        self.assertEqual(deleted["leads"][0]["occurrences"], 1)
        self.assertEqual(len(deleted["documents"]), 1)
        self.assertEqual(self.history.add([new])[0], deleted)
        # New imports after the deletion must survive an undo.
        self.history.add([document("later.pdf", "3333333")])
        restored = self.history.restore(deleted["trash"][0]["id"])
        self.assertEqual(restored["summary"]["unique"], 3)
        self.assertEqual(restored["summary"]["rows"], 4)

    def test_bulk_deletion_only_removes_requested_dots(self):
        self.history.add([document(), document("two.pdf", "7654321"), document("three.pdf", "3333333")])
        result = self.history.delete("dots", ["1234567", "7654321", "7654321"])
        self.assertEqual([r["dot"] for r in result["leads"]], ["3333333"])
        self.assertEqual(result["trash"][0]["count"], 2)
        # An overlapping, stale selection cannot partially delete the remaining DOT.
        with self.assertRaises(HistorySelectionError):
            self.history.delete("dots", ["1234567", "3333333"])
        self.assertEqual(self.history.load(), result)

    def test_empty_history_remains_deleted_with_legacy_export_and_restorable(self):
        self.audit.write_text(json.dumps(combine([document()])))
        original = self.history.load()
        deleted = self.history.delete("documents", [original["documents"][0]["id"]])
        self.assertEqual(deleted["summary"]["unique"], 0)
        self.assertEqual(deleted["documents"], [])
        self.assertEqual(History(self.path, self.audit).load(), deleted)
        restored = self.history.restore(deleted["trash"][0]["id"])
        self.assertEqual(restored, original)
        with self.assertRaises(HistorySelectionError):
            self.history.restore(deleted["trash"][0]["id"])

    def test_independent_dot_and_register_deletions_restore_independently(self):
        original, _ = self.history.add([document(), document("new.pdf", date="2026-08-07")])
        dot_deleted = self.history.delete("dots", ["1234567"])
        both_deleted = self.history.delete("documents", [original["documents"][0]["id"]])
        doc_action = both_deleted["trash"][0]["id"]
        # Restoring one register does not undo a separate DOT deletion.
        restored_doc = self.history.restore(doc_action)
        self.assertEqual(restored_doc["summary"]["unique"], 0)
        restored_all = self.history.restore(dot_deleted["trash"][0]["id"])
        self.assertEqual(restored_all, original)

    def test_import_receipt_distinguishes_trashed_pdfs_and_deleted_dots(self):
        original, _ = self.history.add([document()])
        self.history.delete("dots", ["1234567"])
        hidden, imported = self.history.add([document("another.pdf", date="2026-08-07")])
        self.assertEqual(imported["added"], 1)
        self.assertEqual(imported["details"]["new_dots"], 0)
        self.assertEqual(imported["details"]["hidden_occurrences"], 1)
        self.history.delete("documents", [original["documents"][0]["id"]])
        result, imported = self.history.add([document()])
        self.assertEqual(imported["details"]["in_trash"], 1)
        self.assertEqual(imported["details"]["already_saved"], 0)
        self.assertEqual(result["library"], {"saved_registers":2, "active_registers":1,
                                            "trashed_registers":1, "deleted_dots":1})
        self.assertEqual(result["summary"]["unique"], 0)

    def test_history_can_grow_beyond_reported_stalled_total(self):
        source = document()
        base = source["records"][0]
        source["records"] = [dict(base, dot=str(1000000+i), name=f"Carrier {i}") for i in range(9000)]
        result, imported = self.history.add([source])
        self.assertEqual(result["summary"]["unique"], 9000)
        self.assertEqual(imported["details"]["new_dots"], 9000)
        result, imported = self.history.add([document("new.pdf", "7654321")])
        self.assertEqual(result["summary"]["unique"], 9001)
        self.assertEqual(imported["details"]["new_dots"], 1)

    def test_revision_stays_stable_on_reads_and_changes_after_save(self):
        self.history.load()
        initial = self.history.revision()
        self.history.load()
        self.assertEqual(initial, self.history.revision())
        self.history.add([document()])
        updated = self.history.revision()
        self.assertNotEqual(initial, updated)
        self.history.add([document()])
        self.assertEqual(updated, self.history.revision())


if __name__ == "__main__":
    unittest.main()
