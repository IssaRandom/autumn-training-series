# Rhythm, budget and writing rules (Phase 2 synthesis)

_13 Nov 2026. Built from `calibration.md` (ESPN, LeBron), `corpus.md` (10 general articles + 6 sailing) and the 26 pattern cards. Cards marked **(p)** are provisional: seen on one site only. Use them, but say so in the storyboard, and prefer a 2+ site card that does the same job._

A **screen** here means one phone screen (375 × 812) unless it says desktop. A **beat** is anything that changes what the reader is looking at: a picture or chart, a pinned section changing state, a chapter band or colour change, an aside, a table/chart, a card sequence. Decoration that never changes (a static drawing beside the text, BBC screamer) is **not** a beat.

---

## 1. Content type → pattern set

Agreed with James 13 Nov. **Spine** = the main structure of the page; **Extras** = patterns to use where the copy suits them. Numbers are pattern cards.

| Content type | Spine | Extras | Avoid | Pace |
|---|---|---|---|---|
| **Hub guide** (New to ILCAs) | Chapter menu that follows you (15) + a title band per chapter (18) | Boxed aside for the author's notes (20); the author's tables as small charts (13) that turn into a column on phones (21); segmented progress (06p); **at most one** pinned picture with short cards (14) per chapter; ending object leading to offshoots (12) | Camera over a world (02), collage (08p), object turned by scroll (24p), horizontal timeline (01) unless the chapter really is a sequence | Dense: 75–95 words per screen, built for skimming and jumping |
| **Photo offshoot** (how to lower the mast) | Pinned photo + one card per step (14), **or** figure cards (03) when every step needs its own photo | Cold open on the object (11p), before/after (04), diagram that builds (16), stacking checklist (09p), ending back to the hub (12) | Chapter menu (too short), chapter colours | Airy is fine: one step per screen |
| **Venue guide** (Weymouth) | Map that zooms (17) with cards over it (14) | Chapter colour for sailors/parents (19), wind rose and ranges as small charts (13), small multiples of wind by direction (22p), chapter menu (15), aside (20), ending: events, then booking (12) | Camera over a world (02) except for one flagship | Mixed: airy map chapters, dense practical ones |
| **Athlete/coach story** | Pinned picture + cards (14) | Collage → one line (08p) or cold open (11p), cut-out figure (26p), career timeline (01, 4+ stops), stat deck (10p), split panel coach/sailor (25p), title bands (18), ending: booking (12) | Chapter menu, try-it slider | Narrative: the only type where airy (~30 words/screen) is allowed |
| **Event preview** | Facts first (no cold open): course map (17) + key-info aside (20) | Small chart of the wind for the dates (13), past-results grid (22p), ending: add to calendar / calendar sheet (12) | Anything pinned longer than one map; collage; object turned by scroll | Short and dense, 2–4 screens |
| **Quick tip** | One column with one figure (03) or one before/after (04) | Aside (20), ending: link to the parent guide (12) | Every pin, menu and band | Under 2 screens, no scrollytelling |

**How to pick the type:** go by what the reader came to do, not by length. Find a known answer → hub guide. Follow steps with the boat in front of them → photo offshoot. Plan a trip → venue guide. Be told a story → athlete/coach. Decide whether to go → event preview. One fact → quick tip. A piece that is two types is usually a hub guide with an offshoot to split off later (ask the author; never split their text yourself).

**Why pinned picture + short cards is the default spine (card 14):** it is the spine of 7 of the 10 best general middles, seen on 5 sites, the most phone-friendly scrolly pattern found, and cheap to build (sticky + IntersectionObserver). The sailing sites use none of it (finding 8), so it is also where BTS stands out most.

---

## 2. Rhythm rules

### 2.1 Gap between beats (phone screens of plain text)
| Type | Max plain-text run | Target |
|---|---|---|
| Hub guide, venue guide (dense chapters) | **2 screens** | a beat every 1–2 screens |
| Photo offshoot, athlete story, scrolly chapters | **1.5 screens** | a beat every screen |
| Event preview, quick tip | 2 screens (the whole page may be one run) | — |

