"""Local-only UI for Dispatch Register. Developer: Bukhtyar Haider. Run: python app.py"""
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

from extractor import Cancelled, RegisterError, extract_pdf
from history import History, HistoryError, HistorySelectionError

ROOT = Path(__file__).resolve().parent
TOKEN = secrets.token_urlsafe(32)
JOBS: dict = {}
LOCK = threading.RLock()
MAX_FILES = 40
MAX_BODY = 200 * 1024 * 1024
TTL = 3600
HISTORY = History(ROOT / "output" / "history.sqlite3", ROOT / "output" / "extraction-audit.json")


def job_snapshot(job):
    now = time.monotonic()
    result = {k: v for k, v in job.items() if k not in ("cancel", "created", "updated", "result")}
    result.update(elapsed_seconds=round(now - job.get("created", now), 1),
                  idle_seconds=round(now - job.get("updated", job.get("created", now)), 1))
    return result


def trim_jobs():
    # Job receipts are temporary; completed receipts must never block new imports.
    terminal = sorted((key for key, job in JOBS.items() if job["status"] != "running"),
                      key=lambda key: JOBS[key]["created"], reverse=True)
    for key in terminal[9:]:
        JOBS.pop(key, None)


def work(job, files):
    documents = []
    try:
        for index, (filename, data) in enumerate(files):
            def progress(page, pages, name):
                with LOCK:
                    job.update(file=name, file_index=index + 1, page=page, pages=pages,
                               phase="reading", updated=time.monotonic(),
                               message=f"Reading {name} · page {page} of {pages}")
            document = extract_pdf(data, filename, progress, job["cancel"].is_set)
            documents.append(document)
        with LOCK:
            if job["cancel"].is_set():
                raise Cancelled()
            job.update(phase="saving", updated=time.monotonic(), message="Saving records to local history…")
        # Leave progress requests responsive during a potentially large database save.
        # Cancellation is rejected once this atomic commit phase has started.
        result, imported = HISTORY.add(documents)
        with LOCK:
            job.update(status="complete", phase="complete", updated=time.monotonic(),
                       summary=result["summary"], imported=imported,
                       message="Extraction saved to local history")
    except Cancelled:
        with LOCK:
            job.update(status="cancelled", phase="cancelled", updated=time.monotonic(),
                       message="Extraction cancelled. Select Extract to try again.")
    except Exception as error:
        with LOCK:
            message = str(error) if isinstance(error, RegisterError) else "The PDF could not be read. It may be damaged or encrypted."
            job.update(status="error", phase="error", updated=time.monotonic(),
                       message=f"{filename}: {message} No records from this batch were added; earlier history is unchanged.")
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
        if path == "/api/activity":
            with LOCK:
                active = next((key for key, job in JOBS.items() if job["status"] == "running"), None)
                latest = max(JOBS, key=lambda key: JOBS[key]["created"], default=None)
                snapshot = {"active_job": active,
                            "latest_job": {"id": latest, **job_snapshot(JOBS[latest])} if latest else None}
            snapshot["revision"] = HISTORY.revision()
            return self.send(200, snapshot)
        if path == "/api/history":
            try:
                revision = HISTORY.revision()
                result = HISTORY.load()
                with LOCK:
                    active = next((key for key, job in JOBS.items() if job["status"] == "running"), None)
                return self.send(200, {"result": result, "active_job": active, "revision": revision})
            except HistoryError as error:
                return self.send(500, {"error": str(error)})
        if path.startswith("/api/jobs/"):
            key = path.rsplit("/", 1)[-1]
            with LOCK:
                job = JOBS.get(key)
                if job and job["status"] != "running" and time.monotonic() - job["created"] > TTL:
                    del JOBS[key]
                    job = None
                if not job:
                    return self.send(404, {"error": "This extraction session expired. Saved records are still in local history; refresh to reload them."})
                return self.send(200, job_snapshot(job))
        if path == "/":
            path = "/index.html"
        safe_rel = Path(path.lstrip("/"))
        target = (ROOT / "static" / safe_rel).resolve()
        static_root = (ROOT / "static").resolve()
        if not target.is_relative_to(static_root) or not target.is_file():
            return self.send(404, {"error": "Not found"})
        ext_to_mime = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".svg": "image/svg+xml",
            ".json": "application/json",
            ".png": "image/png",
            ".ico": "image/x-icon",
            ".woff2": "font/woff2",
        }
        mime = ext_to_mime.get(target.suffix, "application/octet-stream")
        self.send(200, target.read_bytes(), mime)

    def do_POST(self):
        if not self.valid_host() or self.headers.get("X-Session-Token") != TOKEN:
            return self.send(403, {"error": "Refresh this local page and try again."})
        origin = self.headers.get("Origin")
        if origin and origin != "http://" + self.headers["Host"]:
            return self.send(403, {"error": "Local page access only."})
        path = urlsplit(self.path).path
        if path in ("/api/history/delete", "/api/history/restore"):
            try:
                size = int(self.headers.get("Content-Length", "0"))
                if not 0 < size <= 2 * 1024 * 1024:
                    raise ValueError()
                self.connection.settimeout(30)
                data = json.loads(self.rfile.read(size))
                if not isinstance(data, dict):
                    raise ValueError()
                if path.endswith("/delete"):
                    kind, targets = data.get("kind"), data.get("targets")
                    if kind not in ("dots", "documents") or not isinstance(targets, list) or not targets or not all(
                            isinstance(target, str) and 0 < len(target) <= 64 for target in targets):
                        raise ValueError()
                elif not isinstance(data.get("id"), str) or len(data["id"]) != 32:
                    raise ValueError()
            except (ValueError, TypeError, OSError):
                return self.send(400, {"error": "Choose valid saved records to delete or restore."})
            try:
                with LOCK:
                    if any(job["status"] == "running" for job in JOBS.values()):
                        return self.send(409, {"error": "Wait for the current extraction or cancel it before changing history."})
                    result = HISTORY.delete(kind, targets) if path.endswith("/delete") else HISTORY.restore(data["id"])
                return self.send(200, {"result": result})
            except HistorySelectionError as error:
                return self.send(409, {"error": str(error)})
            except HistoryError as error:
                return self.send(500, {"error": str(error)})
        if path.endswith("/cancel") or path.endswith("/forget"):
            key = path.split("/")[-2]
            with LOCK:
                job = JOBS.get(key)
                if job:
                    if job["status"] == "running" and job.get("phase") == "saving":
                        return self.send(409, {"error": "The complete batch is being saved. Wait for the save to finish; it cannot be cancelled midway."})
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
            trim_jobs()
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            size = 0
        if not 0 < size <= MAX_BODY:
            return self.send(413, {"error": "Choose PDFs totaling under 200 MB, including upload headers."})
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
            if not 1 <= len(files) <= MAX_FILES:
                raise ValueError(f"Choose between 1 and {MAX_FILES} PDFs.")
        except Exception as error:
            return self.send(400, {"error": str(error) if isinstance(error, ValueError) else "Unable to read this upload."})
        key = secrets.token_urlsafe(16)
        job = {"status": "running", "phase": "queued", "message": "Preparing PDFs…", "file_count": len(files),
               "file_index": 0, "page": 0, "pages": 0, "cancel": threading.Event(),
               "created": time.monotonic(), "updated": time.monotonic()}
        with LOCK:
            # Recheck after reading the upload so competing requests cannot run together.
            if any(j["status"] == "running" for j in JOBS.values()):
                return self.send(409, {"error": "Another extraction has just started. Try again when it finishes."})
            JOBS[key] = job
        threading.Thread(target=work, args=(job, files), daemon=True).start()
        self.send(202, {"id": key})


def main():
    parser = argparse.ArgumentParser(description="Local dispatch prospect extractor · Developer: Bukhtyar Haider")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    except OSError as error:
        parser.exit(1, f"Could not start: {error}. Try --port 8766.\n")
    print(f"Dispatch Register · Developed by Bukhtyar Haider\nReady at http://127.0.0.1:{server.server_port}\nPress Ctrl+C to stop.", flush=True)
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
