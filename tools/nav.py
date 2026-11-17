"""One menu for every page (James, 17 Nov 2026: "home should be at the top", "the order seems weird",
"different on some of the pages"). Rewrites the <ul class="nav-links"> and the bar's main button on every page
that has the site nav, so the menu is identical everywhere and only the highlighted (current) item changes.

Phones (the menu sheet), top to bottom: Home, Camps & booking, Calendar, Venues, Advice, About, My bookings.
Desktop bar: Calendar, Venues, Advice, About, My bookings + the "Book a camp" button
(Home and Camps & booking are phone-only rows: on desktop the logo is Home and the button is booking).

Never link to /coaching/: that was the old KW | JF site (see _redirects). Safe to run again.
Usage: python tools/nav.py
"""
import glob, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "autumn-training-series")

# (label, href, phone-only, section prefix that makes it the current item)
ITEMS = [
    ("Home", "/", True, ""),
    ("Camps &amp; booking", "/#dates", True, None),
    ("Calendar", "/calendar/", False, "calendar/"),
    ("Venues", "/venues/", False, "venues/"),
    ("Advice", "/advice/", False, "advice/"),
    ("About", "/#about", False, None),
    ("My bookings", "/account/", False, "account/"),
]
CTA = '<a class="btn btn-accent nav-cta" href="/#dates">Book a camp</a>'


def current(rel_dir):
    """Which item is 'you are here' for a page in rel_dir ('' = home, 'venues/weymouth/' ...)."""
    if rel_dir == "":
        return "Home"
    for label, _, _, prefix in ITEMS:
        if prefix and rel_dir.startswith(prefix):
            return label
    return None


def menu(rel_dir, indent):
    cur = current(rel_dir)
    out = []
    for label, href, phone, _ in ITEMS:
        cls = ' class="mobile-only"' if phone else ""
        here = ' aria-current="page"' if label == cur and rel_dir.count("/") <= 1 else (' aria-current="true"' if label == cur else "")
        out.append(f'{indent}  <li{cls}><a href="{href}"{here}>{label}</a></li>')
    return "\n".join(out)


def run():
    n = 0
    for path in sorted(glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)):
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        if rel.startswith("coaching/") or rel == "font-options.html":
            continue
        raw = open(path, encoding="utf-8", newline="").read()
        nl = "\r\n" if "\r\n" in raw else "\n"
        t = raw.replace("\r\n", "\n")
        m = re.search(r'( *)<ul class="nav-links" id="nav-links">\n.*?\n *</ul>', t, re.S)
        if not m:
            continue
        indent = m.group(1)
        rel_dir = os.path.dirname(rel) + "/" if "/" in rel else ""
        if rel == "index.html":
            rel_dir = ""
        new_ul = f'{indent}<ul class="nav-links" id="nav-links">\n{menu(rel_dir, indent)}\n{indent}</ul>'
        t = t[:m.start()] + new_ul + t[m.end():]
        t = re.sub(r'<a class="btn btn-accent nav-cta"[^>]*>[^<]*</a>', CTA, t, count=1)
        t = re.sub(r'<a class="logo" href="[^"]*">', '<a class="logo" href="/">', t, count=1)
        if t != raw.replace("\r\n", "\n"):
            open(path, "w", encoding="utf-8", newline="").write(t.replace("\n", nl))
            n += 1
    print(n, "pages updated")


if __name__ == "__main__":
    run()
