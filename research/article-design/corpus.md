# Phase 1b: wider corpus

_13 Nov 2026. 10 articles scored on 6 sites (plus ESPN and LeBron from Phase 1a). The capture run was stopped early on James's call, so 20 planned articles are listed below as "not captured", including every sailing one._

## Method
- **Capture**: `scrollcap.py` in headless Chromium (Playwright), each article at 1280×800 and 375×812 (phone UA, touch), wheel steps of 0.8 screen. Frames and logs stay in the scratchpad; only evidence shots are copied to `shots/`.
- **Judge the body, not the cover**: only frames between 1/3 and 2/3 of the page height are scored. One contact sheet per article (desktop row, then phone rows); single frames only when a sheet was unclear (none needed).
- **Mid mode**: after a slow first run, `scrollcap.py` got a `mid` option that wheels quickly to 0.3 of the page and captures to 0.7. Man City, NBC Detroit and The Conversation come from mid-mode runs that hit the 8-minute limit before writing `log.json`: their frames are all middle-third, but weight and reduced motion are unmeasured (`?`).
- **Scoring**: the 0–2 sheet from `calibration.md` (8 criteria, /16). Anchors: ESPN F1 11/16, LeBron 8/16. Where weight and reduced motion are `?`, the total is out of 12 and marked.
- **Weight**: summed CDP `Network.loadingFinished` encodedDataLength (cross-origin included) over the whole phone run: first load plus everything lazy-loaded while scrolling.
- **Reduced motion**: counted `prefers-reduced-motion` in every CSS and JS response the page loaded. A hit scores 1 (some rules exist); 0 = none found. No run with reduced motion emulated was done, so no page scores 2.
- **Reading**: anchors, chapter nav and progress bars from the DOM probe. All ten pages use real DOM text (find-in-page works).
- **Static-site friendly**: 2 = plain CSS and a little vanilla JS; 1 = a framework (Svelte) or a story builder (Shorthand) whose effects we can copy by hand; 0 = a heavy custom engine.

## Swaps, blocks and the early stop
- The Pudding "Walkachusetts" (pudding.cool/2025/10/walk): a tap-through journal, the window doesn't scroll. Swap planned ("Women's sizing") but not captured.
- Arsenal "The rise and rise of Bukayo Saka" (Shorthand showcase): "Access Denied" bot block at both widths. Swap planned (CNA video-game museum) but not captured.
- A PC crash part-way through; incomplete captures were deleted and re-run. James then stopped the run to save time.

## Articles (middle third scored)
Scores: Beat / Motion / Unit / Phone / Reading / Weight / Reduced motion / Static.

