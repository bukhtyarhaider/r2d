import json
import tempfile
import threading
import time
import unittest
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

import app
from history import History
from test_history import document


class LocalServerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.history = History(Path(self.temp.name) / "history.sqlite3")
        self.history_patch = patch.object(app, "HISTORY", self.history)
        self.history_patch.start()
        self.addCleanup(self.history_patch.stop)

    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), app.Handler)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.port = cls.server.server_port

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def request(self, method, path, body=None, headers=None):
        connection = HTTPConnection("127.0.0.1", self.port, timeout=5)
        connection.request(method, path, body, headers or {})
        response = connection.getresponse()
        status, payload = response.status, response.read()
        connection.close()
        return status, payload

    def test_serves_ui_and_session(self):
        status, body = self.request("GET", "/")
        self.assertEqual(status, 200)
        self.assertIn(b"Dispatch Register", body)
        status, body = self.request("GET", "/api/session")
        self.assertEqual(json.loads(body)["token"], app.TOKEN)

    def test_rejects_foreign_origins_and_missing_token(self):
        self.assertEqual(self.request("POST", "/api/jobs")[0], 403)
        self.assertEqual(self.request("POST", "/api/jobs", headers={
            "X-Session-Token": app.TOKEN, "Origin":"https://example.com"})[0], 403)
        self.assertEqual(self.request("GET", "/", headers={"Host":"example.com"})[0], 403)

    def test_invalid_upload_and_size_are_actionable(self):
        headers = {"X-Session-Token": app.TOKEN, "Content-Type":"multipart/form-data; boundary=test"}
        status, body = self.request("POST", "/api/jobs", b"--test--\r\n", headers)
        self.assertEqual(status, 400)
        self.assertIn("Choose between", json.loads(body)["error"])
        status, _ = self.request("POST", "/api/jobs", headers={**headers, "Content-Length":str(app.MAX_BODY + 1)})
        self.assertEqual(status, 413)

    def test_upload_body_accepts_doubled_limit_and_rejects_overflow_before_reading(self):
        self.assertEqual(app.MAX_BODY, 200 * 1024 * 1024)
        handler = object.__new__(app.Handler)
        handler.server = SimpleNamespace(server_port=self.port)
        handler.path = "/api/jobs"
        handler.headers = {"Host": f"127.0.0.1:{self.port}", "X-Session-Token": app.TOKEN,
                           "Content-Type": "multipart/form-data; boundary=test"}
        handler.connection = Mock()
        handler.rfile = Mock()
        handler.rfile.read.return_value = b""
        handler.send = Mock()
        with patch.dict(app.JOBS, {}, clear=True):
            for size in (100 * 1024 * 1024 + 1, app.MAX_BODY):
                handler.headers["Content-Length"] = str(size)
                handler.do_POST()
                handler.rfile.read.assert_called_once_with(size)
                handler.send.assert_called_once_with(400, {"error": "Incomplete upload. Please try again."})
                handler.rfile.read.reset_mock()
                handler.send.reset_mock()
            handler.headers["Content-Length"] = str(app.MAX_BODY + 1)
            handler.do_POST()
            handler.rfile.read.assert_not_called()
            self.assertEqual(handler.send.call_args.args[0], 413)
            self.assertIn("200 MB", handler.send.call_args.args[1]["error"])

    def test_forty_pdf_batch_is_saved_and_forty_one_is_rejected(self):
        def multipart(count):
            return b"".join(
                (f'--test\r\nContent-Disposition: form-data; name="files"; filename="{index}.pdf"\r\n'
                 'Content-Type: application/pdf\r\n\r\n%PDF-test\r\n').encode()
                for index in range(count)) + b"--test--\r\n"

        headers = {"X-Session-Token": app.TOKEN, "Content-Type": "multipart/form-data; boundary=test"}
        with patch.dict(app.JOBS, {}, clear=True), patch.object(app, "extract_pdf", side_effect=
                lambda data, name, *args: document(name, str(1000000 + int(name[:-4])))) as extract:
            status, payload = self.request("POST", "/api/jobs", multipart(41), headers)
            self.assertEqual(status, 400)
            self.assertIn("40 PDFs", json.loads(payload)["error"])
            extract.assert_not_called()
            status, payload = self.request("POST", "/api/jobs", multipart(40), headers)
            self.assertEqual(status, 202)
            key = json.loads(payload)["id"]
            for _ in range(100):
                _, payload = self.request("GET", f"/api/jobs/{key}")
                job = json.loads(payload)
                if job["status"] != "running":
                    break
                time.sleep(0.01)
            self.assertEqual(job["status"], "complete")
            self.assertEqual(job["file_count"], 40)
            self.assertEqual(job["imported"]["added"], 40)
            self.assertEqual(self.history.load()["summary"]["unique"], 40)

    def test_unknown_routes_and_expired_job(self):
        self.assertEqual(self.request("GET", "/../../app.py")[0], 404)
        self.assertEqual(self.request("GET", "/api/jobs/missing")[0], 404)
        with app.LOCK:
            app.JOBS["expired-test"] = {"status":"complete", "created":0}
        self.assertEqual(self.request("GET", "/api/jobs/expired-test")[0], 404)

    def test_history_survives_new_jobs_forget_and_job_expiry(self):
        self.history.add([document()])
        headers = {"X-Session-Token": app.TOKEN, "Content-Type": "multipart/form-data; boundary=test"}
        body = (b'--test\r\nContent-Disposition: form-data; name="files"; filename="new.pdf"\r\n'
                b'Content-Type: application/pdf\r\n\r\n%PDF-test\r\n--test--\r\n')
        with patch.object(app, "extract_pdf", return_value=document("new.pdf", "7654321")):
            status, payload = self.request("POST", "/api/jobs", body, headers)
            self.assertEqual(status, 202)
            key = json.loads(payload)["id"]
            for _ in range(100):
                _, payload = self.request("GET", f"/api/jobs/{key}")
                job = json.loads(payload)
                if job["status"] != "running":
                    break
                time.sleep(0.01)
        self.assertEqual(job["status"], "complete")
        self.assertEqual(job["summary"]["unique"], 2)
        self.assertNotIn("result", job)
        self.assertEqual((job["imported"]["added"], job["imported"]["skipped"]), (1, 0))
        self.assertEqual(job["imported"]["details"]["new_dots"], 1)
        self.assertEqual(self.request("POST", f"/api/jobs/{key}/forget", headers=headers)[0], 200)
        self.assertEqual(self.request("GET", f"/api/jobs/{key}")[0], 404)
        status, payload = self.request("GET", "/api/history")
        self.assertEqual(status, 200)
        history = json.loads(payload)
        self.assertEqual(history["result"]["summary"]["unique"], 2)
        self.assertIsNone(history["active_job"])
        self.assertEqual(History(self.history.path).load(), history["result"])

    def test_history_storage_error_is_visible(self):
        from history import HistoryError
        with patch.object(self.history, "load", side_effect=HistoryError("History is unavailable")):
            status, payload = self.request("GET", "/api/history")
        self.assertEqual(status, 500)
        self.assertEqual(json.loads(payload)["error"], "History is unavailable")

    def test_history_deletion_and_restore_require_local_session(self):
        original, _ = self.history.add([document(), document("other.pdf", "7654321")])
        headers = {"X-Session-Token": app.TOKEN, "Content-Type": "application/json"}
        body = json.dumps({"kind": "dots", "targets": ["1234567"]})
        self.assertEqual(self.request("POST", "/api/history/delete", body)[0], 403)
        self.assertEqual(self.request("POST", "/api/history/delete", body,
                                      {**headers, "Origin": "https://example.com"})[0], 403)
        self.assertEqual(self.history.load(), original)
        status, payload = self.request("POST", "/api/history/delete", body, headers)
        self.assertEqual(status, 200)
        deleted = json.loads(payload)["result"]
        self.assertEqual(deleted["summary"]["unique"], 1)
        self.assertEqual(self.request("POST", "/api/history/delete", body, headers)[0], 409)
        restore = json.dumps({"id": deleted["trash"][0]["id"]})
        status, payload = self.request("POST", "/api/history/restore", restore, headers)
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(payload)["result"], original)

    def test_completed_receipts_do_not_block_uploads(self):
        completed = {f"receipt-{i}": {"status":"complete", "created":time.monotonic()+i} for i in range(12)}
        headers = {"X-Session-Token":app.TOKEN, "Content-Type":"multipart/form-data; boundary=test"}
        with patch.dict(app.JOBS, completed, clear=True):
            status, payload = self.request("POST", "/api/jobs", b"--test--\r\n", headers)
            self.assertEqual(status, 400)
            self.assertIn("Choose between", json.loads(payload)["error"])
            self.assertLessEqual(len(app.JOBS), 9)

    def test_slow_save_keeps_activity_and_progress_responsive(self):
        entered, release = threading.Event(), threading.Event()
        job = {"status":"running", "created":time.monotonic(), "updated":time.monotonic(),
               "cancel":threading.Event(), "file_count":1}
        original_add = self.history.add

        def slow_add(documents):
            entered.set()
            if not release.wait(5):
                raise RuntimeError("Test did not release the save")
            return original_add(documents)

        with patch.dict(app.JOBS, {"slow-save":job}, clear=True), patch.object(
                app, "extract_pdf", return_value=document()), patch.object(self.history, "add", side_effect=slow_add):
            worker = threading.Thread(target=app.work, args=(job, [("old.pdf", b"%PDF-")]), daemon=True)
            worker.start()
            try:
                self.assertTrue(entered.wait(2))
                start = time.monotonic()
                status, payload = self.request("GET", "/api/activity")
                self.assertEqual(status, 200)
                self.assertLess(time.monotonic()-start, 1)
                self.assertEqual(json.loads(payload)["latest_job"]["phase"], "saving")
                status, payload = self.request("GET", "/api/jobs/slow-save")
                self.assertEqual(json.loads(payload)["phase"], "saving")
                self.assertLess(len(payload), 2048)
                status, _ = self.request("POST", "/api/jobs/slow-save/cancel", headers={"X-Session-Token":app.TOKEN})
                self.assertEqual(status, 409)
                self.assertFalse(job["cancel"].is_set())
            finally:
                release.set()
                worker.join(2)
            self.assertEqual(job["status"], "complete")
            self.assertEqual(job["summary"]["unique"], 1)
            self.assertNotIn("result", job)

    def test_activity_revision_changes_with_history(self):
        self.history.load()
        status, payload = self.request("GET", "/api/activity")
        self.assertEqual(status, 200)
        before = json.loads(payload)
        self.history.add([document()])
        _, payload = self.request("GET", "/api/activity")
        self.assertNotEqual(json.loads(payload)["revision"], before["revision"])

    def test_invalid_history_mutations_and_running_job_leave_history_intact(self):
        original, _ = self.history.add([document()])
        headers = {"X-Session-Token": app.TOKEN, "Content-Type": "application/json"}
        for body in ("bad json", "null", "[]", '{"kind":"everything","targets":["1234567"]}',
                     '{"kind":"dots","targets":[1234567]}', '{"kind":"dots","targets":[]}'):
            self.assertEqual(self.request("POST", "/api/history/delete", body, headers)[0], 400)
        self.assertEqual(self.request("POST", "/api/history/restore", '{"id":1}', headers)[0], 400)
        app.JOBS["running-delete-test"] = {"status": "running"}
        try:
            body = json.dumps({"kind": "dots", "targets": ["1234567"]})
            self.assertEqual(self.request("POST", "/api/history/delete", body, headers)[0], 409)
        finally:
            app.JOBS.pop("running-delete-test")
        self.assertEqual(self.history.load(), original)


if __name__ == "__main__":
    unittest.main()
