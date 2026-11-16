"""Find the wording on the /beta site (and the booking emails) so it can be reviewed in one table.

Each item is an exact span of a source file: {file, start, end, text, ...}. The editor replaces that span,
so nothing is ever rewritten except the words you change.
"""
import hashlib, html, re
from html.parser import HTMLParser
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
SITE = REPO / "autumn-training-series"
BETA = SITE / "beta"
CODEGS = REPO / "apps-script" / "Code.gs"

SKIP_PARTS = {"loader-test"}
SKIP_FILES = {"booking/mock.js", "booking/config.js"}

PAGE_NAMES = {
    "index.html": "Homepage", "404.html": "404 page",
    "calendar": "Calendar", "book": "Book a camp", "account": "My bookings",
    "booking": "Booking (shared)", "advice": "Advice", "advice/new-to-ilca": "New to ILCA guide",
    "venues": "Venues", "venues/weymouth": "Weymouth guide", "data": "Calendar events",
}


def page_name(rel):
    if rel == "apps-script/Code.gs":
        return "Booking emails"
    p = rel[len("beta/"):] if rel.startswith("beta/") else rel
    parts = p.split("/")
    for n in range(len(parts) - 1, 0, -1):
        key = "/".join(parts[:n])
        if key in PAGE_NAMES:
            return PAGE_NAMES[key]
    return PAGE_NAMES.get(p, "Site-wide" if p.endswith(".js") else p)


def page_url(rel):
    """Where to see it on the local preview (served under /site/)."""
    if not rel.startswith("beta/"):
        return ""
    p = rel[len("beta/"):]
    if p.endswith(".html"):
        return "/site/beta/" + (p[:-10] if p.endswith("index.html") else p)
    folder = p.rsplit("/", 1)[0] if "/" in p else ""
    guess = {"booking": "book/", "data": "calendar/", "": ""}.get(folder, folder + "/")
    return "/site/beta/" + guess


# ---------------------------------------------------------------- prose test
WORD = re.compile(r"[A-Za-z][A-Za-z'’\-]*")


def looks_like_prose(t, in_markup):
    s = html.unescape(re.sub(r"<[^>]*>", " ", t)).strip()
    if not s or not re.search(r"[A-Za-z]{2}", s):
        return False
    if re.search(r"[{};]|=>|&&|\|\||\(\)|^[.#\[:@/]|^\w+\(|\bfunction\b|https?://", s):
        return False
    words = WORD.findall(s)
    if in_markup:
        return len(words) >= 1
    if len(words) < 2:
        return False
    toks = s.split()
    if all(re.fullmatch(r"[a-z0-9_\-:.\[\]=\"'()>*,]+", x) for x in toks) and any(re.search(r"[-_:\[\]=]", x) for x in toks):
        return False  # class lists, selectors, attribute names
    if " " not in s and "/" in s:
        return False
    if s.isupper() and "_" in s:
        return False
    return bool(re.search(r"[A-Z]", s) or re.search(r"[.!?…:]$", s) or "·" in s or len(words) >= 3)


