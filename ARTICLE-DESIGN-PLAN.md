# Article design skill: plan

_Started 2026-11-13. Goal: a skill that turns a plain article (Kai's guides, venue guides, offshoots, athlete stories) into a layout that keeps people reading the whole way down, not just past the hero._

Calibration examples James likes:
- ESPN feature: https://www.espn.com/espn/feature/story?id=43832710
- LeBron Squarespace demo: https://lebronjames.squarespace.com/?password=demo
- Seed list (needs filtering): https://www.awwwards.com/websites/magazine-newspaper-blog/

## The rule that drives the research
**Judge the body, not the cover.** A site only counts if the article *below the hero* does something clever. For every site we open at least 2 real articles and score the middle third of the page, not the landing.

---

## Phase 1: Research (2 sessions)

### 1a. Calibrate on James's two examples (first, ~1 session)
Scroll each one end to end at desktop 1280 and phone 375. Screenshot every major "beat" (a change in layout, motion or pace). Write down:
- what each beat does to the story (introduce, reveal, slow down, compare, pay off)
- how it's built (sticky, scroll-linked, video, CSS only, library)
- what happens on the phone (does it degrade or get redesigned?)
- the rhythm: how often the layout changes, how long text runs before a break

This gives us the scoring sheet before we look at anything else.

### 1b. Wider corpus (~30 articles, delegated to a subagent)
Sources, chosen because they're strong on article bodies, not landings:
- Awwwards magazine/blog list, filtered by the rule above
- Newsroom graphics desks: NYT, Washington Post, Guardian, Reuters Graphics, Bloomberg, SCMP, BBC, FT
- ESPN, The Athletic, Red Bull and Nike long-form (sport is our niche)
- The Pudding (scrollytelling with data)
- Shorthand and Squarespace story showcases (what non-coders get, which is closest to our static site)
- Award lists: SND Best of Digital Design, Malofiej, Webbys (features category)
- Sailing-specific: America's Cup, SailGP, Olympic sailing features (what our audience already sees)

### 1c. Pattern cards (the main output)
One card per technique, saved in `references/patterns/`:

| Field | Example |
|---|---|
| Name | Sticky picture, stepping text |
| What it does for the story | Keeps one image in view while the text walks through it |
| Seen on | links + screenshot |
| Phone version | stacks, picture shrinks to a top band |
| How to build | `position: sticky` + IntersectionObserver, no library |
| Cost | weight, effort, a11y risks |
| Reduced motion fallback | plain stacked images |
| Use when / don't use when | step-by-step how-tos / short quick tips |

Taxonomy to fill:
1. **Openings**: cold open, title over video, title after the first paragraph
2. **Pacing**: chapters, pull quotes, full-screen breaks, "breather" spreads
3. **Scrollytelling**: sticky graphic + steps, scrub video, zoom into a photo
4. **Pictures and video**: full-bleed, grids, before/after slider, looping clips, captions in the margin
5. **Explaining things**: annotated photos (rigging!), diagrams that build, maps that fly between places
6. **Data**: small charts in the text, stat callouts
7. **Getting around**: progress bar, chapter nav, contents that follow you
8. **Type**: drop caps, display type per chapter, big numbers
9. **Interaction**: tap to reveal, quizzes, checklists
10. **Endings**: what next, offshoot guides, booking nudge

Plus an **anti-pattern list** (scroll-jacking, text over busy video, motion with no purpose, heavy pages on phones, landing-page-only design).

**Exit check:** at least 25 pattern cards, each seen on 2+ real sites, each with a phone version.

---

## Phase 2: Synthesis (part of a session)
Turn the cards into decisions the skill can make:
- **Content type → pattern set**: hub guide, photo offshoot (how-to), venue guide, athlete/coach story, event preview, quick tip
- **Rhythm rules**: e.g. no more than ~N phone screens of plain text without a beat; alternate dense and airy sections; one "big moment" per chapter at most
- **Budget rules**: motion and page weight limits for phones (>50% of our users)
- **Respect the writing**: patterns change presentation only; never reword or reorder copy the author owns (Kai's rule)

---

## Phase 3: Build the skill (1 session, using skill-creator)
Proposed layout:
```
article-design/
  SKILL.md            workflow + decision rules
  references/
    patterns/*.md     the pattern cards
    rhythm.md         pacing + budget rules
    anti-patterns.md
    corpus.md         every site studied, with scores
  assets/components/  vanilla HTML/CSS/JS snippets, one per pattern,
                      each with phone + reduced-motion versions
  scripts/
    scrollcap.py      screenshot a page every screen (for reviews)
    sheet.py          contact sheets
    rhythm_check.py   flag long stretches with no beat, density, pins, weight
```
Workflow the skill will follow:
1. **Read** the article and its type
2. **Beat sheet**: split into beats, mark the moments that deserve a pattern
3. **Storyboard**: pick patterns per beat, check rhythm and budget rules, show James the plan before building
4. **Build** from the component snippets
5. **Review**: scroll-capture at 375 and 1280, rhythm-check, reduced motion, then web-design-reviewer

## Phase 4: Prove it on real pages (1 session)
- Redesign the **New to ILCAs** guide (Kai's text unchanged) and one **photo offshoot** (e.g. how to lower the ILCA mast) as before/after.
- James picks what works; feed that back into the rules.

## Phase 5: Evals and tidy-up
- 3 test articles of different types, run through skill-creator evals.
- Check the trigger description fires for "lay out this article/guide", "make this guide more interesting", etc.

---

## Decisions for James (ANSWERED 13 Nov: generic skill + short BTS section; vanilla CSS/JS first; ~30-article corpus)
1. **Generic or BTS-only?** Recommended: generic skill (user level, `~/.claude/skills/article-design`) with a short BTS section (dark theme, Montserrat, Kai's copy rules), so it works on other projects too.
2. **Libraries:** recommended vanilla CSS/JS first (sticky, scroll-driven animations, IntersectionObserver), GSAP only where nothing else works. The beta already dropped a GSAP pin for being clunky.
3. **Research depth:** ~30 articles is the recommended middle. More costs tokens fast (every screenshot is expensive).

## Progress
- [x] Plan written (13 Nov)
- [x] 1a Calibrate on ESPN + LeBron (13 Nov): `research/article-design/calibration.md`, 13 first pattern cards, scoring sheet, shots
- [x] 1b Wider corpus (13 Nov, cut short on James's call): 10 articles / 8 sites in `research/article-design/corpus.md`; no sailing captured
- [x] 1b sailing top-up (13 Nov): 6 sailing pieces scored (SailGP ×2, Red Bull ×2, America's Cup, ETNZ; Olympics.com blocked, Red Bull "sea changers" not found). Sailing sites are plain news templates, 5–8/16
- [~] 1c Pattern cards: 26 cards, 14 seen on 2+ sites (exit check only partly met; 1-site cards provisional, marked (p))
- [x] 2 Synthesis (13 Nov): `research/article-design/rhythm.md` (content type → pattern table agreed with James, rhythm, budget, writing rules, storyboard checklist) + `anti-patterns.md`
- [x] 3 Build skill (13 Nov): `~/.claude/skills/article-design`: SKILL.md (161 lines, workflow + type table + BTS section), references (26 cards, rhythm, anti-patterns, corpus, calibration), scripts (scrollcap, sheet, new `rhythm_check.py`), six spine components (14, 15, 18, 20, 12, 03) with phone + reduced-motion versions, smoke-tested at 375/1280 × normal/reduced. Remaining components (16, 17, 13, 21, 04, 19, 06p …) to build when a page needs them. Calibration to check in Phase 4: the words/screen band was measured on desktop screens; at 375 a plain screen holds ~150 words. Baseline: New to ILCAs today = 154 words/screen, 3 beats, longest plain run 29 phone screens.
- [~] 4 Prove on New to ILCAs + an offshoot: New to ILCAs built + reviewed 13 Nov (longest run 29.4 → 1.91 screens, 3 → 28 beats, text diff 0); 13 photo placeholders; offshoot not started
- [ ] 5 Evals
