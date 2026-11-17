# Full site audit: beyondtheshift.co.uk

_17 Nov 2026. Reviewed the **live** site (master at PR #15) page by page at desktop (1280) and phone (390). Tools used: the web-design-reviewer static audit (172 files), an in-page probe on 13 pages at both widths, screenshots, and new research on what top designers do (`research/personalisation-research.md`). It also draws on POLISH-AUDIT.md, the article-design anti-patterns and the design rules saved from earlier sessions. Nothing was changed on the site._

**Tool output:** static audit P1 0 · P2 2 · P3 119 · INFO 31. The probe found no sideways scroll on any page and no broken images.

---

## Fixes done (17 Nov, branch `audit-fixes-1117`, commit 0a8347f, NOT pushed)
Worktree `../bts-audit-fixes`, preview config `audit-fixes` (port 8785), stamp v=20261117e.
- **1.1** ✅ real venue aerials + credits on the homepage; Vilamoura/Largs on /venues/ get a name panel. No picsum left anywhere.
- **1.2** ✅ `wrangler.jsonc` (Worker `autumn-training-series`, `not_found_handling: "404-page"`). Check `/nope/` after deploy; if the Cloudflare build ignores it, set "404 page" in the Worker's settings.
- **1.5** ✅ "Online · Beta" tag gone; venue-guide `.wip` slots ("To add", "still working on this") only show with `?review=1`. Note: review mode is remembered per browser session, so test in a fresh tab.
- **1.6** ✅ /book/ with no camp lists the open camps.
- **1.8** ✅ Weymouth category labels lifted to ~5:1.
- Not done (need James): 1.3 /coaching/ decision, 1.4 font choice, 1.7 test booking. An older uncommitted change in the main checkout points "Coaching" at `/#dates`: that is decision 1.3, left out of this branch.

## The short version

The bones are good. The calendar, the New to ILCAs guide, the Weymouth explorer and the booking flow are clearly made by sailors, and no template could produce them. What makes the site look **unfinished or generated** is a handful of visible leftovers on the most-seen pages:

1. **The homepage venue cards show random placeholder photos**: mountains, a railway yard, a cloud and a forest.
2. **"Coaching" in the main menu opens the old KW | JF site**: a different logo, a different menu, white sections and booking by Google Form. It feels like leaving the site.
3. **Headings use whatever condensed font the visitor's device has.** That's Arial Narrow on Windows and something different on an iPhone. No font was chosen and loaded for them.
4. **Unknown addresses show Chrome's blank error page.** The custom "Off the layline" 404 page isn't being served.
5. **"Coming soon" is everywhere:** 4 of the 5 guides on the homepage, 3 of the 4 venues, and 10 guide pages in the advice hub.
6. **Leftover "Beta" and "To add" labels** are visible to the public.
7. **There is no human proof:** no parent or sailor quotes, no camp photos beyond a few, no numbers (sailors coached, days on the water), no first-person voice from you on the homepage, and no About page (the "About" menu item just jumps down the homepage).

Fix those seven and the site moves from "nice template" to "obviously ours". The personality ideas in section 5 then build on that.

---

## 1. Must fix (live now, visible to everyone)

| # | What's wrong | Where | Why it matters | Fix | Effort |
|---|---|---|---|---|---|
| 1.1 | **Venue cards use picsum placeholder photos** | Home → "Know the venue before you arrive" | It's the most "generated" thing on the site. | The uncommitted working copy on `fixes-1117` already points at `venues/photos/*.webp`. Ship it. The /venues/ page still has 2 picsum images (Vilamoura and Largs), which need real photos or no image. | S |
| 1.2 | **The 404 page isn't served.** A mistyped address returns an empty 404 and the browser's own error screen | any unknown URL | A dead end with no menu. `404.html` exists in the repo but Cloudflare isn't using it. | Check the Cloudflare deploy settings (Pages serves `404.html` from the output root; Workers static assets need `not_found_handling = "404-page"`). Then retest `/nope/`. | S |
| 1.3 | **/coaching/ is still the old site**: "KW \| JF Sailing" logo, its own menu, white sections, and "Complete one short Google Form to express interest" | /coaching/ (the main "Coaching" button on every page) | Two brands and two booking routes. Parents will ask which one is real. | Rebuild /coaching/ in the site style, or point "Coaching" at the homepage camp list plus the new /camps/ pages and retire the old page. Keep the FAQ and "How the series develops" content. | M–L |
| 1.4 | **The heading font isn't loaded.** H1/H2 use `"Arial Narrow", "Roboto Condensed", Impact, …`, and only Montserrat is downloaded | every page | On iPhones and Macs the headings fall back to a different font, so the site looks different on each device. An unchosen font is the #1 "generated" tell in the research. | Choose and self-host one display face (see 3.1), preload it and use `font-display: swap` with a size-matched fallback (POLISH #6). | S–M |
| 1.5 | **"Online · Beta" badge** on the Book this camp button, and **"We're still working on this"** with yellow **"To add"** tags on the Weymouth guide | Home camp panel, /venues/weymouth/ | It says "unfinished" right at the moment of trust, and Weymouth is promoted on the homepage as a "New guide". | Remove the Beta tag (booking is live). On Weymouth, hide empty "To add" slots on the live site, or keep the guide off the homepage until it's filled in. | S |
| 1.6 | **/book/ with no camp chosen says "We couldn't find that camp"** | /book/ (e.g. from a shared link or the "Coaching" button) | It's an error message where the camp list should be. | With no `?camp=`, list the open camps as cards instead. | S |
| 1.7 | **A test booking ("adsd asd", Christmas Camp, awaiting payment) is in the live booking sheet** | the bookings sheet / My bookings | It counts towards places and could trigger reminder emails. | Delete the test rows from the sheet (your call: I didn't touch it). | S |
| 1.8 | **Low-contrast labels on Weymouth**: "Stay · Portland" category labels at 2.4:1 (the tide badge the probe flagged is fine: false reading over the map) | /venues/weymouth/ | People can't read them. | Use the light ink token on these chips. | S |

---

## 2. Things that make it feel template-made (site-wide)

Checked against the research list of "AI tells". The site avoids most of the obvious ones (no purple gradients, no glassmorphism, no emoji icons, no stock people). These are the ones it does have:

| Tell | Where on BTS | Suggested change |
|---|---|---|
| **The same rounded card everywhere**: guides, venues, coaches, camps and calendar strip all use one 12px navy card with a faint border | Home, advice, venues | Keep cards for things you *pick* (camps, guides). Give other content a different form: coaches as a full-bleed photo with a pull quote, venues as a photo strip with a map pin, the "Why BTS" points as a numbered editorial list. Variety in shape, not just colour. |
| **Identical section rhythm**: small blue eyebrow, huge all-caps heading, grey sentence, link on the right, grid, repeated six times on the homepage | Home | Break it on 2–3 sections. One heading in sentence case, one section led by a photo, one by a quote or a number. The article-design rhythm rules (`research/article-design/rhythm.md`) apply to the homepage too. |
| **Pill badge above the headline** ("NEW 2026/27 season calendar →") | Home and /coaching/ heroes | Fine once. Drop the "NEW" chip after December, or replace it with something only you could write: "Next camp: Christmas, 2 places left". |
| **Generic subheads**: "Experience on the water", "Ready to take the next step?", "Free advice for every stage", "Stay connected" | Home | These could belong to any coaching business. Rewrite them in your voice with specifics: "Two squad sailors who still race every week", "Christmas at Poole: 2 places left". Kai's wording stays untouched; this is only for your own headings. |
| **No real proof** | whole site | See 4.1 (testimonials, numbers, photos). |
| **"Coming soon" cards make up most of the grid** | Home advice (4 of 5), home venues (3 of 4), /advice/ (10 shells) | Show only what's live, plus one line: "Rigging, season planning and fitness guides are on the way. Join the WhatsApp group to hear first." Five "Preview" cards that lead to empty pages hurt more than they help. |
| **Mixed photo treatment**: James's portrait is on black, Kai's on light grey | Home and /coaching/ coach cards | Use one consistent setting: both on the water, or both cut out on the same navy. Apply the same colour grade to every photo (POLISH #10). |
| **Hyphens where dashes belong**: "Winter Training Series - Christmas Camp", "coaches who have been through it - from first regatta" | Home camp panel, /camps/ pages, advice lede | Use an en dash, or better, a colon ("Winter Training Series: Christmas Camp"). |
| **Robotic camp names**: "Winter Training Series #9", "#10" | Home list, /camps/ URLs | Give them human names, like "February weekend block", matching the others. |

---

## 3. Design system fixes

### 3.1 Type
- **Choose a real display face** to sit with Montserrat for body text. Condensed sporty options that load from Google Fonts and keep your current look: *Barlow Condensed* (800), *Oswald* or *Saira Condensed*. Montserrat on its own is a common default, and the research points to a second, chosen face as the fix.
- One **accent face** is already there: the italic serif "ILCA 4 & 6" (Georgia). Use it on purpose for coach quotes and sign-offs, rather than as a system fallback.
- All-caps headings are heavy on phones ("AUTUMN & WINTER TRAINING SERIES" takes 4 lines at 390px). Consider sentence case for H2s, keeping caps for the H1 only.
- Long body lines on the guides: cap them at about `65ch` and check New to ILCAs.

### 3.2 Colour and surfaces
- **The white "Autumn + winter training dates" section** on the homepage (and the white sections on /coaching/) break the dark theme you chose. Put them on `--bg-2` with light cards, or make the camp list a deliberate "paper" moment and repeat that across the site. Right now it reads as a leftover from the old site.
- The static audit flags `venues.css:139` (`#fff` background) and 9 files with colours hard-coded outside the tokens.
- Red is used for "2 places left" (fine, it's urgency) but scores 3.8:1 on white. Darken it slightly.

### 3.3 Small stuff the probe and audit found
- 19 images without width/height (layout jumps), 5 below-the-fold images not lazy-loaded (mostly New to ILCAs).
- 7 serial commas on New to ILCAs and Privacy ("Height, weight, age, and"). Kai's copy: flag these to him rather than editing.
- `/navigator/` has no H1, and `/loader-test/` is public with no description. Add `noindex` to both, or remove loader-test.
- The account page and the Weymouth guide have no share image (`og:image`).
- Phone touch targets under 44px: the calendar header buttons (28×34), event bars on the homepage strip (18px tall), and the footer text links.
- The "SailingFast" link on New to ILCAs is 1.8:1 contrast.
- 2 `localStorage` reads outside try/catch (`booking/api.js:16`), which can throw in private browsing.
- There's no contact email or phone anywhere, only the WhatsApp group. Parents booking £450 camps will look for an email address.

---

## 4. What's missing

### 4.1 Trust and proof (biggest gap)
1. **Parent and sailor quotes**: full name (or "parent of an ILCA 6 sailor, Hayling"), the camp, and one specific outcome. Get consent. Three good ones beat ten vague ones.
2. **Numbers that are true**: camps run this season (7 done), sailors coached, coach-to-sailor ratio, days on the water, and the venues. Count up only real figures (POLISH rule).
3. **Camp reports**: the 7 completed camps are currently crossed-out chips. Turn each into a short report (3 photos, the focus, one coach note). That's proof, SEO and Instagram content in one.
4. **A real About page** (/about/) with you and Kai as people: why you started BTS, how you coach, what a day at camp looks like, and your own campaigns. "About" in the menu should go there, not to `#about`.
5. **Photos of the coaching itself**: the RIB, debriefs, a whiteboard, rigging on the slipway, video review. Research (NN/g) shows people study real team and process photos and skip stock.

### 4.2 Pages and features
- **A "What a camp day looks like" timeline** (arrive 9:00, briefing, water, debrief, video) on the camp pages. Parents ask this most.
- **Kit list / what to bring**, printable (POLISH #36 print styles).
- **Booking reassurance block** on camp pages: cancellation in one line, who's on the water, safety cover, ratio, and what's included.
- **Sponsor credit**: Sailing Chandlery is on the hero sail but not mentioned anywhere. Add a small "Supported by" line in the footer.
- **Analytics**: none is installed, so you can't tell which pages convert. A cookie-free option (Cloudflare Web Analytics, one script tag, no banner needed) fits your privacy notice. Decision needed.
- **Newsletter or email capture** as an alternative to WhatsApp, for parents who don't want to join a group.

---

## 5. Making it personal: the signature layer

From the research (Leclerc, Lando Norris, Surf Simply, Team Malizia) the pattern is **one strong motif from the sport, a real voice, and real people**. You already picked the sailing language in POLISH-AUDIT. The highest-value items still open, in order:

| Priority | Idea | Why it's "only BTS" | POLISH # | Effort |
|---|---|---|---|---|
| 1 | **Coach margin notes**: a small avatar and a handwritten-style label with one tip ("James: on a NE at Portland, go left off the start") on guides, venue panels and camp pages | Your voice, in your words, next to the content | 21 | M |
| 2 | **Your voice on the homepage**: replace "Two current British Sailing Squad sailors. One shared approach…" with a 2–3 line first-person note signed by both of you | Nobody else can write it | 17 | S (needs your lines) |
| 3 | **Coach's-pen annotations on photos**: arrows and short notes drawn over 2–3 sailing photos (sail shape, body position) as SVG strokes that draw in on scroll | A coach's eye that a template can't fake. Keep it to a couple of strokes; you rejected busy map layers. | new | M |
| 4 | **Start-sequence countdown**: "Next camp · 32 days to the gun" in the hero strip | Racing language | 19 | S |
| 5 | **Live wind badge**: "Portland now · 14 kn SW" from Navigator, in the footer or on Weymouth | Made by a sailor who builds tide models | 16 | M |
| 6 | **"Currently" footer line**: "James is training in Cascais · Kai is coaching in Weymouth", updated from one data file | Shows the site is alive and the coaches are real | 29 | S |
| 7 | **Updated stamps**: "Updated 17 Nov by James" on the calendar and guides (Weymouth has one; extend it) | Trust and freshness | 38 | S |
| 8 | **Signal-flag favicon and share cards**: the B·T·S flags on the favicon and a per-page OG image ("Christmas Camp · Poole · 19–23 Dec") | Consistent and recognisable when shared on WhatsApp, which is how parents share | 8, 27 | M |
| 9 | **Booking-confirmed moment**: a chequered finish with flag confetti (no sound) | Delight at the right moment | 18 | M |
| 10 | **Easter eggs**: a console message for developers (with your campaign link) and the 5-click logo boat | Developer-site tradition | 26 | S |

**Avoid:** more effects that don't come from sailing, any sound, jokes in payment/medical/error text, busy map layers, and teal (stay blue).

---

## 6. Page-by-page notes

**Home**
- The hero is strong (a real photo with the Sailing Chandlery sail). But the H1 reads "Beyond the Shift · ILCA coaching / Autumn & Winter Training Series", and in mid-November "Autumn" is already over. Consider "Winter training camps for ILCA 4 & 6" with "Beyond the Shift" as the eyebrow.
- The "Next camps" strip sits right under the hero, and "Next trainings" repeats the same three camps lower down. Keep one, or make the second a different view (e.g. the calendar strip only).
- The "Next eight weeks" calendar strip has bars 18px tall, which are hard to tap, and labels are cut off ("Region…", "RLymY…").
- The final CTA and the footer both say "Autumn & Winter Training Series"; the brand is Beyond the Shift.

**/coaching/**: see 1.3. Until it's rebuilt, at least swap the KW | JF logo and the Google Form button for the new ones.

**/camps/<camp>/** (new in PR #15): good start. Add the day timeline, a coach note, 2–3 photos from that venue, and the reassurance block (4.2). The title hyphen "Series - Christmas Camp" needs fixing.

**Calendar**: the strongest page. Year-plan bars are readable on desktop. On phones, header buttons are below 44px. On a touch screen, check that the tip says "pinch" rather than "Ctrl + scroll" (my phone test was a narrow desktop frame, so this isn't confirmed).

**Advice hub**: the chip label "Not taught at camp" is confusing. Hide the 10 under-construction guides from the grid (keep the URLs `noindex`) until they're written.

**New to ILCAs**: excellent depth (5.7k words). Fix the low-contrast "SailingFast" link and the 5 images without lazy-loading or size. The race-weight chart is a great "only BTS" element; more of these please.

**Venues / Weymouth**: the wind-explorer map is the most distinctive thing on the site. Fix the contrast (1.8) and the "To add" slots (1.5). It has no share image.

**Book / My bookings**: the beat loader ("Waking up the booking system…") is charming. Fix the empty /book/ state (1.6). The payment panel is clear.

**Footer**: add an email address, a sponsor line, the "currently" line and an About link, and use one brand name.

---

## 7. What I need from you

1. **Display font**: happy for me to pick between Barlow Condensed, Oswald and Saira Condensed? I'll send a side-by-side.
2. **/coaching/**: rebuild it in the new style, or retire it and send "Coaching" to the homepage camp list?
3. **Proof**: 3–5 parent or sailor quotes (with permission), real numbers, and 10–20 camp photos (RIB, debrief, slipway).
4. **Your lines**: a 2–3 line homepage note from you both, 5–10 margin tips, and a "currently" line each.
5. **Contact email** to show publicly, and **analytics** yes/no (Cloudflare Web Analytics, cookie-free).
6. **Test booking**: delete the "adsd asd" rows from the live sheet.

## Not checked
- Real iPhone/Android devices (phone views were 390px frames on desktop Chrome, so touch-only behaviour wasn't tested).
- Lighthouse performance scores and live Apps Script emails.
- Keyboard-only pass on the calendar and the booking forms (do this when the booking flow is next touched).
