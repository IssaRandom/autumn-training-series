# Weymouth & Portland venue guide: article-design audit and action plan

_Audit 16 Nov 2026 with the article-design skill. Page: `autumn-training-series/venues/weymouth/index.html`. Benchmark: New to ILCAs (`advice/new-to-ilca/`). Measured at 375 × 812 and 1280 × 800 on the local server._

**Heads-up:** another session is still editing the Weymouth page, `venues.css/js` and `explorer.css/js` (uncommitted, filling in James's answers). Nothing here touches those files until it's done.

## Status (16 Nov, night)
- **P0 done**, commit fcb20b5 (timeline .wip included). Patches the other session had already handled were skipped (takeaways, at-a-glance para, tide stat, checklist, desktop step gap).
- **P1 done**, commit dacb423: photo bands (5), teal parents' half, mini calendar + 3 events, finish-line ending to /book/. Sticky notes were already done by the other session; tide WIP strip NOT shrunk (James chose "title + big gauge" in round 2).
- rhythm_check 375: longest run 1.28 screens, 22 beats, 1.92 MB, first screen ~560 KB (over the 500 KB guide: uncompressed CSS + Caveat font; possible fix = split the bands/finish/minical rules out of article.css).
- **17 Nov (session start):** git clean apart from the untracked SEO audit folder; go-live is 3 commits ahead of origin (not pushed). No new answers from James found (photo permissions, flag credit, event-day times, hero lede are all still open), so nothing applied.
- **P2 storyboard written (below, "P2 storyboard"), waiting for James's yes.** Map positions James must confirm are listed there.
- **17 Nov (2nd check):** still no yes from James on P2 and no map-position answers found in the repo, so nothing built. P2 waits on his yes.
- **P2 REVERTED (17 Nov):** James didn't like the map additions ("not needed", "clunky"); reverted in 15a9a0e + 38f0ad6. Next: parents' guide.
- **Parents' guide (17 Nov, James picked):** picks map pinned with grouped cards scrolling past (8fa3d07), timeline = car park line + one marker (c64c656), calculator receipt (462d3a4), v=20261117b. Still open: a typical event day (then rebuild the timeline), pins for Beehive, Riptide, Billy Winters, Spinnakers.
- ~~P2 done (17 Nov)~~: 6830b35 (explorer story mode), 96abbb4 (page), 865fc97 (cache v=20261117a). Built as storyboarded; map positions unanswered, so placeholders marked (tbc) in the map labels and config comments. rhythm_check 375 OK (28.9 screens, 22 beats, longest run 1.28, first screen 472 KB). Next: James's phone review + the 6 positions.

---

## 1. Where it stands, in numbers

| | New to ILCAs (benchmark) | Weymouth now | Weymouth target |
|---|---|---|---|
| Content type / spine | Hub: chapter menu + photo bands | Venue, but no spine: plain `h2`s | Venue: **map that zooms (17) + text under a pinned panel (14)** |
| Beats counted (rhythm_check) | 33 | **6** | 14+ |
| Longest plain run | 2.06 screens | **3.82 screens** (2 FAILs) | ≤ 2.0 |
| Words per screen | 118 | 99 | 75–110 |
| Photo chapter bands | 6 | **0** | one per chapter (6–7) |
| Chapter colour per audience (19) | n/a | none: parents' half looks the same | navy sailing / deep teal parents |
| Ending object | finish line + 3 cards + Book button | 2 plain cards + text links to `/coaching/` | finish line → events → 2 guides → **Book** (`/book/`) |
| Page weight (phone) | 1.72 MB, first screen 575 KB | 1.51 MB, first screen 384 KB | ≤ 1.5 MB (the windy.app widget is extra on top) |
| Open markers (shown with `?review=1`) | 3 `.wip` | 1 wip, 5 verify, 15 todo, 7 draft, 5 PLACEHOLDER | only `.wip`/`.verify` for things James must supply |

The page already has three strong interactive pieces (wind/swell explorer, tide atlas, site-plan walk) and the recs map. What's missing is mostly **the frame that New to ILCAs has**: photo bands, a rhythm of beats between them, real asides, a proper ending, and copy that's all James's. The explorer, the best thing on the page, also hides most of the sailing copy behind the dial, and the notes sit *below* the map instead of reading *with* it.

---

## 2. Findings, beat by beat (phone first)

| # | Beat (now) | What's wrong | Fix |
|---|---|---|---|
| 0 | Hero | Lede is our draft (`.draft`, PLACEHOLDER). "Read 6 min" on phone vs 10 min in the source. Photo is Portland Port's. | Lede → `.wip` until James gives his line. Swap the hero for one of James's own Portland photos if he has one. |
| 1 | "The short version" box | Written by us. Two lines aren't in the notes ("Arrive the night before…", "swell decides your technique, tack by tack"). | Replace with the three lines James and Kai gave in the notes under **"What we add that nobody else publishes"** (swell nuance, the left-hand bend, persistent-shift blocks), styled as three icon tiles that link into the explorer. |
| 2 | Stat grid (2 / ~2 m / SW) | "~2 m spring range" and "SW most common" are ours and unverified. | Keep "2 race areas". The other two → `.verify` until checked against the wind stats and tide tables, or drop them. |
| 3 | **Explorer** (map + dial + notes) | Notes (up to ~350 words for harbour N) sit under the map, so on a phone the map scrolls away while you read about it. Harbour N says **"See pin 3 on the map" but there are no pins**. Harbour-W's first paragraph is our draft from James's sketch. `harbour-*` / `bay-*` fall back to todo lists for the gaps. | **Rebuild as the venue spine (17 + 14, round-4 style):** a compact map panel pins under the nav while the note paragraphs scroll beneath it. Each paragraph lights up and drives the map: zone highlights, pins and labels for the **middle wall, inner/outer loop, the left-hand bend, the Nothe, the dead spot behind the Bill, the SE wall lane (10 boat lengths)**, swell bending round the Bill. Dial stays the chooser. Bias bars fill as you reach them (replaying). Phone: map panel ~40svh; reduced motion: static map per paragraph, no pin. |
| 4 | Bay W technique table | Row text ("shuffle back about 3 inches"…) isn't in the 16 Nov notes. | `.verify` with James (from the 11 Nov transcript?). On phones make it row-to-column (21). |
| 5 | Wind rose (windy.app widget) | Third-party embed in the body (skill rule: none), **white theme on a dark page**, `.verify` on the spot ID. The heading says "wind rose" but the widget is a monthly table. | First choice: tap-to-load poster ("Show 10 years of wind stats") in the dark theme mode, so nothing third-party loads until asked. Better later: our own monthly wind rose / small multiples (13 / 22p) from the windy.app numbers, if James can export them. |
| 6 | Forecast and live wind | Two boxed callouts in a row read as "plain boxed notes" (James dislikes these). Navigator `.verify` line is shown to readers. | Turn "The wall over-reads" into the **sticky-note aside** used in New to ILCAs (handwriting, tilted). Navigator screenshot + link become one tappable card. Resolve the link check, then delete the visible verify line. |
| 7 | Tide and swell | The swell paragraph repeats the explorer notes. "Inside the harbour the tide is weak" is ours (`.draft`) next to a visible todo "Check the tide notes". The tide-model WIP block takes a whole phone screen with a big placeholder (James: no placeholder blocks that get in the way). | Swell paragraph → a short "pick a wind on the explorer" link chip back up the page (or confirm James wants it). Our tide line → `.wip`. **Tide atlas is this chapter's big moment:** optionally let scroll scrub the 13 hours while it's pinned (one pin per chapter), with play/slider kept. Shrink the WIP model to a slim strip with the tape motif. |
| 8 | Launching and ashore (site-plan walk) | **Desktop: the pinned plan covers the "Launching and ashore" heading** (frame 008 shows "…HORE"). **Phone: near-empty screens between steps** (frames 12 and 14). Steps aren't tagged as beats, so rhythm_check counts them as 3.7 screens of plain text. Slipway position and car park name are open todos. "Changing" card is ours ("hot water runs out" is invented). | Fix the heading offset and the step spacing (tight, no big gaps). `data-beat` on the walk. Slipway zoom once James marks it. "Changing" → `.wip` or delete. |
| 9 | Parents' guide: the weekend | Timeline times and every sub-line are ours (PLACEHOLDER). | All lines → `.wip` until James gives a typical day; keep the shape. Then make it a **day clock**: the sun/tide dot moves down the timeline as you scroll (replaying). |
| 10 | Beds, food, best seat (recs map) | Good beat. Rail runs into the checklist, calculator and events with no break: **3.82-screen FAIL**. Checklist lines 1 and 3 are ours. Four places have no pin (Beehive, Riptide, Billy Winters, Spinnakers) and two pins need checking. | Pin the map under the nav while the rec cards scroll (same pattern as the site plan, one pin style per page). Checklist: keep "No need to pay for parking" (James's); others → James to confirm. Answer the pin todos. |
| 11 | What it'll cost (calculator) | Fine; defaults are examples. | Tag as a beat; style the output as a receipt (fuel / beds / entry lines tick in). Weymouth-specific defaults once James gives typical figures. |
| 12 | Events here this season | Renders 10+ full cards: ~2.5 screens of list on a phone. | Reuse the **mini calendar** from New to ILCAs filtered to WPNSA, plus the next 3 events as cards and "All events here". |
| 13 | Ending | Two plain cards, links to `/coaching/`, no finish object. | Reuse `.finish` (chequered line + buoys) from `article.css`. Order for venues: events (above) → New to ILCAs + All venues / Poole (soon) → **Book coaching button to `/book/`** + WhatsApp. |
| — | Whole page | No chapter bands. Parents' half not marked visually. `noindex` is deliberate until James signs the page off (STATUS.md); the beta flag is hidden by beta.css; internal markers only show with `?review=1`. Hide-on-scroll nav ✓, contents pill ✓. | See §3. Check what the public (non-review) view shows where our `.draft` copy is hidden, so no section opens with a gap. |

---

## 3. Storyboard (target)

```
Type: Venue guide   Spine: 17 map that zooms + 14 text under a pinned panel   Pace: mixed
Beat  Source                              Pattern                          Notes
0     Hero + lede + 2 audience cards      hero (as now)                    lede .wip until James writes it
1     "What we add" (notes, 3 lines)      3 icon tiles → explorer          James's words; replaces our takeaways
--    PART 1 SAILING  (navy)              19 chapter colour
2     Band: The water                     18 photo band                    James's photo
3     At a glance + stats                 plain + stat tiles               invented stats → .verify
4     Explorer, per area/direction        17 + 14 (panel under nav)        THE big moment; pins + layers per paragraph
5     Band: Wind stats & forecast         18 photo band
6     Wind stats                          tap-to-load widget → own 13/22p  no third-party until tapped
7     Forecast + "wall over-reads"        sticky-note aside (20)           Navigator card
8     Band: Tide                          18 photo band
9     Tide atlas                          scrub/pinned (one pin)           credit kept; WIP strip slim
10    Band: Ashore                        18 photo band (slipway)
11    Site-plan walk                      14 (same pin style)              fix gaps + heading
--    PART 2 PARENTS  (deep teal)         19 chapter colour + band
12    The weekend                         day-clock timeline               all .wip until James's day
13    Recs map                            14 (same pin style)              4 missing pins
14    Checklist + cost calculator         09p checklist + receipt          James confirms lines
15    Events here                         mini calendar + 3 cards (12)
16    Ending                              12 finish line → guides → Book   /book/
Rhythm:  target longest plain run ≤ 2.0 screens  ✓ planned   words/screen ≈ 90–110
Big moments: 1 per chapter (explorer, tide atlas, site plan, recs map)   one pin style: panel under nav
Weight: ~1.5 MB + bands (6 × ≤60 KB at 750w) → move windy widget behind a tap   first screen ≤500 KB ✓
Reduced motion: per pattern (static map per paragraph, plain list, no scrub)   Provisional: 09p, 22p
Flags: explorer notes run long in harbour N (6 paragraphs); fine under a pinned panel, too long for cards
```

---

## 4. Action plan

### P0: fix what's broken or not James's (small, do first)
1. Wait for / commit the other session's uncommitted Weymouth edits.
2. Desktop: site-plan pin covers the "Launching and ashore" heading. Phone: remove the empty gaps between plan steps.
3. Dangling "See pin 3 on the map" (no pins exist): hide the sentence's reference until the pins are built (P2), or mark `.wip`.
4. Everything we wrote → `.wip` / `.verify` with `<!-- EDIT LATER -->`: hero lede, takeaways, stat-grid tide and wind stats, "tide is weak", "Changing" card, timeline times and lines, checklist lines 1 and 3, harbour-W sketch paragraph (`.wip Draft` already), Bay-W table source.
5. Booking links in the ending → `/book/` (New to ILCAs uses `../../book/`).
6. `.verify`/`.todo`/`.draft` only show with `?review=1`, so check the public view: any block whose only content is hidden draft copy leaves an empty card or gap (e.g. "Changing", the hero lede). Delete the notes to James as they get answered.
7. Add `data-beat` to the site-plan walk, recs, calculator and events so rhythm_check measures the page honestly.

### P1: the New to ILCAs frame (presentation only)
8. Load `advice/article.css` + `article.js` patterns the page needs (bands, sticky-note aside, finish line), or move those patterns to a shared file both pages use. Avoid copying CSS twice.
9. Photo bands (`.band.band--photo`) for: The water, Wind & forecast, Tide, Ashore, Parents. Credits by name; James's own = "Photo: James Foster". **Needs photos from James** (§5).
10. Chapter colour (19): sailing chapters navy, parents' chapters deep teal, with a part divider band ("For parents"). Contents pill already groups by part.
11. Sticky-note aside for "The wall over-reads"; "Fog and cold northerlies" as a second note or kept as a callout (no two boxes in a row).
12. Ending object: finish line → events → 2 guide cards → Book button.
13. Events: mini calendar filtered to WPNSA + next 3 events.
14. Shrink the tide-model WIP block to a slim strip.

### P2: the explorer becomes the spine (the big build)
15. Panel-under-nav layout: map pinned (~40svh phone, side column desktop), the notes for the chosen area/direction scroll beneath; the paragraph being read lights up.
16. Map layers per paragraph (code, ours): pins and labels for the middle wall, inner/outer loop, the left-hand bend, the Nothe, the dead spot behind the Bill, the SE wall lane (10 boat lengths), the gate rounded with a right turn; swell bend highlight round the Bill and the wall. Rotations always the short way; no swell inside the harbour (existing rules).
17. Bias bars fill on entry and replay.
18. Reduced motion: static map state per paragraph, no pin. No JS: map then all notes in order.
19. Keep wind lines straight until James's drawings arrive (15 Nov rule).

### P3: the rest of the beats
20. Wind stats: tap-to-load poster in dark mode; later our own monthly rose (needs data export).
21. Tide atlas: optional scroll-scrub while pinned (keep play + slider). Only if it doesn't clash with the explorer pin style.
22. Recs map pinned under nav while cards scroll; add the 4 missing pins when James gives locations.
23. Day-clock timeline for the parents' weekend (after James gives a real day).
24. Cost calculator receipt styling; Weymouth defaults from James.
25. Remove `noindex` when James signs the page off.

### P4: review (skill step 5)
26. `rhythm_check.py … --type venue`: longest run ≤ 2.0, beats ≥ 14, weight ≤ 1.5 MB, first screen ≤ 500 KB.
27. scrollcap at 375 and 1280 + contact sheets; reduced-motion capture (`SCROLLCAP_RM=1`): every explorer paragraph and plan step visible.
28. Text check: snapshot the visible text before P1, word-diff after each phase (only markers may change).
29. web-design-reviewer `/beta` profile; cache-bust with `tools/beta-bust.py`; commit per piece.
30. Phone review rounds with James.

---

## 5. What James needs to supply or answer

**Words**
- Hero lede (one or two lines in your voice).
- A typical event day for parents (times, what happens).
- Is the Bay-W technique table yours (shuffle back ~3 inches, etc.)? Source?
- Checklist: keep "folding chair / flask / coat" and "spare kit and towel"?
- Changing rooms and showers: anything worth saying?
- Typical cost defaults for a WPNSA weekend (entry, a night's stay).

**Facts to check**
- Spring tide range figure and "most common breeze" for the stat tiles, or drop them.
- windy.app spot ID (8504749) is the right one.
- Navigator link: open on Portland?
- Slipway positions on the site plan; is the gravel car park the "Main Car Park"?
- Pins: RYA Portland House, Shalim's = "Balti House"? Locations for Beehive, Riptide, Billy Winters, Spinnakers.

**Pictures (your library or credited)**
- Band photos: water/racing off Portland, forecast/wind (e.g. the wall or flags), tide/harbour entrance, slipway/boat park, parents on the quay or Weymouth town. Hero swap if you have a better Portland shot.
- Optional graphic from your tool: none required for P0–P2. Map pins and layers are code. If you want custom icons for the recs categories (stay, eat, coffee, watch, work), that's a `.gfx-slot` prompt: 5 icons, square, dark navy BTS line style.

---

## P1 band photos (James sent 16 Nov, late)
Files in `venues/weymouth/bands/` (`NAME-375/750/<max>.webp`), made from his five pasted images. Not wired in yet: the band build waits until the other session's Weymouth edits are committed.

| Band | File | Shows | Source James gave | Credit | Note |
|---|---|---|---|---|---|
| The water | `water-*` (max 960w) | ILCAs reaching in a breeze, the harbour wall and a cruise ship behind | wpnsa.org.uk ILCA UK National Open 5 2026 page | Photo: Paul Wyeth (from the file name `Laser-Racing-©-Paul-Wyeth.jpg`) | Only 960w: slightly soft on a wide desktop |
| Wind & forecast | `wind-*` (portrait, 800w) | Red and white flag on a committee boat, race officers | yachtsandyachting.com, Flying Fifteen Nationals at WPNSA | `.verify`: not in that article's captions (its photos are © Stephen Moncur) | Crop to the flag and horizon with object-position |
| Tide | `tide-*` (max 1280w) | Portland Bill and the lighthouse from the air | wdlh.co.uk (West Dorset Leisure Holidays) | Photo: West Dorset Leisure Holidays (alt text only) `.verify` | James has no tide photo; the Bill fits his "think about it close to Portland Bill" line. Could be the hero instead |
| Ashore | `ashore-*` (max 1200w) | WPNSA boat park and slipway from the air, ILCAs launching | wpnsa.org.uk | © Paul Wyeth / RYA (on the image) | Watermark sits bottom left; keep it visible or crop and credit |
| Parents | `parents-*` (max 1280w) | Weymouth old harbour and town from the air, evening light | cntraveller.com best things to do in Weymouth | `.verify`: page blocked to us; probably an agency photo | Likely a paid stock licence |

Weight: ~50–70 KB each at 750w, lazy loaded, so ~270 KB added on a phone below the first screen.
**Licence:** all five are other people's photos. Credit by name is our rule, but credit isn't permission: James to confirm he can use them (WPNSA/RYA/Paul Wyeth likely fine if asked; the Condé Nast one probably isn't).

---

## P2 storyboard (17 Nov, approved and built)

```
Type: Venue guide  Spine: 17 map that zooms + 14 text under a pinned panel (same pin style as the site-plan walk)  Pace: airy here only
Note (James's)   Words  Para  What the map does as each paragraph reaches the reading line
overview-*        70     1    whole chart, both hotspots pulse once
harbour-W        192     4    bias fills 75 | zones (his sketch) | course: inner loop + left side tint | outer loop + right-turn gate lit | corners: bottom left ?, top right ✕
harbour-N        290     7    bias fills 62 | MIDDLE WALL pin + pressure blocks ±20° | left tint, flat-water right | inner loop | outer loop + Nothe line | Nothe arc | LEFT-HAND BEND lane
harbour-SE       123     2    bias fills 85 | WALL LANE (10 boat lengths) | pull out to the Bill: DEAD SPOT + wind wrapping both sides
bay-W            200     4+t  bias 50 | swell bends round the Bill then the wall (pull out) + QUALIFIER AREA | port/starboard vs swell | table: no change | camera eases toward Portland
bay-N            187     4    bias 60 | breeze dropping off the cliffs | pressure bounce marks | top-left corner tint | whole course
bay-SE            67     3    bias 50 | swell on, longer oscillation | downwind wave angle | harbour entrances lit (springs)
Rhythm: each paragraph = a beat; longest run ≈ 0.8 screen (70 words) ✓ ≤2   chapter is the page's one airy walk-through ✓
Big moments: explorer = 1 in its chapter ✓   one pin style (panel under nav) ✓   repeated unit: note paragraph with lit bar
Weight: code only, ~+10 KB JS/CSS, no images ✓   first screen unchanged
Reduced motion: map stays pinned, camera cuts, layers appear without fades, wind lines/swell a still frame, bias bars full
No JS: all notes rendered as plain sections (moved out of <template>), map hidden
Flags: camera moves 400 ms (rule max) inside one area; zooming out to the Bill = 600 ms (exception) | wind lines/swell loop (James-approved, pre-P2)
```

Layout: phone = map 40svh pinned under the contents bar, area tabs + small dial inside the map; desktop = map sticky in the left 55%, notes on the right. Active paragraph = accent bar + lit surface (no dimming of the rest).

**Map labels added by us** (from James's words, marked in comments): Middle wall, Inner loop, Outer loop, Right-turn gate, Left-hand bend, Wall lane, Dead spot, Qualifier area. The course glyph is schematic and turns with the wind, so left/right are always correct.

**James to confirm (positions):** where the middle wall is; where the inner/outer loops are usually laid (or OK with a schematic course mid-harbour); which wall the SE lane runs along (we think the outer breakwater); where the UKLA qualifiers race in the bay; where the left-hand bend sits in a northerly; show the hidden "See pin 3 on the map" line once the bend is marked, or drop it.
