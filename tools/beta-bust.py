"""Stamp ?v=<version> on every local .js/.css tag in /beta HTML pages.

Run from the repo root after changing any beta script, stylesheet or events.js:
    python tools/beta-bust.py            # version = today's date, e.g. 20261111
    python tools/beta-bust.py 20261111b  # explicit version (same-day redeploy)
External (http/https) URLs are left alone. Existing ?v= values are replaced.
"""
import datetime, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent / "autumn-training-series" / "beta"
ver = sys.argv[1] if len(sys.argv) > 1 else datetime.date.today().strftime("%Y%m%d")
pat = re.compile(r'((?:src|href)=")(?!https?:|//)([^"?#]+\.(?:js|css))(?:\?v=[^"]*)?(")')

changed = 0
for page in sorted(root.rglob("*.html")):
    text = page.read_text(encoding="utf-8")
    new = pat.sub(lambda m: f"{m[1]}{m[2]}?v={ver}{m[3]}", text)
    if new != text:
        page.write_text(new, encoding="utf-8", newline="")
        changed += 1
        print("stamped", page.relative_to(root))
print(f"v={ver}: {changed} page(s) updated")
