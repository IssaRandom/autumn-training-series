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
- `isNew: "YYYY-MM-DD"` = date added: the bar glows with a NEW tag (and the Months list shows a New tag) for 45 days (`FRESH_DAYS`, `BTSCal.isFresh`). Use it whenever James adds a batch of new dates ("make them glow").
- `interest: true` (BTS only) = dates set but no booking-sheet row yet: sheet says "Online booking opens soon" + "Register interest" (WhatsApp) instead of Book. Drop it once the sheet row exists.
- `prog: "#stop-x"` = the camp's stop in the programme article `advice/road-to-volos/` (sheet shows a "Programme" link; seo-head uses it as the Event url).
- `reg: true` = a registration-day marker (hatched gold, dashed outline), e.g. `nats-reg` on 7 Aug 2027.
- `placeholder: true` (BTS only) = dates not set: striped like provisional, sheet says "not open for booking", button is "Register interest" (WhatsApp), and it is left out of the homepage "next trainings".
- Never add a season-long series as one bar (it takes a lane in every month): use a one-day "opens" marker plus a note.
- `short` is shown when a bar is narrow, so always give one. `rigs: []` = all rigs or allocated by ranking. `optional` = masters/women's events (hidden by default).
- BTS camps are duplicated from the live `camps` array in `script.js`, so keep them in sync.
Types (chips = legend; fill `--t-*` and text `--t-*-tx` in `beta.css`, all AA on the dark calendar page; the homepage teaser uses the light cell tokens). James (11 Nov 2026): the muted palette was too bland, "we can afford to use colour here":
`bts-camp` electric blue #2f6df6 + white text, gradient and glow, always on the top lane (cal-core `PRIORITY`) · `national-open` green #22c993 · `championship` gold #ffc531 · `ilca-uk-training` orange #ff8a3d · `international` violet #b98cff (dark text on these four) · `deadline` dark red fill, red outline, "!" · Masters & women's chip pink #ff7ac6. Red means deadlines/warnings only.
- Add to calendar = Google Calendar link (`BTSCal.gcal`) + Apple/Outlook `.ics` (`BTSCal.ics`). Never offer only one.

## UI (built — see STATUS.md for the full list)
- Engine `beta/calendar/cal-core.js`: `BTSCal.row({start, n, visStart, visEnd, events, minLanes, label})` renders any run of day cells. Bars are positioned in % via `--c/--s/--l/--n`, so zoom only changes `--day-w` and never re-renders. Lane packing is greedy.
- Year plan = 37-column weekday-aligned month rows (AnnuCal style) inside one scroll box (`.yp`, both axes, sticky header and labels). Zoom tiers z-xs/s/m/l are set from the day width.
- Months = 7-column week rows plus a list under each month (mobile default; the list is what makes it readable at 375px).
- Detail = `<dialog>`, a bottom sheet under 700px. Deep link `#event=<id>`.
- CSS `bar-in` animation only on the first paint of a view (`render({intro:true})`). Filter and rig changes call `render({fx:true})`: FLIP — snapshot bar rects keyed `id|rowIndex`, re-render, then unchanged bars stay still, moved bars glide (WAAPI translate), removed bars become grey struck-through ghosts in a fixed `.fx-layer` clipped to the view, new bars pop in with an accent ring (`.is-new`), and a `.cal-delta` pill says "+3 shown · −5 hidden". Only on-screen bars animate. The month in view is re-anchored so rows growing/shrinking don't jump the scroll.
- Year plan is the ONLY scroll area (`html.cal-lock` stops page scroll in year view); mouse click-and-drag pans it (a drag swallows the click).
- Roadmap (James, 11 Nov 2026): per-event NoR/SI hosted on the event sheet; later parse NoR/SI for registration/start times, format, course area, venue → link to venue guides, live wind (BTS Navigator) and Windfinder historic wind for the event dates.

## Cache-busting
Every local .js/.css tag in beta HTML carries `?v=<version>`. After changing any beta script, stylesheet or events.js run `python tools/beta-bust.py` (version = today's date; pass `20261111b` for a same-day redeploy). New pages get stamped automatically on the next run.

## Gotchas learned
- The sticky toolbar is a grid/flex parent of a horizontally scrolling chip row. It needs `min-width:0` and `grid-template-columns:minmax(0,1fr)`, or mobile browsers widen the layout viewport (we saw 1106px instead of 375px).
- `offsetTop` inside `.yp` needs `.yp { position: relative }`.
- Set `history.scrollRestoration = "manual"`, and re-anchor after `document.fonts.ready`, or the initial scroll lands on the wrong month.
- No touch pinch (removed 11 Nov: horizontal-only and juddery). Phones zoom with − / + / Fit; desktop Ctrl+wheel / trackpad pinch still works. Lane height follows `--day-w` in CSS, and under 22px/day only Mondays are numbered (`z-thin`).
- Round 5 (11 Nov): Filter sheet with presets and default types (not all on), one-at-a-time tips that vanish once done, floating Today pill, entry-close reminder (`entryClose` field, else NO estimate start−3), Who's going for signed-in parents, venue guide block from `window.BTS_VENUES`. Don't put sponsor names in event titles (`sponsor:` field).
