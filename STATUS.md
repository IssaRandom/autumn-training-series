# BTS /beta — status

_Last updated: 2026-11-11 (round 2)_

## Where we are
- Phase 1 (homepage) and Phase 2 (calendar) **built and committed** on `beta` (217bf42).
- Phase 3 **New to ILCA guide template built**: `beta/advice/new-to-ilca/` + shared `beta/advice/advice.css` / `advice.js`. Homepage card 01 links to it. **Not committed yet** (nor the items below).
- 11 Nov round 2 (uncommitted): palette switched to the live site's navy + electric blue (red only for deadlines/warnings); calendar filter/rig changes now animate only what changed (ghosts out, ring in, "+3 shown · −5 hidden" pill); year plan is the only scroll area + click-drag pan; 16 new events (Vilamoura, Europa Cups, Kiel split into Olympic/youth halves, Warnemünde, Garda Easter, Sofía, SOF, RLymYC); event sheet shows NoR/SI links when an event has `nor`/`si`.
- Preview: `.claude/launch.json` → `site` (:8765) or `site-alt` (:8767 when another session holds 8765) → /beta/, /beta/calendar/, /beta/advice/new-to-ilca/
- Checked: no console errors, no sideways scroll at 375px, desktop at 1400px. **Not checked:** reduced-motion in a real browser (CSS/JS guards are in place), real iOS/Android pinch (only emulated), Lighthouse.

## Files (all in `autumn-training-series/beta/`)
- `index.html`, `beta.css` (design system, homepage, shared calendar row/bar styles), `beta.js` (nav, GSAP hero/reveals, Lenis on desktop only, next 3 trainings, 8-week teaser)
- `data/events.js`: **single data source** (`window.BTS_EVENTS` + `BTS_TYPES`) for homepage and calendar. BTS camps are copied from the live `camps` in `script.js` on `winter-dates-update`, so **keep both in sync**.
- `calendar/index.html`, `calendar.css`, `calendar.js` (UI), `cal-core.js` (shared row/lane engine, `.ics` export)

## Calendar design (decided)
- **Year plan** (desktop default): one row per month, 37 weekday-aligned columns like AnnuCal. Sticky weekday header and month labels. Zoom by Ctrl+wheel, trackpad or touch pinch, slider, +/−, Fit, or the keys + − 0. Zoom is anchored at the pointer. Four zoom tiers: xs = overview strips, s, m, l = full names. Bars switch to short names when narrow (container queries).
- **Months** (mobile default): 7-column month grids with bars, plus a readable event list under each month. A sticky month-jump strip tracks the scroll position.
- Filter chips double as the colour key. Rig filter (All/4/6/7). Masters and women's events are off by default. The chosen view and filters are remembered per viewer (localStorage).
- Tap an event to open a detail sheet (bottom sheet on mobile, swipe down to close) with prev/next, an event page or "Book with BTS" button, and "Add to calendar" (.ics). Deep link: `calendar/#event=<id>`. The homepage teaser links there.
- Clicking a month label in the year plan opens that month in the Months view.

## Next step
James to review the new palette + calendar transitions. Then commit, and Phase 4: Weymouth venue guide template (`beta/venues/weymouth/`), reusing the advice template parts plus a map, launch/parking info and a parents' section.

## Calendar roadmap (James, 11 Nov)
1. Add `nor`/`si` URLs to events as they publish (field + sheet UI done; only Portugal GP R2 has one).
2. Host copies of NoR/SI PDFs (beta/media/docs/) so links don't rot.
3. Parse NoR/SI → registration times, first warning, format, course area → show as "Key info" in the sheet.
4. Links per event: venue guide, weather forecast, BTS Navigator live wind, Windfinder historic wind for the event dates.
5. Cache-busting: browsers kept an old events.js — add `?v=` to data/script tags (or a short Cache-Control for /beta/data/) before launch.

## Booking system (v2, phase 1 code written, not deployed)
- Plan and James's answers: `BOOKING-PLAN.md`. Stack: Google Sheet (database + admin view) + Apps Script web app + Gmail (MailApp). No third-party accounts. The site is on Cloudflare Pages.
- **Built:** `apps-script/Code.gs` contains the whole backend: `setup()` builds the tabs, dropdowns and colours and seeds the 6 winter camps (`open`=N); sign-in by emailed code; profile and sailors; `book` (lock, waitlist when full, £20 late fee after the deadline, ref `BTS XMAS26 SMITH`); booking email with bank details, reference and medical link; admin copy; `whoIsGoing` (opt-in, first name + initial + club); medical form trigger; daily cleanup. Syntax checked, and the reference/escaping helpers unit-tested in node. **Not run in Google yet.**
- `apps-script/README.md` = James's setup steps (create the sheet, run setup, Settings, link the medical form, deploy, share with Kai).
- **Waiting on James:** (1) do the README setup and send the web-app `/exec` URL; (2) confirm the payment-due rule (seeded as booking deadline − 7 days); (3) camp capacities.
- **Next:** frontend phases 2–5 in `/beta/`: `account/` (code sign-in, profile, sailors, My bookings), `book/?camp=<id>`, places left and Who's going, beta banner with a link to the Google Form, and Book buttons from the calendar sheet. A shared `beta/booking/api.js` does `fetch(POST, text/plain)` to the `/exec` URL and stores the token in localStorage.

## Later phases
3 "New to ILCA" guide template · 4 Weymouth venue guide, About, Coaching · 5 real content, promote to live. Calendar polish: add an "Export all (.ics)" option, RYA Youth Nationals and Rooster series once published, and a "my rig only" filter in the URL for sharing.

## Waiting on James / Kai
- Slow-mo footage (60–120fps, ideally 4K, landscape + vertical) and photos. The hero `<video>` already has `data-src` and `data-src-mobile` hooks.
- Use "Beyond the Shift" name everywhere? (live meta says "KW | JF Sailing")
- Voice notes per guide topic
- Confirm with youth@ilca.uk that the Oct 2023 qualification policy is still current
- Check the hero headline and coach one-liners

## Placeholders in use
- Hero: poster image `../assets/images/hero-sailing-*.webp` (no video yet). Headline "Sail faster by thinking clearer." and intro are draft.
- Coach one-liners (James, Kai): draft.
- Advice hub: card 01 → New to ILCA guide; cards 02–05 still link to `#advice`.
- New to ILCA guide: all copy is draft from the skill outline; price/cost/sail-number tables are tagged "To verify"; hero + roof-rack images are picsum.
- Venue cards: picsum images (`seed/weymouth|poole|hayling|rutland`) and draft copy; they link to `#venues`.
- All "Coaching" / "Book" links go to the live site `/` until the beta Coaching page exists.
- Calendar: National Opens 2–6 are flagged "check NOR" (rigs unconfirmed). Provisional internationals are striped.
