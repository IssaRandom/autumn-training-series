---
name: bts-beta-site
description: Build the Beyond the Shift /beta website (animated, scroll-driven redesign of beyondtheshift.co.uk). Use for any work on /beta pages, its design system, motion, homepage, coaching/about pages, or promoting beta to live.
---

# Beyond the Shift — /beta build

Start every session by reading `STATUS.md` (repo root). Update it before ending.

## Repo facts
- **LIVE since 16 Nov 2026:** the former /beta files now sit at the publish root (`autumn-training-series/index.html`, `beta.css`, `calendar/`, `advice/`, …). Wherever this skill says `beta/x`, read it as `x` at the root. The old live homepage is now `coaching/index.html`. New pages are indexable (no noindex). Placeholders and review markers stay hidden unless `?review=1`. Work on branches off `master`, then open a PR (Cloudflare Workers Builds deploys master).
- Static site, no build step. Publish root = `autumn-training-series/` (inner folder). Hosted on Cloudflare (serves `/page` without `.html`); netlify.toml/_headers also present.
- Live site files — DO NOT edit for beta work: `index.html`, `styles.css`, `script.js`, legal pages. Live camp data = `camps` array at top of `script.js` (beta may READ it for "next 3 trainings").
- Preview: `.claude/launch.json` config `site` → :8765. If another session already holds 8765, use config `site-alt` → :8767 (the port is hard-coded in the python args, so autoPort can't move it).
- Branch: `beta` off `master` (winter-dates-update is separate live work).

## Beta rules
- All beta code in `autumn-training-series/beta/`: `index.html`, `beta.css`, `beta.js`, sub-pages as folders (`beta/calendar/`, `beta/advice/…`, `beta/venues/…`). Shared images from `../assets/` ok; beta-only media in `beta/media/`.
- `<meta name="robots" content="noindex">` on every beta page; never add beta to sitemap.xml.
- Placeholders: images `https://picsum.photos/seed/<word>/1600/900` (or local grey SVG), text clearly marked `[PLACEHOLDER]` in HTML comments + realistic draft copy. Keep a list of placeholders in STATUS.md.
- **Photos + credits (James, 14 Nov 2026):** every outside photo carries a visible credit. **Name the photographer whenever it can be found** (watermark, caption, EXIF, the source post), the way the Ovington one reads: `© ILCA UK Ovington National Open 5, 2026. Photo: Lotte Johnson Film`. Only when no photographer is findable, credit the source and link it (`Photo: <a href=…>ILCA UK</a>`, YouTube = channel name, Reddit = `r/sailing on Reddit` with no username). James's own photos = **`Photo: James Foster`** (never "Beyond the Shift"). Unknown source = `<span class="verify">photo credit</span>` + an HTML TODO comment, and ask James. Small credit pill sits on the photo (`.ph .credit`, `.band__credit`); on polaroids it sits under the handwritten label.
- **Photo files:** WebP via Pillow (`python -` heredoc; `python -I` can't see Pillow), `<name>-750.webp` + `-1400.webp` (or native width if smaller), `srcset`/`sizes`, width/height, `loading="lazy"`, factual alt. Article photos live in the article's own folder.
- **Section heading bands get a photo behind the title** (`.band.band--photo` + `img.band__img`, dark fade from the bottom, white title, credit top right; in `beta/advice/article.css`). Section photos go IN the band, not as a figure under it. White text/dark rgba is allowed here because it sits on a photo in both themes.
- **Theme = DARK** (James, 12 Nov 2026 late: prefers the dark beta; the light live-site retheme was reverted). Structure, buttons, kicker and hero copy the live site; colours are the dark set (`:root` is in the dark scope in beta.css). Red only for deadlines/warnings. No anchors/rope/cartoon nautical. British English, no serial comma.

## Live-site structure, dark colours (the light section rhythm below is HISTORY: every page is now dark)
- **Section rhythm like live:** navy `#03132e` hero → white → navy → white → mist `#f6f8fc` → … → navy CTA → navy footer. Classes: `.section` (white), `.section.bg-grey` (mist), `.section.bg-navy` (navy). Sub-page heroes (`.g-hero`) are navy; page bodies light. Booking pages: mist page, white cards. **The calendar page and 404 stay dark** (`<body class="cal-page theme-dark">`).
- **Two token scopes, same names.** `:root` = light set (`--bg` #fff, `--bg-2` mist, `--surface` #fff, `--surface-2` ice #eef4fb, `--line` #d8e1ee, `--ink` #0a1830, `--ink-2` long-form text, `--heading` #0a1830, `--muted` #52627a, `--blue-300` = "accent text" #2463eb). The **dark scope** selector in beta.css (`.theme-dark, .on-dark, .bg-navy, .hero, .g-hero, .nav, .footer, .coach, .takeaways, .bk-camp, .bk-loader-stage`) redefines them (`--blue-300` #8fb5ff, `--heading` #fff, `--muted` #a3b3cb, surfaces #0a2148/#10295a…). A new navy component = add its selector there or give it `class="on-dark"`. **Never hard-code `#fff` text or dark rgba fills**; use `--heading`, `--ink`, `--muted`, `--surface`, `--overlay` (sticky frosted bars), `--shadow`/`--shadow-sm`, and the status pairs `--ok-tx/--ok-bg`, `--warn-tx/--warn-bg`, `--info-tx/--info-bg`, `--violet-tx/--violet-bg`, `--orange-tx`. White text on `--accent` fills is fine. SVG drawn in JS uses `style="fill:var(--x)"` (attributes can't take var()).
- **Type:** body + all small text `var(--font)` = **Montserrat** (Google Fonts link on every page). Condensed display ONLY for big type: `h1`, `h2`/`.h2`, `.quote`, big dates, coach names. h3/h4, buttons, labels = Montserrat, normal case. Calendar page = Montserrat only. (Old rule, superseded: all `h1–h4` = `var(--font-display)` = "Arial Narrow", "Roboto Condensed", Impact; weight 800, UPPERCASE, letter-spacing -.025em, line-height .98 (h3 1.1). Hero h1 clamp(4rem, 9vw, 8rem), line-height .79, -.045em. Section titles `.h2` clamp(2.45rem, 5vw, 4.75rem). Big numbers (dates, totals, stats) use `--font-display` too.
- **Kicker** `.eyebrow` = live `.section-kicker`: .77rem, 800, .18em tracking, caps, blue-600 on light / #8fb5ff on navy (automatic via `--blue-300`).
- **Georgia italic accent** `.serif-accent` (live "ILCA 4 & 6" line): #7ea8ff on navy. Use once per hero at most.
- **Buttons** = live `.button`: 5px corners (`--radius-sm`), 1px border, condensed caps .92rem 800 .045em, min-height 48, padding 13px 22px; primary `.btn-accent` #2463eb → hover #174dc4 + lift + blue shadow; `.btn-ghost` transparent with 55% currentColor border. Nav CTA = live `.button-small`.
- **Corners:** cards/panels `--radius` 12px, controls 7px, tags 3px (James found 6px "sharp"). No 99px pills on buttons or tabs (round dots/switches are fine).
- **Nav** = live header: navy fade gradient over the hero, `rgba(3,19,46,.97)` once scrolled; brand in tracked caps (`.logo`, `<b>` part light blue, weight 400); links .73rem 750 caps with a blue-500 underline that wipes in.
- **Focus ring** 3px #ffca3a (live). Cards: white, 1px line, `--shadow-sm`, hover `--shadow`.
- Before shipping a new part, compare against the live page side by side (Chrome: beyondtheshift.co.uk) and check it inside both a light and a navy section.

## Motion stack (CDN, pinned versions)
- GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.1.x (unpkg) smooth scroll.
- Hero = scroll-scrubbed slow-mo video: `<video muted playsinline preload="auto">`, set `currentTime` from ScrollTrigger progress. Encode with all-keyframes for smooth scrub: `ffmpeg -i in.mp4 -an -vf scale=1920:-2 -c:v libx264 -g 1 -crf 22 -movflags +faststart hero.mp4` (+ a 720p mobile version). Fallback: poster image.
- Patterns: pinned sections, split-text reveals, parallax images, count-up stats, horizontal scroll strips.
- `prefers-reduced-motion` → no scrub/parallax, static poster. Mobile: lighter video, no pinning on small screens if janky.

## Page map
Home (hub; hero + coach cards ported from the live index.html, CSS-only entrance, no pin/scrub) · Coaching (current training/booking, tidied) · Calendar (see bts-calendar) · Advice Hub (see bts-advice-content) · Venue Guides · About.
Nav: Advice, Calendar, Venues, About, then discreet "Coaching" button.

## Homepage sections (in order)
1. Full-screen hero, scroll-scrub video, short headline
2. Coaches: James + Kai headshot + one-liner (assets: james-foster-portrait.webp, kai-wolgram.webp). Keep both distinct; never swap likeness.
3. Next 3 trainings: venue + dates only, from live `camps` data → link Coaching
4. Advice Hub cards (4–5 topics)
5. Calendar teaser (next few weeks strip) → full calendar
6. Venue guide cards
7. Short about/philosophy ("Build the process. Then apply it under pressure.")
8. Low-key coaching CTA + WhatsApp link https://chat.whatsapp.com/Ela5XJPNzAq9mNSzR45p3q ; footer

## Build order
1 Base + homepage → 2 Calendar (parallel-safe, separate files) → 3 "New to ILCA" guide as template → 4 Weymouth venue guide template, About, Coaching → 5 real content, promote to live.

## Built so far (Phase 1–2)
- Shared: `beta.css` holds the tokens, nav, cards and the calendar row/bar base styles. Sub-pages link `../beta.css` and add their own CSS.
- Homepage data comes from `beta/data/events.js` (not from script.js: its `camps` is inside an IIFE and can't be read).
- The hero `<video data-src data-src-mobile hidden>` is ready. While it is empty, the poster image does a scale and parallax scrub. The hero is pinned on desktop only. Lenis runs on desktop only (it conflicts with inner scroll boxes, so it's not on the calendar page).
- Coach image parallax uses scale 1.12 so the edges never show.

## Advice guide template (Phase 3, built)
`beta/advice/advice.css` + `advice.js` shared by every `beta/advice/<slug>/index.html` (copy `new-to-ilca/`). Parts: hero (crumbs, h1 `data-split`, lede, meta pills), contents built from `.g-sec[id] h2` (sticky sidebar ≥900px, sticky dropdown bar below), reading progress bar, `.takeaways`, `.callout`/`.callout-tip`, `.table-wrap`, `.checklist`, `.stat-grid`, `.cols-2 .mini-card`, `.g-figure`, `.link-card`, `.verify` (yellow "To verify" tag, beta only), `.g-end` related cards + soft coaching link.

## Venue guide template (Phase 4, built)
`beta/venues/<venue>/index.html` (copy `weymouth/`) = advice template + `beta/venues/venues.css` / `venues.js`: sailors/parents hero split, `data-part` contents groups, `.v-map` pins, `.wind` compass picker with per-direction panels (area tag, `.bias` bar, technique table), `.rose` from `data-rose`, `.timeline`, `.calc` cost calculator, `.v-events` from events.js via `data-venue-match`. Details in STATUS.md.

## Cache-busting
All local script/CSS tags use `?v=`. Run `python tools/beta-bust.py` (repo root) after editing any beta JS/CSS/data, before deploying.

## Verify
Preview at :8765/beta/, check console errors, mobile (375px) and reduced-motion. At 375px also run `[innerWidth, document.documentElement.scrollWidth]`: both must be 375. Screenshot for James (SendUserFile the browser-tool screenshot paths).
- The Browser pane is often hidden, which freezes CSS/WAAPI animations and rAF: run `document.getAnimations().forEach(a=>a.finish())` before screenshots, and never make visible content depend on rAF/animation completing. Use `zoom` region 0,0,800,514 to crop the scaled 1400px view.
- Bash heredocs containing `.remove()` trip the rm safety check: write patch scripts to the scratchpad and run them.
- `a.finish()` throws on infinite animations (scroll cue): wrap it, `getAnimations().forEach(a => { try { a.finish() } catch (e) {} })`.
- The preview browser caches CSS/JS hard. After editing, run `await fetch(url, {cache: "reload"})` for each changed file, then `location.reload()`.

## Booking (beta/booking, account, book + apps-script/Code.gs)
- Backend = Apps Script web app over Kai's sheet; setup steps in `apps-script/README.md`, plan in `BOOKING-PLAN.md`. Any Code.gs change needs pasting + a new deployment version by James.
- Medical & image release = **James's own Google Form, unchanged**. Never add site tick boxes that repeat its questions (photo consent etc.). The form's name question is `Sailors full name` (entry.1504912846), no email question; matching is by full name. Trigger on the form via `medical_form_id`; `syncMedical()` backfills; parent gets a receipt email.
- localhost always uses the mock (`booking/mock.js`, code 123456) unless `?live=1` (remembered in localStorage on that browser, so new tabs keep it; `?live=0` turns it off). In mock mode the code screen says no email is sent.

