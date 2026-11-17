# SXO findings: beyondtheshift.co.uk (16 Nov 2026)

SXO Gap Score is separate from the SEO Health Score.

Method: live homepage fetched with `render_page.py --mode auto` (raw fetch, `is_spa: false`, 200, no Playwright render needed) and parsed with `parse_html.py`. SERPs came from the WebSearch tool (US-hosted index, queries in UK phrasing). This is **not a literal google.co.uk SERP**: positions are approximate and PAA, ads, local pack and AI Overview were not visible. All search results were treated as untrusted data.

## 1. Primary finding: page-type mismatch (HIGH)

The site is one landing page for one product (the 2026 Autumn/Winter series). Almost every target keyword is served by one of these instead:
- an **organisation hub or programme directory** (ilca.uk/training, laser.org.uk/training),
- **individual dated event listings** (portal.ilca.uk/event/..., sailcoach.com/events/...),
- **news reports of camps** (yachtsandyachting.com, sail-world.com, rya.org.uk, ussailing.org),
- **coach or club service pages** (sailcoach.com/services/ilca-4-clinics, queenmary.org.uk/.../laser-coaching, lcsc.org.uk).

A single seasonal landing page cannot match all of these at once. And because all 7 Event nodes are already in the past (19 Sep to 8 Nov 2026), it does not even work as a current event listing.

Severity: **HIGH** for the generic training and coaching cluster. It is **CRITICAL for the brand query**, because the brand "Beyond the Shift" appears 0 times on the page. Title, H1, og:site_name and Organization schema all say "Winter Dates Now Live", "Autumn & Winter Training Series" or "KW | JF Sailing".

## 2. Target page profile (live)