| # | Site | Article | Type | B | M | U | P | R | W | RM | S | Total | What the middle does | Cards |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | The Pudding | [Dicing an onion, the mathematically optimal way](https://pudding.cool/2025/08/onions) | explainer | 2 | 2 | 2 | 1 | 1 | 1 | 1 | 1 | **11/16** | One onion diagram redrawn each step, puffy display words as section breaks, a boxed aside, then sliders to try it (7.9 MB) | 16, 18, 20, 23 |
| 2 | The Pudding | [Ethical NBA championships, ranked](https://pudding.cool/2026/06/ethical-champions) | sport data story | 2 | 1 | 2 | 2 | 1 | 2 | 1 | 1 | **12/16** | A grid of season cards (a pile of cartoon heads per season), then a logo beeswarm that turns vertical on phones (2.9 MB) | 13, 21, 22 |
| 3 | BBC Sport (Shorthand) | [The slow death of the screamer](https://www.bbc.co.uk/sport/extra/7ruba7shs4/the-slow-death-of-the-screamer) | sport feature | 1 | 1 | 1 | 1 | 2 | 1 | 1 | 1 | **9/16** | Cream page, duotone player drawings beside the text, line and bar charts in the column, sticky chapter tabs (7.0 MB) | 13, 15, 26 |
| 4 | BBC Sport (Shorthand) | [The Great British Olympic battle royale](https://www.bbc.co.uk/sport/extra/gmb6tosa5a/the-great-british-olympic-battle-royale) | sport data story | 2 | 2 | 2 | 2 | 2 | 1 | 1 | 1 | **12/16** | One chapter per sport: cut-out athlete pinned on a gradient, text cards over it, then a medal chart; chapter colour changes; "Did you know?" boxes (8.8 MB) | 13, 14, 15, 18, 19, 20, 26 |
| 5 | BBC News (Shorthand) | [The boat that disappeared](https://www.bbc.com/news/extra/vdb6u1mrrv/the-boat-that-disappeared) | narrative (at sea) | 2 | 2 | 2 | 2 | 1 | 1 | 1 | 1 | **12/16** | Graphic-novel panels pinned full screen with caption cards; a Mediterranean chart it keeps returning to; a split-screen phone call (3.3 MB) | 14, 17, 25 |
| 6 | Nature (Shorthand) | [What's so special about the human brain?](https://www.nature.com/immersive/d41586-024-03425-y/index.html) | science explainer | 2 | 2 | 2 | 2 | 2 | 1 | 0 | 1 | **12/16** | Dark navy; brain diagram with one region lit at a time, neuron drawings compared across species, textured chapter bands (6.5 MB) | 04, 13, 14, 16, 18, 19, 21 |
| 7 | Nature (Shorthand) | [How the world's biggest laser smashed a fusion record](https://www.nature.com/immersive/d41586-024-03745-z/index.html) | science explainer | 1 | 2 | 1 | 2 | 2 | 1 | 1 | 1 | **11/16** | 3D target chamber pinned while cards walk through the shot (lasers fire, capsule implodes); then 2–3 phone screens of text with photos and a boxed side-by-side (5.6 MB) | 04, 14, 16, 20 |
| 8 | Man City (Shorthand) | [10 years of Manchester City Women](https://www.mancity.com/features/10-years-manchester-city-women/) | sport feature | 2 | 1 | 2 | 1 | 1 | ? | ? | 1 | **8/12** | A team line-up on a pitch pinned behind one card per player, then a navy "Footballing firsts" chapter with photo + cards | 14, 18, 19 |
| 9 | NBC News (Shorthand) | [Built to keep Black from white](https://www.nbcnews.com/specials/detroit-segregation-wall/) | history / data story | 2 | 2 | 1 | 2 | 1 | ? | ? | 1 | **9/12** | Detroit map zooms in, redlined zones appear, an archive form is laid over it, the wall is drawn in red; an inline audio player (opt-in) | 14, 17 |
| 10 | The Conversation (Shorthand) | [The science of beautiful buildings](https://stories.theconversation.com/the-science-of-beautiful-buildings/) | explainer | 2 | 2 | 2 | 1 | 1 | ? | ? | 1 | **9/12** | 3D building models turn behind caption cards; each card carries a small bell curve whose dot moves (phone only; desktop run timed out) | 05, 14, 16, 24 |

**Not captured** (planned, dropped when the run stopped): The Pudding "Women's sizing"; CNA video-game museum; Nature/NBC "window cords"; SCMP 120th anniversary and "In memory of"; Reuters "Welcome to the new Made in China" and "Europe's wildfire crisis"; Guardian "Seabed mining visual explainer" and "London buses visualised"; NYT "Snow Fall"; **sailing**: SailGP "Florian Trittel" and "Coutts on Dubai", Red Bull "The sea changers" (America's Cup) and "Travis Rice foiling in Antigua", Olympics.com "Ben Ainslie embraces anxiety", America's Cup "The boats", ETNZ "Dan Bernasconi and the AC38 rule"; CSIS "Mineral monopoly"; Stuff "The cluster paradox"; Public Eye "The curse of the sapphire". Also unscored: Pudding "Walkachusetts" (no scroll) and Arsenal (blocked).

## Sailing top-up (13 Nov, evening)
Seven sailing pieces, `mid` mode, 1280 + 375, 8 runs at a time (all done in about a minute). Olympics.com "Ben Ainslie embraces anxiety" refused both runs (`ERR_HTTP2_PROTOCOL_ERROR`, a bot block). Red Bull "The sea changers" could not be found, so Red Bull's Alinghi crew feature stands in for it.

| # | Site | Article | Type | B | M | U | P | R | W | RM | S | Total | What the middle does | Cards |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 11 | SailGP | [Florian Trittel's workout schedule](https://sailgp.com/news/22/florian-trittel-spain-wing-trimmer-workout-schedule/) | athlete Q&A | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | **7/16** | Bold question, short answer, a photo every 1–2 screens; quickfire one-line Q&A at the end (8.5 MB) | — |
| 12 | SailGP | [Russell Report: Dubai](https://sailgp.com/news/23/dubai-russell-coutts-report-spithill-subs-slingsby-united-states-team-shake-up/) | event preview / column | 1 | 0 | 0 | 1 | 1 | 0 | 1 | 1 | **5/16** | One paragraph, one photo, repeat; nothing changes in between (12.2 MB) | — |
| 13 | Red Bull | [Travis Rice: 1,000nm on a foiling boat](https://www.redbull.com/int-en/travis-rice-sailing-foiling-antigua) | adventure story | 1 | 0 | 0 | 1 | 1 | 2 | 1 | 1 | **7/16** | Short (≈630 words); text, embedded video, photo; the middle third is already the "More like this" feed (1.6 MB) | — |
| 14 | Red Bull | [The faces of Alinghi Red Bull Racing](https://www.redbull.com/us-en/the-faces-of-alinghi-red-bull-racing-revealed) | team feature | 1 | 0 | 1 | 1 | 1 | 2 | 1 | 1 | **8/16** | Text, then a crew table (name, age, role) that keeps its columns at 375 by cutting the role column off (2.0 MB) | — |
| 15 | America's Cup | [The boats](https://www.americascup.com/the-boats) | explainer | 2 | 0 | 1 | 1 | 1 | 0 | 1 | 1 | **7/16** | Big caps section heads, a boat photo with its spec numbers laid over it (crew, length, top speed), FAQ accordion at the end (37 MB on a phone: autoplay videos) | 03 |
| 16 | ETNZ | [Dan Bernasconi and the AC38 class rule](https://emirates-team-new-zealand.americascup.com/en/news/763_DAN-BERNASCONI-AND-THE-AC38-CLASS-RULE-AND-TECH-REGS.html) | technical explainer | 1 | 0 | 0 | 1 | 1 | 1 | 1 | 1 | **6/16** | Grey page, small text, photos and a YouTube embed between long paragraphs; then a sponsor wall (7.8 MB) | — |

Evidence: `shots/overview-ac-boats-375.jpg`, `shots/ac-boats-375-006.jpg` (spec card), `shots/overview-sgp-coutts-1280.jpg`, `shots/sgp-trittel-375-000.jpg` (chrome).

**What our audience already sees (findings 8–10):**
8. **Sailing sites publish plain news templates.** No pinned pictures, no diagrams that build, no chapter navigation, nothing that moves with the story. Every beat is "paragraph, photo, paragraph". Median 7/16, against 11–12 for the top of the general corpus. A BTS guide with even one pinned picture and short cards would look a level above what sailors are used to.
9. **Chrome eats the phone screen.** SailGP's header + event countdown + sponsor bar fill about a quarter of a 375 × 812 screen on every frame; Red Bull adds a location pop-up. Anti-pattern: anything fixed on a phone beyond one slim bar.
10. **Weight is all over the place:** Red Bull 1.6–2.0 MB (the only light ones), ETNZ 7.8, SailGP 8.5–12.2, America's Cup 37 MB (autoplay video). The technical subject matter (rules, boats) is exactly where a diagram that builds (card 16) would beat their photo-plus-paragraph.

No sailing piece used a pattern that was only seen on one site, so the provisional cards stay provisional. Card 03 (figure cards) gains a third site (America's Cup spec card).

## Per site
- **The Pudding** (11, 12): diagrams and charts carry the story; text stays in one column; light pages are possible (2.9 MB) but not guaranteed (7.9 MB on onions). Phones are re-composed, not squashed.
- **BBC (Shorthand)** (9, 12, 12): the strongest family. Pinned pictures with cards over them, chapter colours, sticky chapter tabs. The weaker one (screamer) is the most text-led: charts in the column but runs of 2–3 screens with only a drawing beside the text.
- **Nature (Shorthand)** (12, 11): dark navy with bright diagrams, the closest look to the BTS dark theme. One diagram, many states.
- **Man City, NBC, The Conversation** (one each, all Shorthand): each uses one pinned picture (pitch, map, model) as the spine of the middle.

## Top 10 (this corpus plus the Phase 1a anchors)
1. BBC Olympic battle royale, 12/16
2. Nature brain, 12/16
3. BBC The boat that disappeared, 12/16
4. Pudding NBA championships, 12/16
5. Pudding onions, 11/16
6. Nature fusion, 11/16
7. ESPN F1 (Phase 1a), 11/16
8. NBC Detroit, 9/12 + weight/RM unmeasured
9. The Conversation buildings, 9/12 + unmeasured
10. BBC screamer, 9/16

Ties are broken by phone and reading scores. No page scored 2 for reduced motion, and only one (Pudding NBA) for weight.

## Findings
1. **The best middles have one spine.** A single pinned picture (athlete, map, diagram, model) that changes state while short cards scroll over it. 7 of 10 articles do this (card 14). It is also the pattern that survives phones best.
2. **Beat spacing.** In the scrolly-led pieces a beat comes every 1–2 screens on both desktop and phone; text-led pieces (screamer, fusion's second half) let text run 2–3 phone screens with only an inline photo or chart. Scrolly pages are very airy: about 30 words per desktop screen (BBC boat 70 screens for 2,170 words; Nature brain 78 for 2,266) against 75–95 for text-led ones (Pudding, screamer).
3. **Phones are re-composed, not squashed.** Pinned pictures re-crop to fill the phone, wide rows turn into columns (card 21), chapter tabs become a drawer (card 15). Nobody shrank a desktop layout.
4. **Reduced motion is rare and partial.** Shorthand ships some `prefers-reduced-motion` CSS (10–11 rules on BBC, 0–1 on Nature); Pudding has one rule. None was checked with the setting on. Easy place for BTS to be better.
5. **Weight is the common failure.** Phone runs transferred 2.9–8.8 MB (median about 6.5 MB). Only one under 3 MB. Pinned full-screen photos are the cost.
6. **Shorthand vs custom.** Shorthand pages (8 of 10) are good at: pinned picture + cards, chapter colours, chapter nav, inline charts, title bands. They don't do: a diagram that truly redraws (they swap whole images), explorables, scroll-linked charts. Custom builds (Pudding, ESPN) do those, at more effort. Everything Shorthand did here can be rebuilt with sticky + IntersectionObserver on a static site.
7. **Sailing sites**: not captured in this run, so no evidence yet on what our audience already sees. Worth a short follow-up run on the seven sailing URLs listed above.

## Pattern coverage
| Card | Groups | Sites seen on |
|---|---|---|
| 01 Horizontal timeline, pinned | 3 | 2 (ESPN, LeBron) |
| 02 Camera over a world | 3 | 1 |
| 03 Figure cards | 5 | 3 (ESPN, LeBron, America's Cup) |
| 04 Before/after pair | 4 | 2 (ESPN, Nature) |
| 05 Running mini chart | 6 | 2 (ESPN, The Conversation) |
| 06 Segmented progress | 7 | 1 |
| 07 Motif dividers | 2 | 1 |
| 08 Collage collapse | 1, 3 | 1 |
| 09 Stacking cards | 2 | 1 |
| 10 Stat card deck | 6, 8 | 1 |
| 11 Cold open on one object | 1 | 1 |
| 12 An ending object | 10 | 2 (ESPN, LeBron) |
| 13 Small chart in the text | 6 | 4 (ESPN, BBC, Nature, Pudding) |
| 14 Text cards over a pinned picture | 3 | 5 (BBC, Nature, Man City, NBC, The Conversation) |
| 15 Chapter menu that follows you | 7 | 2 (BBC, Nature) |
| 16 Diagram that builds | 5 | 3 (Pudding, Nature, The Conversation) |
| 17 Map that zooms and adds layers | 5 | 2 (NBC, BBC) |
| 18 Chapter title band | 2, 8 | 4 (Nature, Pudding, Man City, BBC) |
| 19 Chapter colour change | 2 | 3 (BBC, Man City, Nature) |
| 20 Boxed aside | 2, 5 | 3 (Pudding, BBC, Nature) |
| 21 Row becomes a column on phones | 4, 6 | 2 (Pudding, Nature) |
| 22 Small multiples grid | 6, 4 | 1 |
| 23 Try-it slider | 9 | 1 |
| 24 Object turned by scroll | 3 | 1 |
| 25 Split panel | 4 | 1 |
| 26 Cut-out figure beside the text | 4 | 1 (BBC, two articles) |

**Against the exit check:** 26 cards (target 25 met), but only **14 are seen on 2+ sites** (target: all). Every card has a phone version. Groups still empty or thin: openings and endings (we only scored middles), pull quotes, full-screen photo breaks, looping clips, margin captions, progress bar, drop caps, big numbers, quizzes and checklists. These need the uncaptured articles (Guardian, Reuters, Red Bull, sailing) or a short top-up run.
