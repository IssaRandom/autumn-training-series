# SEO audit: beyondtheshift.co.uk

**Date:** 16 Nov 2026
**SEO Health Score: 65 / 100** (estimated, for the new site that went live today)
**Business type:** a coaching and training-camp provider for ILCA (Laser) dinghy sailors. It has no premises of its own and trains at WPNSA (Portland) and Poole Yacht Club.

> **Timing note.** The redesign ("Go live: beta becomes the site root", PR #11) was deployed *during* this audit.
> - The technical, speed, mobile and search-result checks looked at the **old one-page site**, branded "KW | JF Sailing".
> - The headline checks (titles, canonicals, robots tags, structured data, sitemap, redirects) were **re-run on the new live site**, and this report scores the new site.
> - The detailed files in `findings/` describe the old page unless they say otherwise.

## Your target searches: what is realistic

| Search | Can you rank? | What it takes |
|---|---|---|
| **beyond the shift** | **Yes, easily.** No other sailing or coaching business uses the name. Today Google shows generic "shift" pages. | The new site now uses the name. Finish the job: put the brand in the home H1 and the structured data (still "KW \| JF Sailing"). Then ask Google to re-crawl in Search Console. |
| **ilca uk** | **Not for #1.** This is people looking for the class association's own site (ilca.uk). | Appear *alongside* it: list every camp on portal.ilca.uk (Kai's WPNSA clinic is already listed there and ranks), join the ILCA UK coach register, and get a link from ilca.uk. |
| **ukla** | **No.** Google treats "UKLA" as ambiguous (UK Literacy Association, Kentucky Landscape Architecture, UK Listing Authority). | Add one natural line such as "ILCA UK (formerly the UK Laser Association, UKLA)" on New to ILCAs and the calendar. That helps people who search "UKLA training" or "UKLA calendar". |
| ilca training / ilca coaching | Hard on their own (worldwide results). | Doable with a UK or place modifier (see below). |
| **ilca 4 training, ilca 6 training, laser sailing coaching uk** | **Top 10 is plausible.** The competition is mostly old club pages from 2019 to 2022. | Give each one its own page: an ILCA 4 page, an ILCA 6 page and a /coaching page. |
| **ILCA coaching Weymouth / Portland / WPNSA, ILCA training Poole, ILCA winter training 2026/27** | **Best opportunities.** Nobody else really answers these. | One page per camp, venue guides (Weymouth is written but switched off for Google, see below) and current dates. |

## Top 5 issues (new live site)

1. **The structured data still says "KW | JF Sailing" and lists 7 past camps.** It is only on /coaching/. The homepage and every other page have none. *(Schema, High)*
2. **No canonical tags** on the homepage, calendar, advice or venue pages. Only /coaching/ has one. *(On-page, High)*
3. **The homepage and /coaching/ share the same H1** ("Autumn & Winter Training Series"), and neither says "Beyond the Shift" or "ILCA coaching". Google can't tell which page is the brand page and which is the coaching page. *(On-page, High)*
4. **The Weymouth venue guide is in the sitemap but tagged `noindex`.** That sends Google mixed signals, and your best local page is hidden. If it's still a draft, take it out of the sitemap; if it's ready, remove the noindex. *(Technical, High)*
5. **Very little of the calendar is in the page itself.** Its HTML has 92 words, and the rest is drawn by JavaScript. Google usually renders it, but slowly. Most AI search tools and other crawlers see an empty page. *(Technical / AI search, Medium)*

## Top 5 quick wins
1. Rename the Organization in the structured data to **"Beyond the Shift"**, with "KW | JF Sailing" as `alternateName`. Add it to every page, and add WebSite and Person nodes for James and Kai (ready-made code in `findings/schema.md`).
2. Add `<link rel="canonical">` to every page (self-referencing, with a trailing slash).
3. Homepage H1: change it to something like "Beyond the Shift: ILCA coaching & training camps" and keep "Autumn & Winter Training Series" as a sub-heading. Give /coaching/ its own H1, e.g. "ILCA 4 & 6 training camps in Dorset".
4. Lengthen the homepage meta description. At 92 characters it's short; aim for 140–155 and include ILCA 4/6/7, Dorset and the coaches' names.
5. Set up **Google Search Console** for the domain. Submit the sitemap and request indexing of the homepage, /coaching/, /calendar/ and /advice/new-to-ilca/. This is the fastest way to replace the old "KW | JF" listing.

## Category scores (new site, estimated)

| Category | Weight | Score | Note |
|---|---|---|---|
| Technical SEO | 22% | 72 | Crawlable, HTTPS, /beta→root 301s are correct, robots and sitemap are fine. Missing canonicals, Weymouth noindex conflict, empty 404 body, 307 (temporary) trailing-slash redirects, no HSTS. |
| Content quality | 23% | 68 | Strong expertise (two British Sailing Squad coaches, national titles, ILCA UK National Training Group coach). New to ILCAs is a 5,900-word guide. Most advice guides are still unpublished; there are no coach pages. |
| On-page SEO | 20% | 60 | Titles now carry the brand. Weak home H1, home and /coaching H1 duplicated, short home description, no canonicals. |
| Schema | 10% | 35 | Only on /coaching/. Wrong org name, past events still listed, missing event fields (description, image, performer, availability). |
| Performance | 10% | ~80 | The old page measured well by inspection (~0.3 MB, preloaded hero). The new site adds GSAP, Lenis and more scripts. **Not measured with a real speed test.** |
| AI search readiness | 10% | 60 | Bots allowed (GPTBot, ClaudeBot get 200). The calendar depends on JavaScript. Brand entity was inconsistent until today. |
| Images | 5% | 85 | Alt text, width/height, srcset and lazy loading are good. Small mobile-text issues on the old page. |

**Weighted: 65/100.**

## Detail by area

### Technical
- **Good:** HTTPS (http→https 301); `/beta/*` → root is a 301; Googlebot and AI bots are not blocked by Cloudflare; robots.txt is clean; the sitemap lists 11 URLs.
- URLs without a trailing slash get a **307** (temporary) redirect to the slash version. Prefer a 301; this is a Cloudflare Pages setting.
- Unknown URLs return a 404 status with an empty body. Serve the custom `404.html` ("Off the layline").
- `www.beyondtheshift.co.uk` doesn't resolve. Add a DNS record and a 301 to the bare domain so links typed with www still work.
- No HSTS header. Add `Strict-Transport-Security` in `_headers`.
- `/thank-you` is only blocked in robots.txt. Also give it a `noindex` tag.

### Content and E-E-A-T
- The coaches' credentials are the site's strongest ranking asset, but they sit inside the homepage. Give **James and Kai a page each** with results, coaching roles and links to their World Sailing / ILCA / Instagram profiles. Those pages are what Google and AI tools use to connect the brand to real experts.
- **New to ILCAs** (5,900 words, mentions ILCA UK 18 times) is the best page on the site for informational searches. Add the "formerly UKLA" line here.
- Publish the remaining guides only when written. They should stay out of the sitemap until then, as they do now.
- The calendar is a useful asset. Give it an intro paragraph in the HTML (what it covers, last updated, key dates in text), so it ranks for "ILCA calendar 2026/27" / "ILCA UK National Opens 2027" even before the JavaScript runs.

### On-page
- Home: title fine. H1 "Autumn & Winter Training Series" doesn't name the brand or "ILCA". Description is 92 characters.
- /coaching/: title "Winter Training Booking Open | ILCA 4 & 6 Camps 2026/27" is good for the season but will go stale; plan to refresh it each season. It shares the home H1.
- Advice and venue titles follow "Topic – Beyond the Shift", which is good.

### Schema
Covered in full in `findings/schema.md`, which also has ready-to-paste JSON-LD. Correction to that file: it was written against the old page. The new /coaching/ page **does** include the winter 2026/27 camps, but it **also** still lists the 7 past autumn camps. Drop past camps from the Event list, or keep them as `EventScheduled` only if they've happened as planned (Google ignores past events anyway).

### Performance
`findings/performance.md`: the old page was light and fast by inspection. The public speed tool was rate-limited, so **no real Lighthouse or field score was obtained**. Re-test the new site, especially the calendar and the scroll animations on mobile. An easy way is to paste the URL into pagespeed.web.dev.

### Mobile / visual
`findings/visual.md` and `screenshots/` show the **old** page: no sideways scroll and CTAs about 48 px tall, but the visible brand was "KW | JF SAILING". The browser had to run without its safety sandbox on this PC to take those screenshots, because the plugin's screenshot tool crashed.

### Search results (SXO)
`findings/sxo.md`. These results came from a search tool, not a real google.co.uk results page, so treat positions as approximate. The site appeared for none of the 10 target searches *before today's launch*.

### Backlinks
`findings/backlinks.md`. **No backlink data was found.** The domain isn't in Common Crawl's latest sample, and no Moz or Bing key is connected. That is normal for a new site, but it means links are the biggest long-term gap. The free way to see real links is the Links report in Google Search Console (plus Bing Webmaster Tools). The link targets are in the action plan, Phase 3.

## Not checked
- Real Google field data (no Search Console or API key connected) and real Lighthouse scores.
- Search volumes (no keyword-data tool connected).
- The new site's visuals on real phones (the screenshots are of the old page).