# ---------------------------------------------------------------- HTML
INLINE = {"a", "span", "strong", "em", "b", "i", "small", "abbr", "time", "br", "code", "sup", "sub",
          "mark", "s", "u", "kbd", "img", "q", "cite", "wbr", "data", "bdi", "del", "ins"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
SKIP = {"script", "style", "svg", "noscript", "template"}
TEXT_ATTRS = {"alt", "placeholder", "aria-label", "title", "data-tip", "data-label"}
META_NAMES = {"description", "og:title", "og:description", "twitter:title", "twitter:description"}


class _HTML(HTMLParser):
    def __init__(self, src):
        super().__init__(convert_charrefs=True)
        self.src = src
        self.lines = [0]
        for m in re.finditer("\n", src):
            self.lines.append(m.end())
        self.stack, self.out = [], []

    def off(self):
        ln, col = self.getpos()
        return self.lines[ln - 1] + col

    def skipping(self):
        return any(e["tag"] in SKIP for e in self.stack)

    def label(self, tag, attrs):
        a = dict(attrs)
        cls = (a.get("class") or "").split()
        return tag + ("." + ".".join(cls[:2]) if cls else "")

    def handle_starttag(self, tag, attrs):
        start = self.off()
        raw = self.get_starttag_text() or ""
        self._attrs(tag, attrs, start, raw)
        if tag in VOID:
            if tag == "br" and self.stack:
                self.stack[-1]["kids"].append({"br": True})
            return
        self.stack.append({"tag": tag, "start": start, "inner": start + len(raw), "direct": False,
                           "kids": [], "units": [], "label": self.label(tag, attrs)})

    def handle_startendtag(self, tag, attrs):
        start = self.off()
        self._attrs(tag, attrs, start, self.get_starttag_text() or "")

    def _attrs(self, tag, attrs, start, raw):
        if self.skipping():
            return
        a = dict(attrs)
        names = set(TEXT_ATTRS)
        if tag == "meta" and (a.get("name") in META_NAMES or a.get("property") in META_NAMES):
            names.add("content")
        for name in names:
            v = a.get(name)
            if not v or not looks_like_prose(v, True):
                continue
            m = re.search(r"\s" + re.escape(name) + r"\s*=\s*([\"'])(.*?)\1", raw, re.S)
            if m:
                s = start + m.start(2)
                self.out.append({"start": s, "end": s + len(m.group(2)), "where": f"{tag} [{name}]",
                                 "kind": "Hidden text (alt, labels, meta)"})

    def handle_data(self, data):
        if self.stack and data.strip():
            self.stack[-1]["direct"] = True

    def handle_endtag(self, tag):
        idx = next((i for i in range(len(self.stack) - 1, -1, -1) if self.stack[i]["tag"] == tag), None)
        if idx is None:
            return
        end = self.off()
        tag_end = self.src.find(">", end) + 1
        while len(self.stack) > idx:
            el = self.stack.pop()
            el["end"], el["outer"] = end, (el["start"], tag_end if len(self.stack) == idx else end)
            self._close(el)

    @staticmethod
    def has_text(el):
        return el.get("direct") or any(has for k in el["kids"] if not k.get("br") for has in [_HTML.has_text(k)])

    def _emit(self, el, sole_outer=None):
        """Record el's words: the whole thing when it has its own text (a sentence, maybe with <em>/<a> in it),
        otherwise each inline child on its own (e.g. a <li> holding just a link)."""
        if el["direct"]:
            self.out.append({"start": el["inner"], "end": el["end"], "outer": sole_outer or el["outer"],
                             "where": el["label"], "kind": "Page text"})
            return
        kids = [k for k in el["kids"] if not k.get("br") and self.has_text(k)]
        for k in kids:
            self._emit(k, (sole_outer or el["outer"]) if len(kids) == 1 else None)

    def _close(self, el):
        parent = self.stack[-1] if self.stack else None
        if el["tag"] in SKIP or self.skipping():
            return
        if el["tag"] in INLINE:
            if parent:
                parent["kids"].append(el)
                parent["units"] += el["units"]
            return
        text = self.has_text(el)
        if text and not el["units"]:
            self._emit(el)
        elif text and not el["direct"]:
            for k in el["kids"]:
                if not k.get("br") and self.has_text(k):
                    self._emit(k)
        elif text:
            # Text sitting next to child blocks (rare): take the gaps between those blocks.
            pos = el["inner"]
            for us, ue in sorted(el["units"]) + [(el["end"], el["end"])]:
                seg = self.src[pos:us]
                if re.sub(r"<[^>]*>", "", seg).strip():
                    l, r = len(seg) - len(seg.lstrip()), len(seg.rstrip())
                    self.out.append({"start": pos + l, "end": pos + r, "where": el["label"], "kind": "Page text"})
                pos = max(pos, ue)
        if parent and (text or el["units"]):
            parent["units"].append(el["outer"])


def from_html(src):
    p = _HTML(src)
    p.feed(src)
    p.close()
    items = []
    for it in p.out:
        s, e = it["start"], it["end"]
        seg = src[s:e]
        lead = len(seg) - len(seg.lstrip())
        s, e = s + lead, s + len(seg.rstrip())
        if e <= s:
            continue
        text = src[s:e]
        if "<!--" in text and not re.sub(r"<!--.*?-->", "", text, flags=re.S).strip():
            continue
        if looks_like_prose(re.sub(r"<!--.*?-->", "", text, flags=re.S), True):
            it.update(start=s, end=e)
            items.append(it)
    return items


# ---------------------------------------------------------------- JS
REGEX_PREV = set("(,=:[!&|?{};+-*%<>~^") | {""}


class _JS:
    def __init__(self, src):
        self.src, self.n, self.lits = src, len(src), []

    def code(self, i, stop_brace=False):
        src, n, prev, depth = self.src, self.n, "", 0
        while i < n:
            c = src[i]
            if c == "/" and src[i + 1:i + 2] == "/":
                j = src.find("\n", i)
                i = n if j < 0 else j
                continue
            if c == "/" and src[i + 1:i + 2] == "*":
                j = src.find("*/", i + 2)
                i = n if j < 0 else j + 2
                continue
            if c in "\"'":
                j = i + 1
                while j < n and src[j] != c and src[j] != "\n":
                    j += 2 if src[j] == "\\" else 1
                self.lits.append((i + 1, j, []))
                i, prev = j + 1, "a"
                continue
            if c == "`":
                i, prev = self.template(i), "a"
                continue
            if c == "/" and prev in REGEX_PREV:
                j, cls = i + 1, False
                while j < n and src[j] != "\n":
                    ch = src[j]
                    if ch == "\\":
                        j += 2
                        continue
                    if ch == "[":
                        cls = True
                    elif ch == "]":
                        cls = False
                    elif ch == "/" and not cls:
                        break
                    j += 1
                i, prev = j + 1, "a"
                continue
            if stop_brace:
                if c == "{":
                    depth += 1
                elif c == "}":
                    if depth == 0:
                        return i
                    depth -= 1
            if not c.isspace():
                prev = "a" if (c.isalnum() or c in "_$)]") else c
                if prev == "a" and src[max(0, i - 5):i + 1].endswith("return"):
                    prev = ""
            i += 1
        return n

    def template(self, i):
        src, n, j, exprs = self.src, self.n, i + 1, []
        while j < n:
            ch = src[j]
            if ch == "\\":
                j += 2
                continue
            if ch == "`":
                break
            if ch == "$" and src[j + 1:j + 2] == "{":
                k = self.code(j + 2, stop_brace=True)
                exprs.append((j, k + 1))
                j = k + 1
                continue
            j += 1
        self.lits.append((i + 1, j, exprs))
        return j + 1


def _runs(src, s, e, exprs):
    """Split a literal holding HTML into text runs between tags (and pull out text attributes)."""
    runs, attrs, pos, run_start = [], [], s, s
    ex = {a: b for a, b in exprs}
    while pos < e:
        if pos in ex:
            pos = ex[pos]
            continue
        if src[pos] == "<" and re.match(r"</?[A-Za-z!]", src[pos:pos + 3]):
            runs.append((run_start, pos))
            q = pos
            while q < e and src[q] != ">":
                q = ex.get(q, q + 1)
            tag = src[pos:q + 1]
            for m in re.finditer(r"\s(" + "|".join(map(re.escape, TEXT_ATTRS)) + r")=\"([^\"$]*)\"", tag):
                attrs.append((pos + m.start(2), pos + m.end(2), m.group(1)))
            pos = run_start = q + 1
            continue
        pos += 1
    runs.append((run_start, e))
    return runs, attrs


def from_js(src, rel):
    js = _JS(src)
    js.code(0)
    items = []
    only_keys = rel.endswith("data/events.js")
    for s, e, exprs in js.lits:
        if e <= s:
            continue
        if only_keys and not re.search(r"\b(note|intro|label|tagline|caveat|place)\s*:\s*$", src[max(0, s - 20):s - 1]):
            continue
        body = src[s:e]
        plain = body
        for a, b in sorted(exprs, reverse=True):
            plain = plain[:a - s] + " " + plain[b - s:]
        if re.search(r"<[A-Za-z/!]", plain):
            runs, attrs = _runs(src, s, e, exprs)
            for a, b in runs:
                seg = src[a:b]
                a2, b2 = a + len(seg) - len(seg.lstrip()), a + len(seg.rstrip())
                if b2 > a2 and looks_like_prose(_noexpr(src, a2, b2, exprs), True):
                    items.append({"start": a2, "end": b2, "where": "text in script", "kind": None, "q": src[s - 1]})
            for a, b, name in attrs:
                if looks_like_prose(src[a:b], True):
                    items.append({"start": a, "end": b, "where": f"script [{name}]", "kind": "Hidden text (alt, labels, meta)", "q": src[s - 1]})
        elif looks_like_prose(plain, False):
            items.append({"start": s, "end": e, "where": "string in script", "kind": None, "q": src[s - 1]})
    kind = "Event notes" if only_keys else ("Booking emails & server messages" if rel.endswith(".gs") else "Interactive text (scripts)")
    for it in items:
        it["kind"] = it["kind"] or kind
    return items


def _noexpr(src, a, b, exprs):
    t = src[a:b]
    for x, y in sorted(exprs, reverse=True):
        if a <= x and y <= b:
            t = t[:x - a] + " " + t[y - a:]
    return t


# ---------------------------------------------------------------- all files
def source_files():
    files = []
    for p in sorted(BETA.rglob("*")):
        rel = p.relative_to(SITE).as_posix()
        if p.suffix not in (".html", ".js") or SKIP_PARTS & set(p.parts):
            continue
        if rel[len("beta/"):] in SKIP_FILES:
            continue
        files.append((p, rel))
    if CODEGS.exists():
        files.append((CODEGS, "apps-script/Code.gs"))
    return files


def key_for(rel, text):
    return hashlib.sha1(f"{rel}\0{text}".encode("utf-8")).hexdigest()[:16]


def extract():
    out = []
    for path, rel in source_files():
        src = path.read_text(encoding="utf-8", newline="")
        found = from_html(src) if path.suffix == ".html" else from_js(src, rel)
        found.sort(key=lambda x: x["start"])
        seen = {}
        for it in found:
            text = src[it["start"]:it["end"]]
            n = seen.get(text, 0)
            seen[text] = n + 1
            line = src.count("\n", 0, it["start"]) + 1
            out.append({
                "id": f"{rel}:{it['start']}",
                "key": key_for(rel, text),
                "file": rel, "page": page_name(rel), "url": page_url(rel),
                "start": it["start"], "end": it["end"], "line": line,
                "outer": it.get("outer"), "q": it.get("q", ""), "where": it["where"], "kind": it["kind"],
                "text": text, "plain": html.unescape(re.sub(r"<[^>]*>", "", text)),
            })
    return out


def path_for(rel):
    return CODEGS if rel == "apps-script/Code.gs" else SITE / rel


if __name__ == "__main__":
    import collections, sys
    items = extract()
    print(len(items), "items")
    print(collections.Counter(i["kind"] for i in items))
    print(collections.Counter(i["page"] for i in items))
    if len(sys.argv) > 1:
        for i in items:
            if sys.argv[1] in i["file"]:
                print(f'{i["line"]:>4} {i["where"]:<28} {i["text"][:110]!r}')
