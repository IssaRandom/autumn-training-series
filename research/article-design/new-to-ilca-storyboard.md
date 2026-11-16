# New to ILCAs: article-design storyboard (Phase 4, part 1)

_13 Nov 2026. Awaiting James's OK before building. Kai's text unchanged and in order._

## Before (rhythm_check, hub, 375 × 812)
- 36.1 screens, 5,550 words, **154 words/screen**, 3 beats (the 3 tables), 0 pins, 6 chapters
- Longest plain run **29.4 screens** (4,563 words, from after the price table to the end); second 4.2 screens. Limit 2.0. **FAIL**
- Weight 0.15 MB, first screen 149 KB (hero is a picsum placeholder)
- The 3 "Note" callouts are `div.callout`, so the checker counts them as plain text

## Plan
Type: Hub guide. Spine: 15 chapter menu (existing TOC, phone = "Chapter 3 of 6" pill + drawer) + 18 title band per chapter. Pace: dense.
Screens below use **150 words per plain phone screen** (measured), not the skill's ÷85.

| Beat | Kai's source | Words | Screens | Pattern | Notes |
|---|---|---|---|---|---|
| 0 | H1 + lede + meta | 45 | 1.0 | hero (existing) | real photo for picsum |
| 1 | Ch1 band "Which Rig Do I Choose?" | 5 | 0.4 | 18 | |
| 2 | 2 paras | 107 | 0.7 | plain | |
| 3 | Race-weight table | 25 | 0.7 | 13 bars → 21 | table cells unchanged, kept as real table for SR |
| 4 | 1 para | 135 | 0.9 | plain | |
| 5 | Transition-weight table | 19 | 0.6 | 13 → 21 | |
| 6 | 2 paras (height, age) | 215 | 1.4 | plain | |
| 7 | Ch2 band "Boats, Equipment & Other Boring Stuff" | 6 | 0.4 | 18 | |
| 8 | intro + builder/dealer list (5 pairs) | 70 | 0.8 | 21 two-column pairs | Kai's list items, unchanged |
| 9 | Note (Laser Performance) | 49 | 0.5 | 20 aside | callout → `<aside>` |
| 10 | 4 paras (which boat, new vs used, table lead-in) | 315 | 2.1 | plain | ⚠ 0.1 over |
| 11 | Second-hand price table (2 .wip rows) | 31 | 0.8 | 13 → 21 | wip rows shown as wip, no bar |
| 12 | 3 paras (rig, inspecting, gunnel) | 300 | 2.0 | plain | |
| 13 | Hull-repair list (3 items) | 71 | 0.8 | 03 card ×3 | his own grading: inconsequential / investigate / concern |
| 14 | 2 paras (dry hull, foils) | 96 | 0.6 | plain | |
| 15 | Note (carbon top section) | 56 | 0.5 | 20 aside | |
| 16 | 1 para (boatwork lead-in) | 57 | 0.4 | plain | |
| 17 | Boatwork list (7 parts) | 493 | 5.5 | **16 diagram that builds**, ILCA side-view SVG, sticky band; part lights up as its item scrolls in | Ch2's big moment. Items stay in the column (most > 60 words) |
| 18 | 1 para + FAQ list (4) | 187 | 1.4 | FAQ as 20 aside | |
| 19 | Kit para | 192 | 1.3 | plain | |
| 20 | Ch3 band "Towing" | 1 | 0.4 | 18 | |
| 21 | 5 paras | 226 | 1.5 | plain | |
| 22 | Upside-down steps (4) | 301 | 3.0 | 03 figure cards ×4 | needs 4 pictures, see decisions |
| 23 | 2 paras (right way up, onwards) | 199 | 1.3 | plain | |
| 24 | Ch4 band "Training" | 1 | 0.4 | 18 | |
| 25 | 5 paras | 200 | 1.3 | plain | |
| 26 | Note (domestic only) | 56 | 0.5 | 20 aside | |
| 27 | 13 paras, providers | 1,541 | 10.3 | plain + photo breaks | **long run**, see decisions |
| 28 | Ch5 band "Racing" | 1 | 0.4 | 18 | |
| 29 | 6 paras | 437 | 2.9 | plain (+1 photo after para 3?) | |
| 30 | Ch6 "Finale" 3 paras | 116 | 0.8 | plain → 12 ending object | |
| 31 | Keep reading (3 cards) + booking | — | 1.0 | 12 finish line | existing cards, booking → /beta/book/ |

Training with photo breaks: 260 | photo | 255 | photo | 265 | photo | 289 | photo | 236 | photo | 236 (all ≤ 2 screens). Breaks fall between paragraphs on topic changes (ILCA UK → ASC → RYA → devolved squads → other groups).

## Checklist (rhythm.md §5)
- [x] Type hub; spine 15 + 18
- [~] Plain runs ≤ 2: all but beat 10 (2.1, accept) **if** training/racing get photos; without photos, training is a 10.3-screen run, racing 2.9
- [~] Words/screen: est. ~50 screens → **~110** (top of the checker's warn line); 75–95 is not reachable without ~20 screens of filler
- [~] Big moments: one (beat 17). **7 steps vs the ≤ 6 limit** (Kai's list has 7; can't merge). Card ≤ 60 words n/a: text stays in the column, not on cards (checker will flag it as a pin anyway)
- [x] One repeated unit: 03 figure card (hull trio + towing steps)
- [x] Ends on an object (12): finish line → 3 offshoots → booking
- [x] Weight est. ~0.9–1.0 MB (hero ~130 KB, 6 photos ~70–90 KB each at 750w WebP, SVG diagram ~25 KB, towing figures 4 × ~60 KB or SVG, pattern CSS/JS ~15 KB); first screen ~300 KB; no video
- [x] Reduced motion: bands static, diagram layers switch instantly (or all shown, unpinned), cards just appear, charts full width
- [x] Phone: tables → column bars, diagram = top band ~38svh; hide the chapter pill while the diagram band is pinned so only the nav bar is fixed
- [x] Kai's text unchanged and in order (text diff at review)
- [x] Provisional cards: none (06p progress not used)

## Decisions for James
1. Photos for training (5) and racing (1), and pictures for the 4 towing cards. Only 3 sailing photos exist in `assets/images`. Options: send photos / use placeholders until you do / skip and accept the long runs.
2. Accept the 7-step diagram (one over the limit)?
3. Copy source: the page comment says Kai's **Guide** tab; the rule is **Website** tab only. Confirm the text on the page is the Website-tab text before the build's text diff uses it as the source.

## Built (13 Nov), approved with: placeholders for photos, 7-step diagram OK, page text = Website tab
Changes from the plan: Finale got a band too (else Racing→Finale = 3.4 screens); figure cards and the diagram carry `data-beat`; photo placeholders are plain figures (the checker skips `aria-hidden`).

## After (rhythm_check, hub, 375 × 812): PASS
- 42.95 screens, 5,710 words (incl. placeholder labels), 133 words/screen (WARN), **28 beats**, 6 chapters
- Longest plain run **1.91 screens** (was 29.4). Weight 0.24 MB, first screen 203 KB
- Text diff against the pre-build page: 5,554 / 5,554 words, 0 differences
