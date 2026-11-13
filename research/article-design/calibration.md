# Phase 1a: calibration on James's two examples

_13 Nov 2026. Both pages scrolled end to end in headless Chromium at 1280×800 and 375×812 (phone UA, touch), smooth wheel steps, one screenshot per step plus a DOM probe per step (sticky/fixed elements, videos, visible text, fonts). Tools: `scrollcap.py` + `sheet.py` in this folder. Screens in `shots/` (`overview-*` = contact sheets, the rest = one file per beat)._

_Note: the ESPN screenshots carry a consent pop-up in the bottom-left; ignore it._

| | ESPN "How F1 has evolved since 1950" | LeBron James Squarespace demo |
|---|---|---|
| What it is | A real long-form explainer (2,375 words) | A brand/profile page (≈500 words). More a showcase of motion than an article |
| Length | 60,000px tall = 75 desktop screens | ≈8,000px = 10 desktop screens, 11 phone |
| Words per screen | ≈32 (very airy) | ≈50 |
| A beat every | 1–2 screens | ≈1 screen |
| Built with | Custom JS: the page height is a fake 60,000px; one `position: fixed` viewport holds a huge "world" div (31,491 × 10,936px) that JS moves in x and y as you scroll. No GSAP, no CSS scroll-driven animation | Squarespace 7.1 + GSAP 3.12 ScrollTrigger (pins called `peel-pin`, a horizontal section called `hc-generated`), Squarespace image effects (parallax, film grain, liquid) |
| Type | Publico Banner (serif display) 100/78px desktop, 58/48 phone; BentonSans 17/24px body, 600px column (335 phone) | Montserrat 77–80px display (w800 and w500), Inter 16/25px body |
| Weight | Light page shell (most art is SVG + illustrations) | Heavy: 20–29 MB transferred on a phone first load (videos + big images) |
| Reduced motion | Nothing found (no `prefers-reduced-motion` rules, same layout under reduce) | Nothing found |
| Phone | **Redesigned**: same world and camera, re-composed for a narrow screen | **Mostly stacked**: same sections, pins kept, grids turn into tall columns |

## ESPN: beat sheet (desktop frame numbers → `shots/espn-1280-NNN.jpg`)

| # | Beat | What it does for the story | How it's built | Phone |
|---|---|---|---|---|
| 1 | **Cold open on an object** (000): one top-down 1950 car on cream, title "How F1 has evolved since 1950", "Scroll to continue" | Introduces: one image says "this is about the machine" | Fixed viewport, autoplay muted video + picture | Same, title 58px over the car |
| 2 | **Cars drive past the intro** (001–005): a McLaren, then the 2025 car, roll across while the short intro sits on the left | Introduces the span (1950 → today) without words | Camera pans right across the world; cars are pictures placed in the world | Same; intro text full width, car under it |
| 3 | **Kerb-and-asphalt column** (006–012): "Evolution" chapter in one narrow column, red/white kerb diagonals and black asphalt beside it, a small "lightest vs heaviest" bar chart dropped into the text | Slows down: the one long read, but the edges keep moving so it never feels static | Camera pans diagonally down; decoration is the track itself | Column goes full width, kerbs shrink to the edges. Longest plain-text run on the phone (≈6 screens) |
| 4 | **Big arrow turn** (012–013): a red kerb arrow points down-then-right | Signposts: "now we go sideways" | Graphic in the world | Same |
| 5 | **Horizontal timeline of champions** (013–041, ≈28 screens): year ruler at top, big serif team name, illustrated car + driver portrait, a "Champion car weights" line chart whose dot moves to the current year, "Fig N" labels | Compares: the core of the story, one car per stop, same layout each time so you see the change | Camera pans purely horizontal while you scroll down; running chart is SVG | One car per screen, text under the card, chart smaller. Still horizontal |
| 6 | **Beneath the bodywork** (041–046): back to a text column between diagonals | Breather after the long timeline | Diagonal camera move | Same |
| 7 | **Spec panels** (047–051): Engines 2×2 grid with play buttons (engine sounds), then Floor / Aero / Tires as top-down **before/after pairs** (1968 vs 2024), each with a 4-segment progress bar | Explains details: side-by-side comparison | Beige panels in the world; mini segmented progress per panel | Grid stays 2×2 above the text; pairs stack |
| 8 | **Shaping the future** (052–056): text column | Sets up the payoff | — | Same |
| 9 | **2026 rules as figure cards** (057–089): Body length, Total weight, Synthetic fuel, Wings, Tire width, 50/50 engine, Manual override, Body width; each: serif label + one illustration + short paragraph + "Fig N". Segmented chapter progress across the top (one segment per card) | Pays off, one fact at a time | Camera zig-zags between cards; asphalt/kerb wedges sweep in as transitions | One card per screen; the wedge transitions get busy, half-cards show mid-pan |
| 10 | **Finish line** (090): the car drives off past a dashed line | Ending: you crossed the line | Graphic | Same |
| 11 | **Credits + 3 related stories** on asphalt (091–095) | What next | Plain HTML | Same |

**Why it works:** one metaphor (the track) runs the whole way: kerbs are the dividers, asphalt is the background, the reader is the car. Text is never more than ~3 desktop screens without a picture moving beside it. Every section repeats one layout (timeline stop, figure card) so the reader learns it once and then just compares.

