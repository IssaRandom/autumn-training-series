"""Add the behind-the-scenes SEO tags to every page of the live site.

Run from the repo root:  python tools/seo-head.py
Safe to run again: it rewrites only what sits between <!-- seo:start --> and <!-- seo:end -->.
Re-run whenever camps change (data/events.js, data/camps.js) so the Google event data stays current;
camps that have finished drop out automatically.

What it writes into each page's <head> (no visible change to any page):
  - canonical link (the page's main address, with trailing slash)
  - link-preview tags (og:/twitter:) built from the page's existing <title> and description
  - JSON-LD: WebSite + Organization (Beyond the Shift) + the two coaches, on every indexable page;
    upcoming Beyond the Shift camps (Event) on the homepage, and each camp's own Event
    + breadcrumb on its /camps/<slug>/ page (run tools/camp-pages.py first);
    Article on finished advice guides.
  - noindex on draft advice guides (DRAFT_GUIDES) and the account page.
"""
import datetime, glob, html, json, os, re

ROOT = os.path.join(os.path.dirname(__file__), "..", "autumn-training-series")
SITE = "https://beyondtheshift.co.uk"
TODAY = datetime.date.today().isoformat()

# Guides that are still placeholders: keep them out of Google until written. Remove a slug when its guide is published.
DRAFT_GUIDES = {"calendar-suggestions", "campaign-management", "fitness", "ilca-4-to-6", "international",
                "nutrition", "pathway", "rigging", "sports-psychology", "technique"}
NOINDEX_EXTRA = {"account/"}
SKIP = {"loader-test/", "navigator/", "coaching/"}  # coaching/ = forwarding stub to /#dates, never the old site; others noindex for now
EVENT_PAGES = {""}
ARTICLES = {"advice/new-to-ilca/": "kai", "venues/weymouth/": "james"}      # finished guides -> author key
ARTICLE_ABOUT = {"venues/weymouth/": "WPNSA"}   # venue guides -> the place they are about (VENUES key)

ORG_ID, SITE_ID = SITE + "/#organisation", SITE + "/#website"
PEOPLE = {
    "james": {
        "@type": "Person", "@id": SITE + "/#james-foster", "name": "James Foster",
        "jobTitle": "ILCA coach", "image": SITE + "/assets/images/james-foster-portrait.jpg",
        "description": "ILCA 7 British Sailing Squad sailor. James progressed through the British sailing pathway "
                       "from junior racing to senior squad level. His Ship Science engineering degree supports a "
                       "technical approach to sailing performance.",
        "award": ["2023 Inland National Champion", "2022 ILCA 7 National Champion",
                  "2019 Laser Radial Youth National Champion"],
        "knowsAbout": ["ILCA sailing", "Laser sailing", "Dinghy racing", "Sailing coaching"],
        "worksFor": {"@id": ORG_ID},
    },
    "kai": {
        "@type": "Person", "@id": SITE + "/#kai-wolgram", "name": "Kai Wolgram",
        "jobTitle": "ILCA coach", "image": SITE + "/assets/images/kai-wolgram.jpg",
        "description": "ILCA 7 British Sailing Squad sailor with more than four years of RYA Squad coaching "
                       "experience. Has coached with the Welsh ILCA Squad, ILCA UK and the Andrew Simpson Centre "
                       "Performance Academy.",
        "award": ["U19 National Champion"],
        "knowsAbout": ["ILCA sailing", "Laser sailing", "Dinghy racing", "Sailing coaching"],
        "worksFor": {"@id": ORG_ID},
    },
}
ORG = {
    "@type": "Organization", "@id": ORG_ID, "name": "Beyond the Shift",
    "alternateName": ["BTS", "KW | JF Sailing"], "url": SITE + "/",
    "logo": SITE + "/icons/icon-512.png",
    "description": "ILCA 4, 6 and 7 coaching, training camps, season calendar and free advice from British "
                   "Sailing Squad sailors James Foster and Kai Wolgram.",
    "areaServed": {"@type": "Country", "name": "United Kingdom"},
    "knowsAbout": ["ILCA 4", "ILCA 6", "ILCA 7", "Laser sailing", "Dinghy racing coaching"],
    "founder": [{"@id": PEOPLE["james"]["@id"]}, {"@id": PEOPLE["kai"]["@id"]}],
}
WEBSITE = {"@type": "WebSite", "@id": SITE_ID, "name": "Beyond the Shift", "alternateName": "BTS",
           "url": SITE + "/", "inLanguage": "en-GB", "publisher": {"@id": ORG_ID}}
VENUES = {
    "WPNSA": {"@type": "Place", "name": "Weymouth and Portland National Sailing Academy (WPNSA)",
              "address": {"@type": "PostalAddress", "streetAddress": "Osprey Quay", "addressLocality": "Portland",
                          "addressRegion": "Dorset", "postalCode": "DT5 1SA", "addressCountry": "GB"}},
    "Poole Yacht Club": {"@type": "Place", "name": "Poole Yacht Club",
                         "address": {"@type": "PostalAddress",
                                     "streetAddress": "The Yacht Haven, New Harbour Road West, Hamworthy",
                                     "addressLocality": "Poole", "addressRegion": "Dorset",
                                     "postalCode": "BH15 4AQ", "addressCountry": "GB"}},
}


