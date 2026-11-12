# BTS /beta — polish & personality audit

_12 Nov 2026. A list of the small details that make a site feel hand-built by a pro and clearly yours. Sprint step 1 (P0 #1–5, #7, #11) built 12 Nov._

> **James's feedback (12 Nov):** no audio anywhere, so #6 (real sounds), #22 (voice-note clips), #23 (optional sound) and the horn in #18 are dropped. Easter eggs (#26) are a yes. Add more sailing animations: a **splash** on high-impact buttons like booking (#46) and a **wave** sweep when the calendar refreshes after a filter change (#47).

**Effort:** S = under an hour · M = half a day · L = a day or more.
**Status:** ✅ already in beta · 🟡 partly there · ⬜ not started.

---

## What the best developer sites have in common

| Site / source | What to learn from it |
|---|---|
| **Rauno Freiberg**, *Invisible Details of Interaction Design* | Good interaction design comes from small details people feel without noticing: gestures that match what they do (swipe to dismiss layers, pinch for precision) and motion that shows where things came from. |
| **Vercel Web Interface Guidelines** | A living checklist covering focus, hit targets, typography, loading states and forms. Pros get the boring basics perfect *before* adding flair. |
| **Josh Comeau** | Whimsy is a deliberate choice: his Like button plays a sound that rises in pitch with each click, and sound is a secret weapon because so few sites use it. It is always optional and never gets in the way. |
| **Emil Kowalski** (Sonner, Vaul, animations.dev) | Fast, short, ease-out motion. Things you use a lot should barely animate. Exits are quicker than entrances. |
| **Lynn Fisher** (lynnandtonic.com) | Rebuilds her site every year around one playful idea. One strong concept beats twenty random effects. |
| **Bruno Simon** | His portfolio is a car you drive around. A *signature* idea tied to who you are is what people remember. |
| **Linear / Stripe / Paco Coursey (cmdk)** | Cmd+K search, crisp type, numbers that never wobble, instant navigation. |

**The lesson for BTS:** pick **one visual language from sailing** and use it everywhere (wind, tacks, laylines, start sequences, signal flags), get the basics perfect, and keep jokes out of the parts where people pay or something goes wrong.

---

## Your personality toolkit (the motifs to reuse)

1. **Signal flags.** The international code flags spell B·T·S. Use them for the favicon, dividers, confetti and loading states. The AP flag (postponement) suits "loading" and "coming soon", and the chequered finish suits "booked".
2. **The beat.** Tacking upwind between laylines (already in the booking loader ✅). Tack = toggle, layline = progress, windward mark = done.
3. **The start sequence.** Countdowns run like a 5‑4‑1‑go start: "Next BTS camp: 23 days to the gun".
4. **Live wind.** Your Navigator data makes the site feel alive, which a template site can't fake.
5. **Your voice.** "Sail faster by thinking clearer." Short, direct coaching lines. You and Kai as real people with notes in the margins.
6. ~~**Real sounds.**~~ Dropped (James, 12 Nov: no audio). Motion carries it instead: splash and wave (#46, #47).

---

## P0 · Foundations (pros notice when these are missing)

| # | Detail | BTS twist | Effort | Status |
|---|---|---|---|---|
| 1 | **Button press feedback**: `:active { transform: scale(.97) }` at about 120 ms, hover effects only under `@media (hover:hover)` so phones don't get stuck hover states, `-webkit-tap-highlight-color: transparent` plus your own pressed state | Arrow CTAs nudge forward on hover ✅, and "bear away" slightly on press | S | ✅ |
| 2 | **Motion tokens**: `--dur-fast 120ms`, `--dur 200ms`, `--dur-slow 400ms` and an ease-out curve. Interface motion stays under 300 ms and exits are faster than entrances. Swap `transition: .3s` everywhere for tokens. | One "BTS ease" used site-wide | S | ✅ |
| 3 | **Custom text selection and caret**: `::selection { background: var(--blue); color:#fff }`, `caret-color` | Electric-blue highlight | S | ✅ |
| 4 | **Anchors land below the fixed nav**: `scroll-margin-top: 80px` on sections and `scrollbar-gutter: stable` | | S | ✅ |
| 5 | **Typographic care**: en dashes in date ranges (19–23 Jul), non-breaking spaces in "7.06 m²" and "ILCA 6", curly quotes, `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs, `font-variant-numeric: tabular-nums` on dates, prices and countdowns | | S | ✅ (HTML text; JS strings later) |
| 6 | **Self-hosted fonts**: Montserrat variable, preloaded, `font-display: swap` plus a `size-adjust` fallback so the text doesn't jump on load (this also drops the Google Fonts call) | | M | ⬜ |
| 7 | **Real identity everywhere**: one name ("Beyond the Shift"), not "KW \| JF Sailing" on the 404 and in meta. Also `theme-color` (navy), apple-touch icon and manifest on every beta page | | S | ✅ beta (live root still KW / JF) |
| 8 | **Social share cards (OG images)**: one per page, and for calendar events a generated card ("NO1 · Weymouth · 14–15 Mar") | Signal-flag border | M | ⬜ |
| 9 | **Loading states that hold their shape**: skeletons sized like the real content, no layout shift, no bare "Loading…" text anywhere | Skeleton shimmer runs like a wind streak, left to right | M | ✅ 12 Nov: `.skel` + wind-streak shimmer in fx.css; calendar (year rows / month cards / chips), account camps, guide contents, venue events + wind rose, picture shimmer until loaded |
| 10 | **Real images**: replace the picsum placeholders, use one consistent colour grade, add blur-up placeholders and width/height on every `<img>` (the audit found 11 without) | Navy-shadow grade on every photo | M | ⬜ |
| 11 | **Focus rings** match the button shape (radius-aware outline, 2 px offset) and every target is at least 44 px | | S | ✅ |
| 12 | **Reduced motion gets a calmer alternative** (fades, not nothing) and is checked in a real browser | | S | 🟡 |

## P1 · Signature moments (where the personality lives)

| # | Detail | BTS twist | Effort | Status |
|---|---|---|---|---|
| 13 | **First-visit intro** (once per session, under 1.2 s, skippable, never holds content back) | A wind line draws across the screen, a boat tacks once and the logo settles. On later visits, nothing. | M | ⬜ |
| 14 | **One loader language site-wide**: reuse the beat-to-the-mark loader for the calendar, account and guides (small version) | Tips and remarks already rotate ✅, so add coach-voice lines per page ("Calendar loading. Plan the season, then sail it.") | S | ✅ 12 Nov: small "beat" (boat tacking to the mark + coach line) on calendar, account, /book account step, venue guide; `data-loader="beat"` in loader.js |
| 15 | **Page transitions** with the View Transitions API (`@view-transition { navigation: auto }`). Pure CSS, ignored by older browsers. | A short horizontal "wake" wipe between pages; the calendar event bar morphs into the sheet | M | ⬜ |
| 16 | **Live wind badge** in the nav or footer: "Portland now · 14 kn SW ↗" from Navigator, arrow rotated to the real direction | The single most "made by a sailor" detail on the list | M | ⬜ |
| 17 | **Microcopy voice pass**: playful in empty, loading and success states; plain and calm in errors, payments and medical forms | Empty filter: "Flat calm. No events match, so try fewer filters." Booked: "You're on the start line." Sign-in: "Welcome back aboard." 404: "Off the layline" ✅ | M | 🟡 |
| 18 | **Booking-confirmed celebration**: a short burst, then gone. Off under reduced motion. | Signal-flag confetti (B, T, S flags), a boat crossing a chequered line . No sound. | M | ⬜ |
| 19 | **Countdowns as a start sequence** | "Next camp · 23 days to the gun". In the final 5 days the flags change (P flag up, then down at the start). | S | ⬜ |
| 20 | **Reading progress as a beat**: a thin bar on guides with a tiny boat sailing toward the mark as you scroll | Ties to the loader motif | S | ⬜ |
| 21 | **Coach margin notes** in guides and venue pages: small avatar, handwritten-style label, short tip | "James: on a NE at Portland, go left off the start, every time." This is what makes it feel personal. | M | ⬜ |
| 22 | ~~**Voice-note snippets**~~ (dropped: no audio): a 15–30 s clip from you or Kai on venue panels, with a waveform play button | You're already recording voice notes per wind direction, so publish short cuts | M | ⬜ |
| 23 | ~~**Optional sound**~~ | Dropped (James, 12 Nov: no audio). Replaced by #46 and #47. | – | ✖ |
| 24 | **Haptics on Android** (`navigator.vibrate(8)`) for toggles, rig switch and tack | | S | ⬜ |
| 25 | **New 404 in the beta style** with a 10-second mini-game: steer back onto the layline to "find" the page | Reuses the loader boat | M | 🟡 |
| 26 | **Easter eggs** (2–3, not more): click the logo 5× and a boat sails across; type `tack` and the page flips; a console message for developers | Console: ASCII ILCA, "Built by a sailor between sessions. Fancy sponsoring an Olympic campaign? →" (links to your athlete page) | S | ⬜ |
| 27 | **Signal-flag favicon** that changes state: AP flag while booking loads, chequered when confirmed | | S | ⬜ |
| 28 | **Coach cards with a hover or tap reveal**: a fact each ("Favourite venue: Cascais · Windiest race sailed: 32 kn") | | S | ⬜ |
| 29 | **Footer sign-off that changes**: "James is currently: training in Cascais" plus a local time, and "Built by James in Portland" | Updated from one line in a data file | S | ⬜ |
| 30 | **Link underlines** that draw in like a wake; arrows on external links | | S | ⬜ |
| 31 | **Toasts** (copy link, added to calendar, saved): one styled component, tick morph, bottom on phones | "Link copied. Send it to the squad." | S | ⬜ |

## P2 · Craft & credibility (what makes developers nod)

| # | Detail | BTS twist | Effort | Status |
|---|---|---|---|---|
| 32 | **Speed is a feeling**: preload the hero poster, defer GSAP, prefetch pages on hover (Speculation Rules), Lighthouse 95+ on mobile | | M | ⬜ |
| 33 | **Ctrl+K / "/" search** across events, venues and guides; a "?" key opens a shortcuts sheet (the calendar already has keys) | Placeholder: "Search events, venues, guides… try 'Weymouth'" | L | ⬜ |
| 34 | **Venue guides work offline** (service worker plus a "Save for the venue" button), because clubs have bad signal | "Saved. Works on the slipway with no signal." | L | ⬜ |
| 35 | **"Beach mode"**: a high-contrast light toggle for reading in bright sun (dark stays the default) | Sun icon; a real sailor problem | M | ⬜ |
| 36 | **Print styles** for kit lists, parent timelines and venue guides | Parents print things | S | ⬜ |
| 37 | **Web Share** on events and guides | "Send to a parent / coach" | S | ⬜ |
| 38 | **"Updated 12 Nov by James"** stamps on guides and the calendar, plus a small "What's new" note | Trust | S | ⬜ |
| 39 | **Forms done properly**: `autocomplete` and `inputmode` attributes, checks run when you leave a field, saved drafts, Enter submits, and the button shows progress and then success | | M | 🟡 |
| 40 | **Colophon page**: how the site was built, the fonts, the boat sounds and why | Developer-site tradition, and a nice story | S | ⬜ |
| 46 | **Splash on high-impact buttons** (Book a camp, Confirm booking, hero CTA): on press a small spray of droplets bursts from the tap point and a ripple ring spreads, in under 400 ms. Only these few buttons, never everyday ones. Reduced motion: a quick ring only. | Bow wave hitting a chop | S | ✅ (12 Nov) |
| 47 | **Wave on calendar refresh**: when filters or rig change, a soft wave crest sweeps across the calendar left to right and the bars re-settle behind it, like a set rolling through. Replaces the current filter transition, under 500 ms. | A swell line | M | ✅ (12 Nov) |
| 41 | **Styled scrollbars** on the calendar scroller and `overscroll-behavior: contain` on sheets | | S | ⬜ |

## P3 · Ambitious (later, once the basics are perfect)

| # | Detail | Effort |
|---|---|---|
| 42 | Hero water (WebGL) whose ripples and gusts follow the **live** Portland wind | L |
| 43 | Animated season-route map for the season templates (the boat trailer drives the route, with costs ticking up) | L |
| 44 | "Logbook" in My bookings: camps attended as a voyage map, with badges per venue | L |
| 45 | Weather-reactive site: more motion on gusty days, calmer on flat days | L |

---

## Don't (things that make a site feel amateur)

- A loader that adds waiting time. Show it only while something is really loading, and only once on first visit.
- Scroll-jacking or smooth-scroll on phones (Lenis is desktop-only ✅, keep it that way).
- A custom cursor that replaces the pointer. If you want one at all, use a subtle effect on the hero only.
- Any sound at all (James, 12 Nov), or jokes in payment, medical or error messages.
- More than 2–3 easter eggs, or effects that don't come from the sailing language.
- Made-up numbers in stat counters. Count up only real figures.

---

## Suggested first sprint (about 2 days, biggest feel gain)

1. ✅ P0 basics: #1–5, #7, #11 (done 12 Nov)
2. #17 Microcopy voice pass (needs 30 min of your lines)
3. ✅ #14 Loader language site-wide, plus #9 skeletons (done 12 Nov)
4. #15 View Transitions
5. #19 Start-sequence countdowns and #20 the beat progress bar
6. #26 Console message and logo easter egg, #27 flag favicon
6b. ✅ **#46 splash on booking buttons, #47 wave on calendar refresh** (done 12 Nov)
7. #16 Live wind badge (needs a Navigator data endpoint)

**What I need from you:** 10–20 one-liners in your voice (wins, coaching mantras, dry jokes), a photo of each coach, and a "currently" line.

Sources: [Rauno: Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design) · [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) · [Josh Comeau: whimsical animations](https://joshwcomeau.com/blog/whimsical-animations) · [Josh Comeau: use-sound](https://joshwcomeau.com/react/announcing-use-sound-react-hook/) · [CSS-Tricks on the Like button](https://css-tricks.com/?p=358690) · Emil Kowalski, Lynn Fisher, Bruno Simon and Paco Coursey from general knowledge (not re-checked today).
