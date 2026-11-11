# BTS /beta — status

_Last updated: 2026-11-11_

## Where we are
- Phase 1 (homepage) **built**. Phase 2 (calendar) **built early**: James wanted the year-planner look in the same session.
- Branch `beta` (off `master`). **Nothing committed yet.** `.claude/` and `STATUS.md` are untracked too.
- Preview: `.claude/launch.json` → `site` → http://localhost:8765/beta/ and /beta/calendar/
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
Commit the beta work, then Phase 3: build the "New to ILCA" guide as the advice-page template (`beta/advice/new-to-ilca/`). Get the outline from the bts-advice-content skill and use placeholder copy until the voice notes arrive.

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
- Advice hub: 5 cards link to `#advice` (guides not built).
- Venue cards: picsum images (`seed/weymouth|poole|hayling|rutland`) and draft copy; they link to `#venues`.
- All "Coaching" / "Book" links go to the live site `/` until the beta Coaching page exists.
- Calendar: National Opens 2–6 are flagged "check NOR" (rigs unconfirmed). Provisional internationals are striped.