**Weak spots:** 75 screens is a lot of scrolling for 2,375 words; the phone version shows half-cards mid-pan; no reduced-motion fallback; scroll is hijacked into a fake page height (find-in-page and anchor links can't work); engine sounds (never on BTS).

## LeBron: beat sheet (fine capture, desktop frame numbers → `shots/lebron-1280-NNN.jpg`)

| # | Beat | What it does | How it's built | Phone |
|---|---|---|---|---|
| 1 | **Streaming-app hero** (000): video background, "Top 40 Career Plays", Play/Browse buttons, a row of numbered highlight thumbnails | Introduces (as a landing) | Video bg, carousel | Same, stacked |
| 2 | **Collage that collapses** (003–008): three photos around "Just a Kid, From Akron." slide together into one video, which shrinks away and leaves just the line | Reveal: lots of LeBron → one idea | GSAP pin (`peel-pin`), scale/translate per panel | Kept; photos stack vertically, same collapse |
| 3 | **Horizontal timeline** (009–011): huge yellow years (1984, 2003, 20..) over photo cards with short captions | Walks through time | GSAP ScrollTrigger horizontal pin | One card fills the width |
| 4 | **Card deck of stats** (012–016): tilted, framed stat cards ("40,000+ points", "4 championships", "1 promise") slide and fan across, pager dots | Compares/punchlines: numbers as objects | Pin + per-card transforms | Kept, cards a bit smaller |
| 5 | **Section title + photo row** (017–019): "Lift As You Climb" in yellow, three photos | Breather / chapter start | Plain grid with fade-in | Photos stack into a tall column (≈4 phone screens of photos, too long) |
| 6 | **Stacking card** (020–026): a yellow "More Than Basketball" card slides up over the photos and sticks; inside, checklist tiles and a huge "01" | Explains (values list) | `position: sticky` list items (`list-item … preFade`) | Card becomes a vertical list of yellow tiles |
| 7 | **Closing statement** (027–029): cream panel "Champion. Founder. Hometown Kid." with a vertical repeating "KingJames" strip and a photo | Pays off | Marquee text strip, plain layout | Same; strip runs down the left |
| 8 | **Curtain footer** (029–030): a rounded navy footer slides up over the last section, newsletter sign-up + recent posts | Ending: next step | Sticky footer under the content (`footer#footer-sections` is sticky) | Same |

**Why it works:** every screen moves something, and the motion always *edits* (many → one, one card → the next) rather than just decorates. Yellow on navy is used sparingly (years, one card, one title), so it reads as "look here". Montserrat display is the same family BTS uses, so the type feel transfers directly.

**Weak spots:** very little prose, so it says little about long reads; 20+ MB on a phone; the photo row turns into a long stack on phones; no reduced motion.

## What the two have in common (= the calibration)
1. **A beat at least every 1–2 screens.** Neither page lets a layout run more than ~3 desktop screens unchanged (ESPN's longest text runs still have moving edges).
2. **One repeated "unit" for the main body.** ESPN: timeline stop and figure card. LeBron: card. Repetition lets the reader compare.
3. **Horizontal timeline pinned in a vertical scroll.** Both use it for "through time". It's the strongest shared pattern.
4. **Motion edits the story** (pan to the next thing, collapse many into one, stack the next card). No pure decoration.
5. **Big display word + small body.** 80–100px display against 16–17px body, a 600px column at most.
6. **A clear ending object** (finish line, curtain footer) instead of the page just stopping.
7. **Neither has a reduced-motion version or keeps the phone light.** That's where BTS can be better, not just copy.

## Scoring sheet for Phase 1b (score the middle third, 0–2 each)
| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Beat frequency | text runs >3 screens with nothing | a beat every 2–3 screens | a beat every 1–2 screens |
| Motion has a job | decoration only | mixed | every motion reveals, compares or moves on |
| Repeated unit | none | some | a clear unit the reader learns |
| Phone | broken / just squashed | stacked, works | re-composed for phone |
| Reading | can't skim, scroll-jacked | normal | anchors, find-in-page, progress |
| Weight | >10 MB on phone | 3–10 MB | <3 MB |
| Reduced motion | none | partial | full fallback |
| Static-site friendly | needs a framework/CMS | some JS | vanilla CSS/JS |

ESPN middle third ≈ 2/2/2/2/0/2?/0/1 = **11/16** (weight unmeasured cross-origin; looked light). LeBron ≈ 2/2/1/1/1/0/0/1 = **8/16**.

## For BTS (sailing translations noted on the way)
- ESPN's **track metaphor** → our **water**: wake lines, tide arrows, a course map as the "world", start/finish line, the wave sweep we already have on the calendar.
- **Horizontal timeline** → a season (Jan–Dec), a sailor's pathway (ILCA 4 → 6 → 7), or a race (start → windward → leeward → finish).
- **Figure cards with "Fig N"** → rig settings, kit, boat parts (fits the photo offshoots).
- **Before/after pair** → right vs wrong sail trim, old vs new kit, ILCA 4 vs 6 vs 7 rig.
- **Running mini chart** → wind range, hiking hours, ranking through a season.
- **Curtain footer** → "book a session" ending.
- Never: sound buttons (James: no audio, ever).
