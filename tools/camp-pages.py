"""One page per upcoming Beyond the Shift camp, at /camps/<slug>/ (SEO action plan item 9).

Run from the repo root:  python tools/camp-pages.py   then   python tools/seo-head.py
Every word on the page comes from data/camps.js and data/events.js (the same text as the homepage
"dates" panel), so nothing is reworded. A camp gets a page when its entry in camps.js has a "slug".
Finished camps are skipped (their old page stays until it is archived by hand).
Also rewrites the camp lines in sitemap.xml.
"""
import datetime, html, json, os, re

ROOT = os.path.join(os.path.dirname(__file__), "..", "autumn-training-series")
SITE = "https://beyondtheshift.co.uk"
TODAY = datetime.date.today().isoformat()
FORM = "https://forms.gle/X7offBwNaL24wZ4t7"
# cache stamp: follow whatever the homepage uses (tools/beta-bust.py bumps it)
STAMP = re.search(r"beta\.css\?v=([0-9a-z]+)", open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()).group(1)
VENUE_INFO = {  # address shown on the page; venue guide link when the guide is public
    "WPNSA": ("Weymouth and Portland National Sailing Academy, Osprey Quay, Portland DT5 1SA", None),
    "Poole Yacht Club": ("Poole Yacht Club, The Yacht Haven, New Harbour Road West, Hamworthy, Poole BH15 4AQ", None),
}
e = lambda s: html.escape(s, quote=True)


def load():
    ev = open(os.path.join(ROOT, "data", "events.js"), encoding="utf-8").read()
    det = open(os.path.join(ROOT, "data", "camps.js"), encoding="utf-8").read()
    details = json.loads(det[det.index("{", det.index("BTS_CAMP_DETAILS")):det.rstrip().rstrip(";").rindex("}") + 1])
    out = []
    for line in ev.splitlines():
        if 'type: "bts-camp"' not in line or "placeholder: true" in line:
            continue
        f = dict(re.findall(r'(\w+): "([^"]*)"', line))
        rigs = re.search(r"rigs: \[([^\]]*)\]", line)
        f["rigs"] = [r.strip() for r in rigs.group(1).split(",") if r.strip()] if rigs else []
        d = details.get(f.get("id"))
        if d and d.get("slug") and f["end"] >= TODAY:
            out.append((f, d))
    return out


