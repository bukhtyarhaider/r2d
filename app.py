"""Local-only UI for Dispatch Register. Run: python app.py"""
from __future__ import annotations

import argparse
import json
import secrets
import threading
import time
import webbrowser
from email.parser import BytesParser
from email.policy import default
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from extractor import Cancelled, RegisterError, combine, extract_pdf

ROOT = Path(__file__).resolve().parent
TOKEN = secrets.token_urlsafe(32)
JOBS: dict = {}
LOCK = threading.RLock()
MAX_BODY = 100 * 1024 * 1024
TTL = 3600


def work(job, files):
    documents = []
    try:
        for index, (filename, data) in enumerate(files):
            def progress(page, pages, name):
                with LOCK:
                    job.update(file=name, file_index=index + 1, page=page, pages=pages,
                               message=f"Reading {name} · page {page} of {pages}")
            document = extract_pdf(data, filename, progress, job["cancel"].is_set)
            documents.append(document)
        if job["cancel"].is_set():
            raise Cancelled()
        result = combine(documents)
        with LOCK:
            job.update(status="complete", result=result, message="Extraction complete")
    except Cancelled:
        with LOCK:
            job.update(status="cancelled", message="Extraction cancelled. Select Extract to try again.")
    except Exception as error:
        with LOCK:
            message = str(error) if isinstance(error, RegisterError) else "The PDF could not be read. It may be damaged or encrypted."
            job.update(status="error", message=f"{filename}: {message} No partial results were exported.")
    finally:
        files.clear()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Do not write lead data or filenames to server logs.

    def send(self, status, body, content_type="application/json"):
        if isinstance(body, (dict, list)):
            body = json.dumps(body).encode()
        elif isinstance(body, str):
            body = body.encode()
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
        self.end_headers()
        self.wfile.write(body)

    def valid_host(self):
        port = self.server.server_port
        return self.headers.get("Host") in (f"127.0.0.1:{port}", f"localhost:{port}")

    def do_GET(self):
        if not self.valid_host():
            return self.send(403, {"error": "Local access only."})
        path = urlsplit(self.path).path
        if path == "/api/session":
            return self.send(200, {"token": TOKEN})
        if path.startswith("/api/jobs/"):
            key = path.rsplit("/", 1)[-1]
            with LOCK:
                job = JOBS.get(key)
                if job and job["status"] != "running" and time.monotonic() - job["created"] > TTL:
                    del JOBS[key]
                    job = None
                if not job:
                    return self.send(404, {"error": "This session expired. Extract the PDFs again."})
                return self.send(200, {k: v for k, v in job.items() if k not in ("cancel", "created")})
        asset = {"/": "index.html", "/styles.css": "styles.css", "/app.js": "app.js"}.get(path)
        if not asset:
            return self.send(404, {"error": "Not found"})
        mime = {"index.html": "text/html; charset=utf-8", "styles.css": "text/css; charset=utf-8",
                "app.js": "text/javascript; charset=utf-8"}[asset]
        self.send(200, (ROOT / "static" / asset).read_bytes(), mime)

    def do_POST(self):
        if not self.valid_host() or self.headers.get("X-Session-Token") != TOKEN:
            return self.send(403, {"error": "Refresh this local page and try again."})
        origin = self.headers.get("Origin")
        if origin and origin != "http://" + self.headers["Host"]:
            return self.send(403, {"error": "Local page access only."})
        path = urlsplit(self.path).path
        if path.endswith("/cancel") or path.endswith("/forget"):
            key = path.split("/")[-2]
            with LOCK:
                job = JOBS.get(key)
                if job:
                    job["cancel"].set()
                    if path.endswith("/forget"):
                        JOBS.pop(key)
            return self.send(200, {"ok": True})
        if path != "/api/jobs":
            return self.send(404, {"error": "Not found"})
        with LOCK:
            for key in list(JOBS):
                if time.monotonic() - JOBS[key]["created"] > TTL and JOBS[key]["status"] != "running":
                    del JOBS[key]
            if any(job["status"] == "running" for job in JOBS.values()):
                return self.send(409, {"error": "An extraction is already running. Wait for it or cancel it first."})
            if len(JOBS) >= 10:
                return self.send(429, {"error": "Clear an earlier session or restart the tool before adding more PDFs."})
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            size = 0
        if not 0 < size <= MAX_BODY:
            return self.send(413, {"error": "Choose PDFs totaling under 100 MB."})
        content_type = self.headers.get("Content-Type", "")
        if not content_type.startswith("multipart/form-data;") or "\r" in content_type or "\n" in content_type:
            return self.send(400, {"error": "Upload PDF files using the file picker."})
        self.connection.settimeout(30)
        try:
            body = self.rfile.read(size)
            if len(body) != size:
                raise ValueError("Incomplete upload. Please try again.")
            message = BytesParser(policy=default).parsebytes(
                (f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n").encode() + body)
            files = []
            for part in message.iter_parts():
                if part.get_param("name", header="content-disposition") != "files":
                    continue
                filename = Path((part.get_filename() or "").replace("\\", "/")).name
                data = part.get_payload(decode=True) or b""
                if not filename.lower().endswith(".pdf") or not data.startswith(b"%PDF-"):
                    raise ValueError("Every selected file must be a valid PDF.")
                if len(data) > 25 * 1024 * 1024:
                    raise ValueError(f"{filename}: each PDF must be under 25 MB.")
                files.append((filename, data))
            if not 1 <= len(files) <= 20:
                raise ValueError("Choose between 1 and 20 PDFs.")
        except Exception as error:
            return self.send(400, {"error": str(error) if isinstance(error, ValueError) else "Unable to read this upload."})
        key = secrets.token_urlsafe(16)
        job = {"status": "running", "message": "Preparing PDFs…", "file_count": len(files),
               "file_index": 0, "page": 0, "pages": 0, "cancel": threading.Event(),
               "created": time.monotonic()}
        with LOCK:
            # Recheck after reading the upload so competing requests cannot run together.
            if any(j["status"] == "running" for j in JOBS.values()):
                return self.send(409, {"error": "Another extraction has just started. Try again when it finishes."})
            JOBS[key] = job
        threading.Thread(target=work, args=(job, files), daemon=True).start()
        self.send(202, {"id": key})


def main():
    parser = argparse.ArgumentParser(description="Local dispatch prospect extractor")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    except OSError as error:
        parser.exit(1, f"Could not start: {error}. Try --port 8766.\n")
    print(f"Dispatch Register is ready at http://127.0.0.1:{server.server_port}\nPress Ctrl+C to stop.", flush=True)
    if not args.no_browser:
        threading.Timer(0.4, lambda: webbrowser.open(f"http://127.0.0.1:{server.server_port}")).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