def load_camps():
    ev = open(os.path.join(ROOT, "data", "events.js"), encoding="utf-8").read()
    det = open(os.path.join(ROOT, "data", "camps.js"), encoding="utf-8").read()
    details = json.loads(det[det.index("{", det.index("BTS_CAMP_DETAILS")):det.rstrip().rstrip(";").rindex("}") + 1])
    camps = []
    for line in ev.splitlines():
        if 'type: "bts-camp"' not in line or "placeholder: true" in line:
            continue
        f = dict(re.findall(r'(\w+): "([^"]*)"', line))
        if f.get("end", "") < TODAY or f.get("venue") not in VENUES:
            continue
        d = details.get(f["id"], {})
        page = f"{SITE}/camps/{d['slug']}/" if d.get("slug") else SITE + "/#dates"
        e = {
            "@type": "Event", "@id": page + "#event",
            "name": d.get("title") or f["name"],
            "startDate": f["start"], "endDate": f["end"],
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "eventStatus": "https://schema.org/EventScheduled",
            "location": VENUES[f["venue"]],
            "organizer": {"@id": ORG_ID},
            "performer": [{"@id": PEOPLE["james"]["@id"]}, {"@id": PEOPLE["kai"]["@id"]}],
            "url": page,
        }
        e["_page"] = f"camps/{d['slug']}/" if d.get("slug") else None
        if d.get("intro"):
            e["description"] = d["intro"] + (" " + d["detailFocus"] if d.get("detailFocus") else "")
        if d.get("photo"):
            e["image"] = f"{SITE}/img/camps/{d['photo']}-1200.webp"
        price = re.sub(r"[^\d.]", "", d.get("price", ""))
        if price:
            e["offers"] = {"@type": "Offer", "price": price, "priceCurrency": "GBP",
                           "availability": "https://schema.org/InStock", "url": page}
        camps.append(e)
    return camps


def meta(h, name, attr="name"):
    m = re.search(rf'<meta {attr}="{re.escape(name)}" content="([^"]*)"', h)
    return html.unescape(m.group(1)) if m else None


def block_for(rel, h, camps):
    url = SITE + "/" + rel
    title = html.unescape(re.search(r"<title>(.*?)</title>", h, re.S).group(1).strip())
    desc = meta(h, "description") or ""
    already_noindex = bool(re.search(r'name="robots" content="[^"]*noindex', h))
    noindex = already_noindex or rel in NOINDEX_EXTRA or any(rel == f"advice/{s}/" for s in DRAFT_GUIDES)
    out = []
    if noindex and 'name="robots"' not in h:
        out.append('<meta name="robots" content="noindex">')
    if 'rel="canonical"' not in h:
        out.append(f'<link rel="canonical" href="{url}">')
    if 'property="og:site_name"' not in h:
        out.append('<meta property="og:site_name" content="Beyond the Shift">')
    if 'property="og:title"' not in h and not noindex:
        e = lambda s: html.escape(s, quote=True)
        out += [f'<meta property="og:type" content="{"article" if rel in ARTICLES else "website"}">',
                f'<meta property="og:title" content="{e(title)}">',
                f'<meta property="og:description" content="{e(desc)}">',
                f'<meta property="og:url" content="{url}">',
                '<meta property="og:locale" content="en_GB">',
                f'<meta property="og:image" content="{SITE}/assets/images/og-image.jpg">',
                '<meta property="og:image:width" content="1200">',
                '<meta property="og:image:height" content="630">',
                '<meta name="twitter:card" content="summary_large_image">']
    if not noindex:
        graph = [WEBSITE, ORG, PEOPLE["james"], PEOPLE["kai"]]
        if rel in EVENT_PAGES:
            graph += [{k: v for k, v in c.items() if k != "_page"} for c in camps]
        own = [c for c in camps if c["_page"] == rel]
        if own:
            graph += [{k: v for k, v in c.items() if k != "_page"} for c in own]
            graph.append({"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
                {"@type": "ListItem", "position": 2, "name": "Training camps", "item": SITE + "/#dates"},
                {"@type": "ListItem", "position": 3, "name": own[0]["name"], "item": url}]})
        if rel in ARTICLES:
            graph.append({"@type": "Article", "@id": url + "#article", "headline": title.split(" — ")[0].split(" – ")[0],
                          "description": desc, "url": url, "inLanguage": "en-GB",
                          "author": {"@id": PEOPLE[ARTICLES[rel]]["@id"]}, "publisher": {"@id": ORG_ID},
                          "isPartOf": {"@id": SITE_ID}, "image": SITE + "/assets/images/og-image.jpg"})
            if rel in ARTICLE_ABOUT:
                graph[-1]["about"] = VENUES[ARTICLE_ABOUT[rel]]
        js = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=1)
        out.append(f'<script type="application/ld+json">\n{js}\n  </script>')
    return "<!-- seo:start (written by tools/seo-head.py, do not edit by hand) -->\n  " + "\n  ".join(out) + "\n  <!-- seo:end -->"


def main():
    camps = load_camps()
    for path in sorted(glob.glob(os.path.join(ROOT, "**", "index.html"), recursive=True)):
        rel = os.path.relpath(os.path.dirname(path), ROOT).replace("\\", "/")
        rel = "" if rel == "." else rel + "/"
        if rel in SKIP:
            continue
        h = open(path, encoding="utf-8", newline="").read()
        h = re.sub(r"\s*<!-- seo:start[\s\S]*?<!-- seo:end -->", "", h)
        # the old hand-written JSON-LD (KW | JF Sailing, past camps) is replaced by the generated graph
        h = re.sub(r'\s*<script type="application/ld\+json">[\s\S]*?</script>', "", h)
        anchor = re.search(r'<meta name="description"[^>]*>', h) or re.search(r"</title>", h)
        h = h[:anchor.end()] + "\n  " + block_for(rel, h, camps) + h[anchor.end():]
        open(path, "w", encoding="utf-8", newline="").write(h)
        print("updated", rel or "/")
    print(len(camps), "upcoming camps in event data:", ", ".join(c["name"] for c in camps))


if __name__ == "__main__":
    main()