def page(f, d):
    rigs = " and ".join(f"ILCA {r}" for r in f["rigs"]) or "ILCA"
    addr, guide = VENUE_INFO.get(f["venue"], (f["venue"], None))
    town = {"WPNSA": "Weymouth", "Poole Yacht Club": "Poole"}.get(f["venue"], f["venue"])
    name = d["title"].replace("Winter Training Series - ", "")
    # Google cuts titles at about 60 characters: short months, no years, and drop the dates if still too long
    short = re.sub(r"\s*\b(19|20)\d\d\b", "", d["date"])
    short = re.sub(r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b", r"\1", short)
    title = f"{name}, {short} | {rigs.replace(' and ILCA ', ' & ')}, {town}"
    if len(title) > 60:
        title = f"{name} | {rigs.replace(' and ILCA ', ' & ')} training, {town}"
    desc = (f"{d['title']}: {rigs} training at {f['venue']}, {d['date']}. {d['price']}. "
            f"Coached by James Foster and Kai Wolgram. {d['intro']}")
    if len(desc) > 160:
        desc = desc[:157].rsplit(" ", 1)[0] + "…"
    ph = d.get("photo") or "fleet"
    expect = "".join(f"<li>{e(x)}</li>" for x in d["expect"])
    guide_link = f'<a href="../../{guide}">{e(f["venue"])} venue guide</a>\n        ' if guide else ""
    return f"""<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
  <link rel="icon" href="../../icons/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="../../icons/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="../../icons/apple-touch-icon.png">
  <link rel="manifest" href="../../site.webmanifest">
  <meta name="theme-color" content="#03132e">
  <meta name="application-name" content="Beyond the Shift">
  <script>document.documentElement.classList.add("js");</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../beta.css?v={STAMP}">
  <link rel="stylesheet" href="../../fx.css?v={STAMP}">
  <link rel="stylesheet" href="../camps.css?v={STAMP}">
  <script src="../../vt.js?v={STAMP}"></script>
</head>
<body class="legal-page camp-page">
  <a class="sr-only" href="#main">Skip to content</a>
  <header class="nav is-solid" data-nav>
    <div class="wrap nav-inner">
      <a class="logo" href="../../">Beyond the <b>Shift</b></a>
      <nav aria-label="Main">
        <ul class="nav-links" id="nav-links">
          <li><a href="../../advice/">Advice</a></li>
          <li><a href="../../calendar/">Calendar</a></li>
          <li><a href="../../venues/">Venues</a></li>
          <li><a href="../../#about">About</a></li>
          <li><a href="../../account/">My bookings</a></li>
          <li class="mobile-only"><a href="../../">Home</a></li>
        </ul>
      </nav>
      <a class="btn btn-accent nav-cta" href="../../#dates">Book a camp</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" data-nav-toggle><span class="nt-word" aria-hidden="true"><span>Menu</span><span>Close</span></span><span class="nt-sail" aria-hidden="true"><i></i><i></i><i></i></span><span class="sr-only">Menu</span></button>
    </div>
  </header>

  <main id="main" class="legal">
    <div class="wrap legal-wrap camp-wrap">
      <nav class="legal-crumbs" aria-label="Breadcrumb"><a href="../../">Home</a> <span aria-hidden="true">/</span> <a href="../../#dates">Training camps</a> <span aria-hidden="true">/</span> {e(d['short'])}: {e(d['focus'])}</nav>
      <article class="legal-card camp-card">
        <figure class="camp-hero">
          <img src="../../img/camps/{ph}-1200.webp" srcset="../../img/camps/{ph}-700.webp 700w, ../../img/camps/{ph}-1200.webp 1200w" sizes="(max-width: 860px) 100vw, 820px" width="1200" height="672" alt="ILCA sailors training with Beyond the Shift" fetchpriority="high" decoding="async">
          <figcaption class="credit">Photo: James Foster</figcaption>
        </figure>
        <p class="eyebrow">{e(rigs)} training camp · {e(f['venue'])}</p>
        <h1>{e(d['title'])}</h1>
        <dl class="camp-facts">
          <div><dt>Dates</dt><dd>{e(d['date'])}</dd></div>
          <div><dt>Price</dt><dd>{e(d['price'])}</dd></div>
          <div><dt>Boats</dt><dd>{e(rigs)}</dd></div>
          <div><dt>Coaches</dt><dd><a href="../../#about">James Foster and Kai Wolgram</a></dd></div>
          <div class="is-wide"><dt>Venue</dt><dd>{e(addr)}</dd></div>
        </dl>
        <p class="camp-lede">{e(d['intro'])}</p>
        <h2>Main focus</h2>
        <p>{e(d['detailFocus'])}</p>
        <h2>What to expect</h2>
        <ul>{expect}</ul>
        <p class="camp-suitable"><strong>Suitable for:</strong> ILCA 4 and 6 sailors, primarily those racing nationally with international aspirations.</p>
        <p class="camp-deadline">{e(d['deadline'])}</p>
        <div class="camp-actions">
          <a class="btn btn-accent" href="{FORM}" target="_blank" rel="noopener noreferrer" data-splash>Book this camp <span aria-hidden="true">↗</span></a>
          <a class="btn btn-ghost" href="../../#dates">See all camp dates</a>
        </div>
      </article>
      <nav class="legal-more" aria-label="Before you book">
        <a href="../../calendar/">ILCA season calendar 2026/27</a>
        {guide_link}<a href="../../advice/new-to-ilca/">New to ILCAs</a>
        <a href="../../cancellation/">Cancellation policy</a>
        <a href="../../terms/">Terms and conditions</a>
      </nav>
    </div>
  </main>

  <footer class="footer">
    <div class="wrap footer-inner">
      <span>© <span data-year>2026</span> Beyond the Shift · James Foster &amp; Kai Wolgram</span>
      <ul>
        <li><a href="../../calendar/">Calendar</a></li>
        <li><a href="../../privacy/">Privacy</a></li>
        <li><a href="../../terms/">Terms</a></li>
        <li><a href="../../cancellation/">Cancellation</a></li>
      </ul>
    </div>
  </footer>
  <script>
    (() => {{
      const nav = document.querySelector("[data-nav]"), t = document.querySelector("[data-nav-toggle]");
      t.addEventListener("click", () => t.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
      document.querySelectorAll("[data-year]").forEach(el => {{ el.textContent = new Date().getFullYear(); }});
    }})();
  </script>
  <script src="../../fx.js?v={STAMP}" defer></script>
</body>
</html>
"""


def main():
    camps = load()
    urls = []
    for f, d in camps:
        folder = os.path.join(ROOT, "camps", d["slug"])
        os.makedirs(folder, exist_ok=True)
        open(os.path.join(folder, "index.html"), "w", encoding="utf-8", newline="\n").write(page(f, d))
        urls.append(f"{SITE}/camps/{d['slug']}/")
        print("wrote camps/" + d["slug"] + "/")
    sm_path = os.path.join(ROOT, "sitemap.xml")
    sm = open(sm_path, encoding="utf-8").read()
    sm = re.sub(r"\n  <url><loc>[^<]*/camps/[^<]*</loc>.*?</url>", "", sm)
    lines = "".join(f"\n  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><priority>0.8</priority></url>" for u in urls)
    sm = sm.replace("\n</urlset>", lines + "\n</urlset>")
    open(sm_path, "w", encoding="utf-8", newline="\n").write(sm)
    print(len(urls), "camp pages; sitemap updated")


if __name__ == "__main__":
    main()
