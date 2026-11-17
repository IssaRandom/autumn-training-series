# SEO action plan: beyondtheshift.co.uk (16 Nov 2026)

Each item lists: **why**, **how you'll know it worked**, and what it depends on.

## Phase 1: this week (site fixes, about 2 hours of work)

1. **Fix the structured data on every page.**
   - Organization `name` "Beyond the Shift", `alternateName` "KW | JF Sailing".
   - Add WebSite, plus Person nodes for James and Kai.
   - Events: future camps only, with description, image, performer and offers.availability.
   - Code: `findings/schema.md`.
   - *Why:* it's what Google uses to name the brand in results.
   - *Worked when:* the Rich Results Test shows Event + Organization with no errors, and a Google search for "beyond the shift" shows your site name.
2. **Add self-referencing canonical tags** (with a trailing slash) to every page.
   - *Worked when:* Search Console's "Page indexing" shows no "Duplicate without user-selected canonical".
3. **Give each page its own H1.**
   - Home: brand + "ILCA coaching & training camps".
   - /coaching/: "ILCA 4 & 6 training camps in Dorset" (or similar).
   - Home meta description: 140–155 characters.
4. **Resolve the Weymouth guide conflict.** Either remove the `noindex` (if it's ready) or take it out of the sitemap (if it's still a draft).
5. **Set up Google Search Console** (Domain property, verified through Cloudflare DNS) and **Bing Webmaster Tools** (it can import from GSC).
   - Submit the sitemap.
   - Request indexing for /, /coaching/, /calendar/ and /advice/new-to-ilca/.
   - *This unblocks everything else:* real search queries, positions and links.
6. **Technical tidy-up:**
   - Serve `404.html` for unknown URLs.
   - Add `Strict-Transport-Security` to `_headers`.
   - Add a `noindex` tag on /thank-you.
   - Add a DNS record and a 301 for www → bare domain.

### Done 16 Nov (branch `seo-phase1`, commit c0a61ba, not live yet)
Canonicals, link-preview tags, the "Beyond the Shift" organisation, coach and upcoming-camp data on every page (`tools/seo-head.py`, re-run when camps change). Also: noindex on the 10 draft guides and My bookings, Weymouth taken out of the sitemap, robots.txt tidy-up and HSTS.

### Moved into Phase 1 at James's request: event pages
- One page per Beyond the Shift camp (the booking info on its own page).
- One "more info" page per external event (ILCA UK National Opens etc.), each with:
  - the key facts in our own words, plus a link to the official NoR/entry
  - venue-guide tiles
  - parents' info: where to stay, travel and costs, site map
- The layout and wording need James's review before building.

## Phase 2: weeks 2–3 (pages that match searches)

7. **A page for each coach** (/about/james-foster/, /about/kai-wolgram/): results, roles, photos and links to their profiles elsewhere. Link them from the Organization's `founder` and `sameAs`.
8. **ILCA 4 and ILCA 6 sections or pages** on /coaching/, aimed at "ILCA 4 training" / "ILCA 6 training" / "ILCA coaching Dorset".
9. **One URL per camp** (e.g. /coaching/christmas-camp-2026/), with dates, venue, price and the booking button. Past camps move to an archive with a short report and photos.
   - *Why:* "ilca training camp" results are dominated by individual event pages.
10. **Calendar intro in the HTML:** a paragraph and a short list of key 2026/27 dates in plain text, plus a "last updated" date. Then crawlers that don't run JavaScript still see the content.
11. **Add the "UKLA" line once each** on New to ILCAs and the calendar: "ILCA UK (formerly the UK Laser Association, UKLA)".

## Phase 3: month 2 (authority and links, mostly off-site)

12. **List every camp on portal.ilca.uk** and join the ILCA UK coach register. This is your route onto the "ilca uk" / "ilca training uk" results pages.
13. Ask **WPNSA, Poole Yacht Club, the Andrew Simpson Centre and Sailing Chandlery** to link to the camp pages (use `rel="sponsored"` for any paid sponsor link back).
14. Send a **camp report with photos** to Yachts & Yachting / sail-world after each camp, linking to the camp page.
15. Link to **beyondtheshift.co.uk** from James's and Kai's Instagram bios, World Sailing / athlete profiles and any club coach listings.
16. Pitch **New to ILCAs** to club junior and ILCA fleet captains as the guide to send new families.

## Phase 4: ongoing

- Each month in Search Console: impressions for "beyond the shift" (should appear within weeks), "ilca … training" queries, and the Links report.
- Each season: refresh the /coaching/ title and Events, and archive past camps.
- Re-run `/seo audit` in 8–12 weeks with Search Console connected, for real data.
- Run the speed test at pagespeed.web.dev on the new homepage and calendar (mobile).

## What not to chase
- Ranking #1 for "ilca uk" or "ukla". Those are searches for the class association's own site.
- FAQ schema (Google removed FAQ rich results in May 2026) or HowTo schema.
