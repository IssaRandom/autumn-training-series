# Content, on-page and AI-search findings (done inline, 16 Nov 2026)

## Live site (beyondtheshift.co.uk, as deployed)
- 1 indexable content page (home, ~850 words) + /privacy. Sitemap lists only those two.
- **The phrase "Beyond the Shift" appears 0 times** in the HTML. Organization schema, og:site_name, manifest and 404 all say "KW | JF Sailing". Google has nothing tying the domain to the brand except the domain name itself.
- Title: "Winter Dates Now Live | ILCA 4 & 6 Training 2026/27" — no brand, a seasonal promo phrase in the most valuable slot.
- H1: "Autumn & Winter Training Series" — no ILCA, no brand, no place.
- Keyword counts on the page: ILCA 17, training 15, coaching 5, Poole 5, "ILCA UK" 2, Laser 1, Weymouth 0, UKLA 0.
- E-E-A-T is genuinely strong but under-used: two British Sailing Squad coaches, national titles, ILCA UK National Training Group coaching, Youth Europeans coaching. No individual coach pages, no sameAs links to their athlete/ILCA/World Sailing profiles.
- Freshness: Event schema still lists camps from Sept–Oct 2026 (past). Homepage says "New winter dates now live" but the structured data is stale.

## Staged new site (working tree, NOT deployed)
- Root `index.html` = beta homepage, branded "Beyond the Shift" (6 mentions), plus /coaching, /calendar, /advice + 11 guides, /venues + Weymouth guide, policy pages. Sitemap already updated to 11 URLs.
- Gaps to close before/at launch:
  - No `<link rel="canonical">` on index, advice, calendar, venues pages (only /coaching has one).
  - No JSON-LD at all on the new pages (the Organization/Event graph only survives on /coaching, still named "KW | JF Sailing").
  - `/coaching/` is the old homepage copied: same title as today's live home, 0 brand mentions, same H1 "Autumn & Winter Training Series" as the new home → two pages competing with the same H1.
  - Home H1 is still "Autumn & Winter Training Series" — the homepage should own "Beyond the Shift — ILCA coaching".
  - Advice/guides only 1 of 11 is in the sitemap (others are .wip/placeholder — correct to leave out until written).
- "UKLA" appears 0 times anywhere. People still search the old name; one natural mention ("ILCA UK, formerly the UK Laser Association (UKLA)") on New to ILCAs and the calendar is legitimate and useful.

## AI search readiness
- GPTBot and Googlebot both get 200; robots.txt allows all. No llms.txt (optional, low value).
- Citability: the New to ILCAs guide and calendar are the citable assets (facts, dates, rig choices) — once live, add short answer-first summaries and dated "last checked" lines.
- Brand entity is weak: no consistent name across schema/og/manifest, no sameAs, no Wikipedia/Wikidata-style anchors; fix consistency first.
