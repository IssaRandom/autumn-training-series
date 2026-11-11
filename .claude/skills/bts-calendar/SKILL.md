---
name: bts-calendar
description: Build or update the Beyond the Shift ILCA season calendar (/beta/calendar) — data schema, colour coding by event type, rig lanes for ILCA 4/6/7, and the researched 2026/27 event dates. Use when adding events, changing the calendar UI, or checking qualifier/championship dates.
---

# ILCA season calendar

Data snapshot (with sources + caveats): `events-2026-27.md` in this folder. Re-verify before publishing; ILCA UK portal is the source of truth: https://portal.ilca.uk/events

## Data (built)
One file: `autumn-training-series/beta/data/events.js` → `window.BTS_EVENTS` (JS, not JSON: no fetch, shared by homepage + calendar) and `window.BTS_TYPES`.
```js
{ id: "no1", name: "National Open 1 (Rooster)", short: "NO1", start: "2027-03-13", end: "2027-03-14",
  venue: "WPNSA", rigs: [4,6,7], type: "national-open", url: "...", status: "provisional"?, checkNor: true?, optional: true?, note: "" }
```
- `short` is shown when a bar is narrow, so always give one. `rigs: []` = all rigs or allocated by ranking. `optional` = masters/women's events (hidden by default).
- BTS camps are duplicated from the live `camps` array in `script.js`, so keep them in sync.
Types (chips = legend; colours in `beta.css` `--t-*`, all pass AA with white text):
`bts-camp` red · `national-open` electric blue · `championship` navy with a gold inset edge · `ilca-uk-training` teal #0B7A70 · `international` purple #6E46C4 · `deadline` white with a red outline and "!".

## UI (built — see STATUS.md for the full list)
- Engine `beta/calendar/cal-core.js`: `BTSCal.row({start, n, visStart, visEnd, events, minLanes, label})` renders any run of day cells. Bars are positioned in % via `--c/--s/--l/--n`, so zoom only changes `--day-w` and never re-renders. Lane packing is greedy.
- Year plan = 37-column weekday-aligned month rows (AnnuCal style) inside one scroll box (`.yp`, both axes, sticky header and labels). Zoom tiers z-xs/s/m/l are set from the day width.
- Months = 7-column week rows plus a list under each month (mobile default; the list is what makes it readable at 375px).
- Detail = `<dialog>`, a bottom sheet under 700px. Deep link `#event=<id>`.
- CSS animation for bar entry (not GSAP); reduced motion turns it off.

## Gotchas learned
- The sticky toolbar is a grid/flex parent of a horizontally scrolling chip row. It needs `min-width:0` and `grid-template-columns:minmax(0,1fr)`, or mobile browsers widen the layout viewport (we saw 1106px instead of 375px).
- `offsetTop` inside `.yp` needs `.yp { position: relative }`.
- Set `history.scrollRestoration = "manual"`, and re-anchor after `document.fonts.ready`, or the initial scroll lands on the wrong month.
- Touch pinch: `touch-action: pan-x pan-y` on `.yp` plus a non-passive `touchmove` with preventDefault. Desktop trackpad pinch arrives as Ctrl+wheel.
