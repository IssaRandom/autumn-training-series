# Article design research

- `calibration.md`: Phase 1a notes on ESPN F1 + LeBron, beat sheets, the shared rules and the **scoring sheet**.
- [`corpus.md`](corpus.md): Phase 1b, 10 articles on 6 more sites plus a sailing top-up (6 articles on 4 sailing sites) scored on the middle third, top 10, findings and the pattern coverage table.
- [`rhythm.md`](rhythm.md): Phase 2. Content type → pattern set (agreed 13 Nov), rhythm rules, phone budget (≤3 MB, motion, reduced motion), respect-the-writing rules, storyboard checklist.
- [`anti-patterns.md`](anti-patterns.md): Phase 2. Every anti-pattern with where it was seen and what to do instead.
- `shots/`: one screenshot per beat or sighting (`<slug>-<width>-<frame>.jpg`) plus `overview-*` contact sheets.
- Built into the skill at `~/.claude/skills/article-design` (Phase 3, 13 Nov); these files are the source copies.
- `scrollcap.py URL OUTDIR WIDTH HEIGHT [step] [mid]`: headless scroll capture with a DOM probe per step (needs Playwright). Also logs bytes transferred (cross-origin included) and `prefers-reduced-motion` hits; `mid` captures only 0.3–0.7 of the page; `SCROLLCAP_RM=1` emulates reduced motion. `sheet.py DIR WIDTH COLS PER`: contact sheets.

## Pattern cards (26)

Target: 25 cards, each seen on 2+ sites. **Now 26 cards, 14 seen on 2+ sites.** "Seen on N" counts sites, not articles.

- [Horizontal timeline, pinned](patterns/01-horizontal-timeline-pin.md) (3. Scrollytelling), seen on 2
- [Camera over a world](patterns/02-camera-over-world.md) (3), seen on 1
- [Figure cards ("Fig N")](patterns/03-figure-card-sequence.md) (5. Explaining), seen on 3
- [Before/after pair](patterns/04-before-after-pair.md) (4. Pictures), seen on 2
- [Running mini chart](patterns/05-running-mini-chart.md) (6. Data), seen on 2
- [Segmented progress](patterns/06-segmented-progress.md) (7. Getting around), seen on 1
- [Motif dividers](patterns/07-motif-dividers.md) (2. Pacing), seen on 1
- [Collage that collapses into one line](patterns/08-collage-collapse.md) (1 / 3), seen on 1
- [Stacking cards](patterns/09-stacking-cards.md) (2), seen on 1
- [Stat card deck](patterns/10-stat-card-deck.md) (6 / 8), seen on 1
- [Cold open on one object](patterns/11-cold-open-object.md) (1. Openings), seen on 1
- [An ending object](patterns/12-ending-object.md) (10. Endings), seen on 2
- [Small chart dropped into the text](patterns/13-inline-small-chart.md) (6), seen on 4
- [Text cards over a pinned picture](patterns/14-cards-over-pinned-picture.md) (3), seen on 5
- [Chapter menu that follows you](patterns/15-chapter-menu-follows.md) (7), seen on 2
- [Diagram that builds step by step](patterns/16-diagram-that-builds.md) (5), seen on 3
- [Map that zooms and adds layers](patterns/17-map-that-zooms.md) (5), seen on 2
- [Chapter title band](patterns/18-chapter-title-band.md) (2 / 8), seen on 4
- [Chapter colour change](patterns/19-chapter-colour-change.md) (2), seen on 3
- [Boxed aside ("Did you know?")](patterns/20-boxed-aside.md) (2 / 5), seen on 3
- [Row becomes a column on phones](patterns/21-row-becomes-column.md) (4 / 6), seen on 2
- [Small multiples grid](patterns/22-small-multiples-grid.md) (6), seen on 1
- [Try-it slider](patterns/23-try-it-slider.md) (9. Interaction), seen on 1
- [Object turned by scroll](patterns/24-object-turned-by-scroll.md) (3), seen on 1
- [Split panel](patterns/25-split-panel.md) (4), seen on 1
- [Cut-out figure beside the text](patterns/26-cut-out-figure.md) (4), seen on 1

## Anti-patterns spotted so far
_Superseded by [`anti-patterns.md`](anti-patterns.md); kept as the Phase 1 notes._
- **Fake page height / scroll-jacking** (ESPN's 60,000px page): breaks find-in-page, anchors and screen readers.
- **Sound** (ESPN engine play buttons; NBC Detroit's inline audio player is opt-in but still audio): never on BTS.
- **Half-cards mid-pan on phones** (ESPN): a pan that looks fine at 1280 shows fragments at 375.
- **Photo rows that stack into a tower** (LeBron "Lift As You Climb", about 4 phone screens of photos): use a swipe row or one photo on phones.
- **Heavy pages on phones**: LeBron 20+ MB; in Phase 1b every page but one transferred 3.3–8.8 MB on a phone run, mostly pinned full-screen photos.
- **No reduced-motion fallback** (ESPN, LeBron; Nature brain had no rule at all; the rest only partial).
- **Very airy scrolly pages**: about 30 words per desktop screen (BBC "The boat that disappeared" 70 screens, Nature brain 78). Fine for a narrative, too slow for a how-to people want to skim.
- **Text runs with only a decoration beside them** (BBC screamer: 2–3 screens of text with a static drawing alongside). A drawing isn't a beat.
- **Non-scrolling "articles"** (Pudding "Walkachusetts" is tap-through; the page doesn't scroll): breaks the reading habit and find-in-page.
