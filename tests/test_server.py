import json
import threading
import unittest
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer

import app


class LocalServerTests(unittest.TestCase):
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

    def test_unknown_routes_and_expired_job(self):
        self.assertEqual(self.request("GET", "/../../app.py")[0], 404)
        self.assertEqual(self.request("GET", "/api/jobs/missing")[0], 404)
        with app.LOCK:
            app.JOBS["expired-test"] = {"status":"complete", "created":0}
        self.assertEqual(self.request("GET", "/api/jobs/expired-test")[0], 404)


if __name__ == "__main__":
    unittest.main()