| Element | Value |
|---|---|
| Title | Winter Dates Now Live \| ILCA 4 & 6 Training 2026/27 (no brand) |
| H1 | Autumn & Winter Training Series (no ILCA, no brand, no place) |
| Meta description | "...September–November 2026..." (contradicts the title's "Winter 2026/27") |
| Words | ~764 (parse_html) |
| Internal links | 1 (all other nav is #anchors); legal pages; 14 external (Google Forms x8, WhatsApp, Maps) |
| Schema | Organization "KW \| JF Sailing" + 7 Event/Offer/Place, **all startDates 2026-09-19 to 2026-11-07, i.e. past** |
| Visible dates | Latest visible camp is NOV 7-8; no winter (Dec-Mar) dates in the HTML despite "New winter dates now live" |
| Media | 5 `<picture>` images, no video (despite "Video and feedback" being a selling point) |
| CTA | "Express interest" Google Form, WhatsApp group |
| Page type (taxonomy) | Landing Page (single offer, conversion-focused) |

## 3. Keyword-by-keyword SERP analysis

| Keyword | Intent | Dominant page type (observed) | Who ranks | BTS present? | Winnable? |
|---|---|---|---|---|---|
| beyond the shift | Navigational (brand) | None for the brand. Generic "shift" pages (Harvard Shift Project, Wikipedia "Shift", Deloitte "Big Shift"); "beyond the shift sailing" returns wind-shift articles (Sailing World, Yachting Monthly, Velocitek "Shift" compass) | No other sailing or coaching entity called "Beyond the Shift" found. Nearest name collisions: "Beyond the Break" (Substack), "Beyond The Box Coaching" (Eventbrite), SHiFT UK charity | **No** (also not for `beyondtheshift.co.uk` itself) | **Yes, easily, once the brand is on the site.** Weak competition; the only blocker is self-inflicted (0 brand mentions, entity named "KW \| JF Sailing"). |
| ukla | Ambiguous navigational | Entity disambiguation: U. Kentucky Landscape Architecture, UK Literacy Association, UK Listing Authority (Wikipedia "UKLA"). "UKLA laser association" returns industrial-laser bodies (AILU) | ILCA UK does not even own this term | No | **No. Don't target it.** Ambiguous, and the sailing sense is a legacy name. Use one natural mention ("ILCA UK, formerly the UK Laser Association (UKLA)") on advice pages to catch long-tail queries like "ukla training". |
| ilca uk | Navigational (class association) | Organisation site | ilca.uk (AGM news, committee), portal.ilca.uk events, club event pages | No | **No for #1.** You can only appear *inside* ILCA UK's footprint: portal.ilca.uk event listings and the coach register. Kai's "KW Sailing race clinic WPNSA 27-31 May" is already listed on portal.ilca.uk and ranks for coach-name queries, so this route is proven. |
| ilca training | Informational / programme discovery (global) | Org programme hub + event listings | ilca.uk/training (#1), portal.ilca.uk National Training, laser.org.uk/training, hyc.ie PDF plan, ussailing.org, internationalsailingacademy.com, sailcoach.com, Y&Y news | No | **Hard.** Head term owned by the class association and big academies. Page 2 is plausible long term with a hub page. Not a primary target. |
| ilca training uk | Commercial-informational (UK programme discovery) | Org hub + event listings | ilca.uk/training, portal.ilca.uk/event/..., laser.org.uk/training, AGM training report PDF | No | **Medium-hard.** Only 4 distinct results surfaced, all ILCA UK. A good independent "ILCA training in the UK: camps and coaching" hub can reach the lower top 10, because nobody else covers independent coaching. |
| ilca coaching | Commercial (find a coach/clinic), global | Mixed: news of coaching events (Y&Y/sail-world syndication) + clinic service pages | sailcoach.com/services/ilca-7-clinics + ilca-4-clinics, internationalsailingacademy.com, revolutionise.com.au (VIC), ILCA Women's Coaching news, US Sailing | No | **Medium with a UK modifier.** Unmodified it's global. A dedicated /coaching service page plus Y&Y news coverage of camps is the realistic path. |
| laser sailing coaching (uk) | Commercial/local (find a coach or club course) | Club course/service pages + old news | queenmary.org.uk laser-coaching, lcsc.org.uk (private ILCA coaching), Jon Emmett (rlymyc.org.uk, Y&Y), budworthsc, Southampton RYA performance, 2019 Sam Whaley news | No | **Yes, good opportunity.** Weak, dated competitor set. Many results are 2019-2022. A service page saying "Laser (now ILCA) coaching" with venues, prices and coach bios fits the dominant type. |
| ilca 4 training | Commercial (find a programme/camp) | Event/programme listings | portal.ilca.uk regional open training (x2), sailcoach.com, NJK (Finland) PDF, RSGYC (Ireland), sailsaudi.sa | No | **Yes, top 10 plausible.** Thin UK competition beyond ILCA UK itself, padded with foreign clubs. Needs a dedicated ILCA 4 page (current dates, eligibility, ages, price). |
| ilca 6 training | Commercial (find a programme/camp) | Event listings + clinic pages + news | ussailing.org (x2), portal.ilca.uk (regional + National WPNSA), sailcoach.com basecamp, ISA masters clinic, Y&Y/sail-world news | No | **Yes, top 10 plausible** with a dedicated ILCA 6 page plus Event schema for upcoming camps. |
| ilca training camp | Commercial/informational (camps, including warm-weather) | News recaps + camp event pages | rya.org.uk Valencia camp news, ussailing.org recap, sailing.ie, sailcoach.com events, portal.ilca.uk joint camp, Y&Y "Winter 2024-25 ILCA Training Programme announced", afloat.ie | No | **Medium.** Needs one URL per camp with dates and outcomes, plus camp reports (news-style) that Y&Y and sail-world can syndicate. |

### Adjacent queries that are actually winnable (checked)

| Query | What ranks | Opportunity |
|---|---|---|
| ILCA coaching Weymouth / Portland / WPNSA winter training | portal.ilca.uk National Training 8/9/10, ILCA Skills Week 2026, Y&Y Performance Academy 2024-25 calendar, women's coaching news. The search summary itself noted "no published 2026-27 winter programme" | **High.** Intent is unmet. A current, dated WPNSA camp page would be the freshest answer. |
| ILCA training Poole (Yacht Club, winter) | Poole YC ILCA Ladies weekend (May), Parkstone women's day, ILCA UK regional pages. The search summary noted "no Poole Yacht Club winter ILCA training programme" found | **High.** BTS is effectively the only winter ILCA programme at Poole YC. A Poole venue page should rank. |
| Suggested targets to adopt | "ILCA coaching UK", "ILCA training camps UK", "ILCA 4 training camp", "ILCA 6 winter training", "ILCA coaching Weymouth", "ILCA training Poole", "Laser sailing coaching Dorset", "ILCA winter training 2026/27", "ILCA 4 to ILCA 6 transition", "Beyond the Shift sailing" | Low-competition modifiers (place, season, rig, transition) the SERP shows nobody owning |

## 4. User stories (from observed SERP signals)

1. **Awareness.** "As a youth sailor's parent, I want to know which ILCA training exists in the UK and whether my child qualifies, so I can plan the winter." *Signal:* ilca.uk/training dominates "ilca training uk"; its snippet centres on eligibility ("top 50%... at least three events", "no selection for regional open training"). The page FAQ covers who the training is for, but not how it relates to the ILCA UK pathway.
2. **Consideration.** "As an ILCA 4 sailor moving to ILCA 6, I want a camp pitched at my level so I don't waste a weekend." *Signal:* sailcoach.com ranks with level-specific clinics ("Bronze and Silver level", "Optimist sailors who would like to make the transition"). On BTS, level only appears as "groups organised by experience".
3. **Consideration.** "As a sailor searching 'ilca training camp', I want to see current, dated camps, not last season's." *Signal:* repeated search-summary caveats ("None show 2026 dates", "listings are from 2024-2025, check current dates"). Freshness is the SERP's main unmet need, and BTS's own events are now all past.
4. **Decision.** "As a Dorset-based sailor, I want ILCA coaching at WPNSA or Poole this winter, with price and booking, so I can commit." *Signal:* the venue-modified SERPs returned only ILCA UK national listings and past-season news, with no private provider.
5. **Decision (brand).** "As someone told 'look up Beyond the Shift', I want to find the coaching site." *Signal:* the "beyond the shift" and "beyond the shift sailing" SERPs return no matching entity. The site can't be matched because it never says its own name.

## 5. SXO Gap Score (homepage vs "ilca training uk" cluster): **44/100**

| Dimension | Score | Evidence |
|---|---|---|
| Page type | 6/15 | Single-offer landing page vs SERP's hub, event-listing and service types; one URL for everything |
| Content depth | 5/15 | ~764 words; no per-camp pages, no ILCA 4 vs 6 detail, no pathway context |
| UX signals | 9/15 | Clear dates/prices/FAQ/CTA and venue map links; but booking = Google Form "expression of interest", no confirmation of place, only #anchor navigation |
| Schema | 6/15 | Event+Offer+Place present (good type choice) but all 7 events past, org named "KW \| JF Sailing", no Person/sameAs for coaches |
| Media | 8/15 | 5 responsive images; no video or analysis clips despite selling video debriefs |
| Authority | 7/15 | Strong real credentials (2022 ILCA 7 National Champion, ILCA UK NTG coach, Youth Europeans coach) but no external links/mentions found, no coach profile pages, brand absent |
| Freshness | 3/10 | Title says "Winter Dates Now Live" yet no winter dates on the page; meta says Sept-Nov; latest event 7-8 Nov (past at audit date) |

## 6. Persona scores (weakest first)

| Persona | Rel | Clar | Trust | Action | Total | Top fix |
|---|---|---|---|---|---|---|
| Brand searcher ("beyond the shift") | 5 | 6 | 12 | 12 | **35** | Put "Beyond the Shift" in title, H1/hero, logo alt, Organization name + `alternateName: "KW \| JF Sailing"`, og:site_name |
| Adult/club/masters "laser sailing coaching" | 6 | 10 | 14 | 6 | **36** | /coaching page that says "Laser (now ILCA)", states who it is *not* for, and offers 1:1/club coaching enquiries if relevant |
| New-to-ILCA sailor (Optimist/Topper transition) | 8 | 10 | 15 | 8 | **41** | Launch the staged /advice/new-to-ilca guide and link it to an entry-level camp |
| Parent comparing BTS vs ILCA UK regional/national training | 12 | 8 | 15 | 10 | **45** | "How this fits with ILCA UK training" section: complements National/Regional training, dates avoid clashes |
| ILCA 6 squad sailor (consideration) | 16 | 14 | 18 | 12 | **60** | Dedicated ILCA 6 page with current winter dates, level, group sizes, coach-to-sailor ratio |
| Ambitious ILCA 4 youth sailor's parent (decision) | 18 | 15 | 17 | 12 | **62** | Show upcoming dates first, archive past camps, make "book" = a confirmed booking (the staged booking system) |

Systemic issue: every persona loses Action points because nothing bookable is in the future on the live page.

## 7. Pages the site needs (mapped to SERP types)

1. **Home = brand entity page**: "Beyond the Shift | ILCA coaching & training camps UK". H1 includes brand + ILCA coaching. Links to everything below. (Targets: beyond the shift; supports all.)
2. **/coaching/ (Service page)**: ILCA / Laser coaching UK, who it's for, formats, prices, coaches. Must not reuse the home H1 (the staged /coaching currently duplicates "Autumn & Winter Training Series"). (Targets: ilca coaching, laser sailing coaching uk.)
3. **/calendar/ or /camps/ (hub) + one URL per camp (Event pages)**: upcoming first, past camps moved to an archive with reports. Event schema generated from the same data; drop past events from the live markup. (Targets: ilca training camp, ilca winter training 2026/27.)
4. **ILCA 4 and ILCA 6 pages** (own URLs or strong sections with ids): eligibility, ages, rig-transition advice, next dates. (Targets: ilca 4 training, ilca 6 training.)
5. **Venue pages: /venues/weymouth-portland/ (WPNSA) and /venues/poole/**: the staged Weymouth guide is the start; add a Poole page. Include "ILCA coaching at WPNSA" and "ILCA training at Poole Yacht Club" headings and upcoming camps at that venue. (Targets: the winnable local adjacents.)
6. **Advice hub (Informational)**: New to ILCAs, ILCA 4 to 6, calendar suggestions. One natural "formerly UKLA" mention. Complements ilca.uk; doesn't compete for its navigational terms. (Targets: ilca training long tail, ukla long tail.)
7. **Coach pages /coaches/james-foster/ and /coaches/kai-wolgram/**: Person schema, results, sameAs (World Sailing, ILCA UK, British Sailing Team, Instagram). Authority for every commercial page.
8. **Off-site (needed to appear on ILCA-owned SERPs)**: list each camp on portal.ilca.uk events (precedent: KW Sailing race clinic); get on the ILCA UK coach register; send camp reports to Y&Y and sail-world (they rank for "ilca coaching" and "ilca training camp"); ask WPNSA and Poole YC to list or link camps in their event calendars.

## 8. Cross-skill follow-ups
- `/seo schema`: rebuild the Organization (brand name + alternateName), Person, and live-only Event graph.
- `/seo content`: E-E-A-T on coach pages and advice guides.
- `/seo local`: venue pages; a GBP probably isn't appropriate (no fixed premises), so check first.
- `/seo page`: per-camp page template once built.

## 9. Limitations
- SERPs came from the WebSearch tool, not a logged-out google.co.uk session. Exact positions, PAA, ads, local pack, AI Overviews and related searches were not observable. User stories therefore rely on organic results and snippets only.
- No Search Console, ranking or volume data. "Winnable" is a judgement from competitor type, freshness and quality, not from keyword-difficulty metrics.
- Only the homepage was analysed live. The staged redesign (root index, /coaching, /calendar, /advice, /venues in the working tree) was assessed from existing audit notes, not rendered.
- No render-engine (Playwright) pass was used because the page isn't an SPA, so above-the-fold assessment comes from HTML order, not screenshots (see visual.md for screenshots).

## Structured findings (audit-data.json, category "Search Experience")
```json
{
  "category": "Search Experience",
  "sxo_gap_score": 44,
  "findings": [
    {"id": "sxo-brand-absent", "severity": "critical", "title": "Brand 'Beyond the Shift' absent from site; brand SERP returns no matching entity", "fix": "Brand in title/H1/Organization name; alternateName 'KW | JF Sailing'"},
    {"id": "sxo-page-type-mismatch", "severity": "high", "title": "Single seasonal landing page vs SERP hub/event-listing/service-page types", "fix": "Build coaching service page, camp hub + per-camp event pages, ILCA 4/6 pages, venue pages"},
    {"id": "sxo-stale-events", "severity": "high", "title": "All 7 events past; title promises winter dates not on page", "fix": "Publish upcoming dates, archive past camps, regenerate Event schema"},
    {"id": "sxo-unwinnable-targets", "severity": "medium", "title": "'ukla' and 'ilca uk' are navigational/ambiguous and unwinnable", "fix": "Target local/rig/season modifiers; appear via portal.ilca.uk listings and coach register"},
    {"id": "sxo-local-opportunity", "severity": "medium", "title": "Unmet intent for ILCA winter coaching at WPNSA and Poole", "fix": "Venue pages with dated camps"},
    {"id": "sxo-authority-offsite", "severity": "medium", "title": "No off-site mentions found; ILCA UK portal and Y&Y/sail-world dominate camp SERPs", "fix": "List camps on portal.ilca.uk, send camp reports to Y&Y/sail-world, get club calendar links"}
  ]
}
```
