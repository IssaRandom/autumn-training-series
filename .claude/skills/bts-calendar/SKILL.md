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
`bts-camp` brand blue #2463eb · `national-open` teal #0E7C86 · `championship` navy #061a3a with a gold inset edge · `ilca-uk-training` slate #5B6B82 · `international` violet #5E4BB8 · `deadline` white with a red outline and "!". (Retuned 11 Nov 2026 to match the live site; red now means deadlines/warnings only.)

## UI (built — see STATUS.md for the full list)
- Engine `beta/calendar/cal-core.js`: `BTSCal.row({start, n, visStart, visEnd, events, minLanes, label})` renders any run of day cells. Bars are positioned in % via `--c/--s/--l/--n`, so zoom only changes `--day-w` and never re-renders. Lane packing is greedy.
- Year plan = 37-column weekday-aligned month rows (AnnuCal style) inside one scroll box (`.yp`, both axes, sticky header and labels). Zoom tiers z-xs/s/m/l are set from the day width.
- Months = 7-column week rows plus a list under each month (mobile default; the list is what makes it readable at 375px).
- Detail = `<dialog>`, a bottom sheet under 700px. Deep link `#event=<id>`.
- CSS `bar-in` animation only on the first paint of a view (`render({intro:true})`). Filter and rig changes call `render({fx:true})`: FLIP — snapshot bar rects keyed `id|rowIndex`, re-render, then unchanged bars stay still, moved bars glide (WAAPI translate), removed bars become grey struck-through ghosts in a fixed `.fx-layer` clipped to the view, new bars pop in with an accent ring (`.is-new`), and a `.cal-delta` pill says "+3 shown · −5 hidden". Only on-screen bars animate. The month in view is re-anchored so rows growing/shrinking don't jump the scroll.
- Year plan is the ONLY scroll area (`html.cal-lock` stops page scroll in year view); mouse click-and-drag pans it (a drag swallows the click).
- Roadmap (James, 11 Nov 2026): per-event NoR/SI hosted on the event sheet; later parse NoR/SI for registration/start times, format, course area, venue → link to venue guides, live wind (BTS Navigator) and Windfinder historic wind for the event dates.

## Gotchas learned
- The sticky toolbar is a grid/flex parent of a horizontally scrolling chip row. It needs `min-width:0` and `grid-template-columns:minmax(0,1fr)`, or mobile browsers widen the layout viewport (we saw 1106px instead of 375px).
- `offsetTop` inside `.yp` needs `.yp { position: relative }`.
- Set `history.scrollRestoration = "manual"`, and re-anchor after `document.fonts.ready`, or the initial scroll lands on the wrong month.
- Touch pinch: `touch-action: pan-x pan-y` on `.yp` plus a non-passive `touchmove` with preventDefault. Desktop trackpad pinch arrives as Ctrl+wheel.