Evidence: every top-scoring middle had a beat every 1–2 screens; the weaker text-led pieces (BBC screamer, Nature fusion's second half, every sailing site) let text run 2–3 screens with only a static picture. ESPN's longest phone run (≈6 screens) is its weakest stretch.

**If the author's text runs longer than the limit without a natural break,** don't invent one in the words. Use a presentation beat that sits *between* their paragraphs: an aside built from a note they already wrote, their table drawn as a chart, a photo, a pull of their own heading into a band. If nothing honest fits, accept the long run and flag it in the storyboard. Never split or reorder the paragraphs to make room.

### 2.2 Dense vs airy
- **Words per screen** is the measure. Text-led pages land at 75–95 words per desktop screen (Pudding, BBC screamer); scrolly pages at ≈30 (BBC boat: 70 screens for 2,170 words; Nature brain: 78 for 2,266; ESPN: 32).
- **~30 words per screen is too slow for skim guides.** Hub guides, venue guides, event previews and quick tips stay dense (75–95). Airy pacing is only for a narrative (athlete/coach story) or for **one** chapter that is genuinely a walk-through (a rigging sequence, a race leg by leg).
- **Alternate.** After an airy pinned section, the next section is dense; two airy sections in a row make the page feel slow. In a hub guide that means at most one airy section per chapter.
- **Total length check:** phone screens ÷ words. If a hub guide ends up over ~1 screen per 60 words, it is too airy; take a pin out.

### 2.3 One big moment per chapter
- A **big moment** = a pinned section (14, 16, 17, 01, 24p), a collage collapse (08p) or anything that takes over the full screen for more than one scroll.
- **At most one per chapter**, and at most one *type* of big moment repeated across the page (the repeated unit, calibration rule 2). Two different pin styles on one page reads as a showcase, not a story.
- Small beats (aside, small chart, photo, band) can be as frequent as the gap rule needs.
- **Pins stay short on phones:** max 6 cards / steps per pinned section (ESPN's 28-screen timeline is the warning), cards ≤ 60 words, never longer than one phone screen.

### 2.4 Repeated unit
Pick one card shape for the main body (step card, figure card, map card) and keep it for the whole page, so the reader learns it once. Chapter bands, asides and charts are the only other shapes.

### 2.5 Openings and endings
- Opening: by type (table above). Event previews and quick tips lead with the facts; no cold open.
- **Every page ends on an object (12)**, not a stop: a finish line or curtain, then 2–3 next things (offshoots, the parent guide, events at this venue, the booking nudge). Seen on 2 sites, and it is the cheapest win.

### 2.6 Getting around
- Pages over ~5 phone screens get the chapter menu (15). On phones it is a single "Chapter 3 of 6" pill that opens a drawer, never a tab row (both sites hide tabs at 375).
- Real `id`s on every heading; find-in-page, anchor links and the Back button must all work. No fake page height.

---

## 3. Budget rules (phones first: >50% of BTS users)

### 3.1 Page weight
| Budget | Limit (phone run: first load + everything lazy-loaded while scrolling) |
|---|---|
| **Hard cap** | **3 MB** per page |
| Target for hub guides, previews, tips | ≤ 1.5 MB |
| First screen (before scrolling) | ≤ 500 KB |

Evidence: general corpus 2.9–8.8 MB (median ≈ 6.5), only one under 3 MB; sailing sites 1.6–37 MB; LeBron 20–29 MB. Pinned full-screen photos and autoplay video are the cost every time.

How to stay under:
- Images: AVIF/WebP, `srcset` with a 375-wide and 750-wide phone size, `loading="lazy"` on everything below the first screen, explicit `width`/`height`. A pinned full-screen phone image ≤ 150 KB.
- **One pinned photo per pinned section**: card steps change the *crop*, a highlight or an SVG overlay, not the whole photo. Prefer SVG diagrams (16) over photo sequences.
- **Video:** none autoplaying on phones. If a clip is worth it, poster image + tap to play, `preload="none"`. Object turned by scroll (24p) only within budget (≤ 30 frames, ≤ 600 KB total), else 3–4 stills.
- No third-party embeds in the body (YouTube, Instagram, X): link out with a poster.
- Fonts: the site's existing Montserrat link only; no extra display font per article.
- Measure with `scrollcap.py URL OUT 375 812 0.8` (logs `total_bytes`).

### 3.2 Motion limits
- **Motion must have a job:** reveal, compare, or move on (calibration rule 4). Decoration-only motion is cut.
- **Durations:** state changes in a pinned section 200–400 ms (`--dur`, `--dur-slow`, the BTS ease). Enter fades/slides ≤ 400 ms, ≤ 24px of travel. Nothing loops in the article body.
- **One moving thing at a time** in the viewport. No parallax on body text. No scroll-jacking: the page scrolls at the reader's speed, always.
- **Pins:** CSS `position: sticky` + IntersectionObserver first; CSS scroll-driven animations (`animation-timeline: view()`) as an enhancement with a class-toggle fallback. No GSAP unless nothing else works (beta dropped a GSAP pin for being clunky). Use `svh` for pinned heights (iOS address bar).
- Only `transform` and `opacity` animate (and `stroke-dashoffset` for drawing lines).
- **No audio, ever** (James).

### 3.3 Reduced motion: required, not optional
Every pattern ships its reduced-motion version (each card has one). Under `prefers-reduced-motion: reduce`:
- Pins either unpin to a normal stacked list, or stay pinned with instant swaps (no cross-fades, no zoom).
- Horizontal timelines become a vertical list or a swipeable `scroll-snap` row.
- Enter animations off; content just appears. Charts draw at full size.
- `scroll-behavior: smooth` only under `no-preference`.
- **Check it:** `SCROLLCAP_RM=1 scrollcap.py …` must show every step's content. No page in the corpus scored 2 for reduced motion; BTS should be the first.

### 3.4 Phones are re-composed, not squashed
- Every wide element gets a phone design: rows → columns (21), tab bars → a drawer (15), pinned pictures re-cropped with the focal point kept (`object-position` per step), cards at ~85% width.
- **Fixed chrome on phones: one slim bar at most** (the site nav). No countdowns, sponsor bars or extra sticky headers in the body (SailGP loses about a quarter of every phone screen to them).
- Tap targets ≥ 44px; no hover-only content.

---

## 4. Respect the writing

1. **Presentation only.** Patterns change how the author's copy is shown, never what it says. No rewording, no trimming, no reordering, no splitting one section into two, no merging two into one, no new headings, no invented captions or stat callouts.
2. **Patterns come from structure that is already there.** A table the author wrote → chart or row-to-column (13, 21). A note or "tip" the author wrote → aside (20). The author's section headings → chapter bands (18) and the chapter menu (15). A list of steps the author wrote → step cards (14/03). If the structure isn't in the text, the pattern doesn't go in.
3. **Card text is the author's text.** When copy moves into a card over a pinned picture, it is the author's paragraph, whole and in order. If a paragraph is too long for a card (> 60 words), it stays in the normal column; don't cut it to fit.
4. **Missing pieces are flagged, not filled.** Alt text, captions and labels for new pictures are written by us, marked as ours, and kept factual (what the picture shows). Gaps in the author's content get the `.wip` "Still working on this" marker, not new prose.
5. **Kai's copy (BTS):** only the Website tab of his doc; his wording is never changed; his facts are taken as given; booking links go to the new booking system.
6. **Show the storyboard before building** (skill workflow step 3): beat sheet, chosen patterns per beat, rhythm check (max run, words per screen, big moments per chapter) and the weight estimate.

---

## 5. Storyboard checklist (what the skill checks before building)
- [ ] Content type picked, and the spine from the table above
- [ ] No plain-text run longer than the type's limit (or flagged with a reason)
- [ ] Words per screen in the type's band; airy only where allowed
- [ ] ≤ 1 big moment per chapter; one repeated unit for the page
- [ ] Pinned sections ≤ 6 steps, cards ≤ 60 words
- [ ] Ends on an object with 2–3 next things
- [ ] Weight estimate ≤ 3 MB (target 1.5 MB), first screen ≤ 500 KB, no autoplay video on phones
- [ ] Reduced-motion version for every pattern used
- [ ] Phone version designed for every wide element; one slim fixed bar at most
- [ ] Author's text unchanged and in order (diff the visible text against the source)
- [ ] Provisional (p) cards named as such
