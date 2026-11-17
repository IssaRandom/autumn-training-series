# SEO tool findings: action plan (17 Nov 2026)

Source: the SEO tool's "Opportunities" and keyword tables (screenshots from James).

## What the findings mean

- **"12 pages blocked from search"** is mostly on purpose. These pages have `noindex`: 10 draft advice stubs (about 95 words each), Weymouth, Navigator, My bookings, thank-you, 404 and loader-test. Only **Weymouth** is a real loss: it's a finished 3,100-word guide.
- **"9 pages low word count"** are the same draft advice stubs. Visitors can still reach them, and they look thin.
- **"ilca uk events"** (70 searches/month, KD 10) is the only keyword with real volume. /calendar/ already *is* that page, but it isn't worded for the search.
- The youth/summer camp keywords get 10–40 searches a month. They are cheap wins only where they're true (BTS runs autumn/winter camps, not summer).

## Priority order

| # | Action | Why | Effort |
|---|--------|-----|--------|
| 1 | **Make Weymouth public.** Remove `venues/weymouth/` from `SKIP` in `tools/seo-head.py`, drop the noindex, add it to the sitemap, re-run seo-head, then request indexing in GSC. | 3,100 words already written. Targets "sailing courses weymouth", "wpnsa sailing" and Weymouth local searches. | Low (needs James's OK that the guide is ready) |
| 2 | **Aim /calendar/ at "ilca uk events".** Title: "ILCA UK events calendar 2026/27 — Beyond the Shift". Add a matching H1/intro line and meta description, and link from the home page with that anchor text. | The highest-volume keyword; the page already exists. | Low (wording needs James's approval) |
| 3 | **Hide the draft stubs.** Remove the links to the 10 draft guides from /advice/ and the menus (or show them as "coming soon" text with no link) until each one has real content. When a guide is finished, take it out of `DRAFT_GUIDES`. | Clears both "low word count" and most of "blocked". Thin pages hurt how Google rates the site. | Low |
| 4 | **Fix the titles.** Shorten to under 60 characters: `calendar-suggestions` (63), `sports-psychology` (65), and check `/coaching/` (59) and `pathway` (59). Lengthen `/advice/` (27): "ILCA sailing advice and guides — Beyond the Shift". Rewrite the thank-you title (still "KW JF Sailing"). | Quick tidy that affects how pages show in results. | Very low |
| 5 | **Work "youth" wording into /coaching/ and the camp pages**, only where it's true. For example: "youth ILCA 4 & 6 training camps in Weymouth and Poole". Don't make separate pages for each keyword. | Picks up "youth sailing camps / programs / near me" at almost no cost. | Low (copy rules: James approves, Kai's text is never reworded) |
| 6 | **Make sure PR #15 (camp pages) is merged and live.** Then run `tools/indexnow.py`. | The camp pages are the best match for the "sailing camp" searches. | Low |
| 7 | Later: finish the advice guides one at a time, with "rigging" first (KD 13 for "ilca rigging guide"). Each one comes off noindex when it's done. | Builds topical authority. | High (content) |

## Skip

- **"summer sailing camp"**: BTS doesn't run summer camps. Only target it if summer camps are offered.
- **"rya shorebased instructor"**: wrong audience.
