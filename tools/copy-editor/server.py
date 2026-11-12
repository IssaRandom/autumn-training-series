"""Copy editor for the /beta site: review, edit or delete every phrase in one table.

    python tools/copy-editor/server.py        then open http://localhost:8781

Edits are written straight into the source files (exact spans only). "Undo last save" puts the files back.
The site itself is served at /site/ so "View" links work without another server.
"""
import datetime, http.server, json, re, socketserver, subprocess, sys, urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import extract as X  # noqa: E402

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8781
STATE = HERE / "reviewed.json"   # phrases you ticked "Keep" (kept between sessions)
UNDO = HERE / ".undo.json"       # file contents from before the last save


def load_kept():
    try:
        return json.loads(STATE.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_kept(d):
    STATE.write_text(json.dumps(d, indent=1, sort_keys=True), encoding="utf-8")


def items_payload():
    kept = load_kept()
    items = X.extract()
    for it in items:
        it["kept"] = it["key"] in kept
        words = len(re.findall(r"[A-Za-z]+", it["plain"]))
        it["short"] = words <= 3 and not re.search(r"[.!?]$", it["plain"].strip())
    order = ["Homepage", "Calendar", "Calendar events", "Book a camp", "My bookings", "Booking (shared)",
             "Booking emails", "Advice", "New to ILCA guide", "Venues", "Weymouth guide", "404 page"]
    items.sort(key=lambda i: (order.index(i["page"]) if i["page"] in order else 99, i["page"], i["file"], i["start"]))
    return {"items": items, "undo": UNDO.exists()}


def escape_quotes(t, q):
    """Backslash any bare q in t, leaving ${...} expressions (which may hold their own quotes) alone."""
    out, i, n = [], 0, len(t)
    while i < n:
        ch = t[i]
        if ch == "\\":
            out.append(t[i:i + 2]); i += 2; continue
        if q == "`" and t.startswith("${", i):
            depth, j = 0, i
            while j < n:
                if t[j] == "{": depth += 1
                elif t[j] == "}":
                    depth -= 1
                    if depth == 0: break
                j += 1
            out.append(t[i:j + 1]); i = j + 1; continue
        out.append("\\" + ch if ch == q else ch)
        i += 1
    return "".join(out)


def apply(changes):
    """changes: [{file, start, end, text (original), new, delete, outer}] → writes files, returns report."""
    by_file, problems = {}, []
    for c in changes:
        by_file.setdefault(c["file"], []).append(c)
    backup, written, js_changed = {}, [], False
    kept = load_kept()
    for rel, cs in by_file.items():
        path = X.path_for(rel)
        src = path.read_text(encoding="utf-8", newline="")
        edits = []
        for c in cs:
            s, e = c["start"], c["end"]
            if src[s:e] != c["text"]:
                hits = [m.start() for m in re.finditer(re.escape(c["text"]), src)]
                if len(hits) != 1:
                    problems.append(f"{rel}: couldn't find “{c['plain'][:60]}” (file changed?) — skipped")
                    continue
                shift = hits[0] - s
                s, e = s + shift, e + shift
                if c.get("outer"):
                    c["outer"] = [c["outer"][0] + shift, c["outer"][1] + shift]
            if c.get("delete"):
                if c.get("outer") and rel.endswith(".html"):
                    s, e = c["outer"]
                    # take the whole line if the element sat on its own line
                    ls = src.rfind("\n", 0, s) + 1
                    le = src.find("\n", e)
                    le = len(src) if le < 0 else le
                    if not src[ls:s].strip() and not src[e:le].strip():
                        s, e = ls, min(le + 1, len(src))
                edits.append((s, e, ""))
            else:
                new = c["new"]
                q = c.get("q") or ""
                if q in ("'", '"', "`"):
                    # The editor shows script strings without their backslash escapes; put them back.
                    new = escape_quotes(new, q)
                    if q != "`":
                        new = new.replace("\r", "").replace("\n", " ")
                edits.append((s, e, new))
                kept[X.key_for(rel, c["new"])] = datetime.date.today().isoformat()
        edits.sort(key=lambda x: x[0], reverse=True)
        last = None
        out = src
        for s, e, new in edits:
            if last is not None and e > last:
                problems.append(f"{rel}: two changes overlap near line {src.count(chr(10), 0, s) + 1}; one skipped")
                continue
            out = out[:s] + new + out[e:]
            last = s
        if out != src:
            backup[rel] = src
            path.write_text(out, encoding="utf-8", newline="")
            written.append(rel)
            js_changed |= rel.endswith(".js")
    if backup:
        UNDO.write_text(json.dumps(backup), encoding="utf-8")
    save_kept(kept)
    note = ""
    if js_changed:
        ver = datetime.datetime.now().strftime("%Y%m%d%H%M")
        r = subprocess.run([sys.executable, str(X.REPO / "tools" / "beta-bust.py"), ver], capture_output=True, text=True)
        note = f"Cache stamp bumped to v={ver} so browsers pick up the script changes." if r.returncode == 0 else "Cache stamp failed: " + r.stderr[-200:]
    if any(f.endswith(".gs") for f in written):
        note += " Booking emails changed: paste apps-script/Code.gs into Apps Script and deploy a new version."
    return {"written": written, "problems": problems, "note": note.strip()}


def undo():
    if not UNDO.exists():
        return {"written": [], "problems": ["Nothing to undo."]}
    backup = json.loads(UNDO.read_text(encoding="utf-8"))
    for rel, src in backup.items():
        X.path_for(rel).write_text(src, encoding="utf-8", newline="")
    UNDO.unlink()
    return {"written": list(backup), "problems": [], "note": "Last save undone."}


class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def send_json(self, obj, code=200):
        b = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def translate_path(self, path):
        p = urllib.parse.unquote(urllib.parse.urlsplit(path).path)
        if p.startswith("/site/"):
            return str(X.SITE / p[len("/site/"):].lstrip("/"))
        return str(HERE / "editor.html")

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.startswith("/api/items"):
            return self.send_json(items_payload())
        if self.path == "/" or self.path.startswith("/?"):
            self.path = "/editor.html"
        return super().do_GET()

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers.get("Content-Length") or 0)) or b"{}")
        try:
            if self.path == "/api/save":
                return self.send_json(apply(body.get("changes", [])))
            if self.path == "/api/undo":
                return self.send_json(undo())
            if self.path == "/api/keep":
                kept = load_kept()
                for k in body.get("keys", []):
                    if body.get("kept", True):
                        kept[k] = datetime.date.today().isoformat()
                    else:
                        kept.pop(k, None)
                save_kept(kept)
                return self.send_json({"ok": True})
        except Exception as e:  # report, don't crash the server
            return self.send_json({"written": [], "problems": [f"Error: {e}"]}, 500)
        self.send_json({"error": "not found"}, 404)


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    print(f"Copy editor: http://localhost:{PORT}")
    Server(("127.0.0.1", PORT), H).serve_forever()
