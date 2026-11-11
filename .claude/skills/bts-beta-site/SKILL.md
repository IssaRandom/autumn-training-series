---
name: bts-beta-site
description: Build the Beyond the Shift /beta website (animated, scroll-driven redesign of beyondtheshift.co.uk). Use for any work on /beta pages, its design system, motion, homepage, coaching/about pages, or promoting beta to live.
---

# Beyond the Shift — /beta build

Start every session by reading `STATUS.md` (repo root). Update it before ending.

## Repo facts
- Static site, no build step. Publish root = `autumn-training-series/` (inner folder). Hosted on Cloudflare (serves `/page` without `.html`); netlify.toml/_headers also present.
- Live site files — DO NOT edit for beta work: `index.html`, `styles.css`, `script.js`, legal pages. Live camp data = `camps` array at top of `script.js` (beta may READ it for "next 3 trainings").
- Preview: `.claude/launch.json` config `site` → :8765. If another session already holds 8765, use config `site-alt` → :8767 (the port is hard-coded in the python args, so autoPort can't move it).
- Branch: `beta` off `master` (winter-dates-update is separate live work).

## Beta rules
- All beta code in `autumn-training-series/beta/`: `index.html`, `beta.css`, `beta.js`, sub-pages as folders (`beta/calendar/`, `beta/advice/…`, `beta/venues/…`). Shared images from `../assets/` ok; beta-only media in `beta/media/`.
- `<meta name="robots" content="noindex">` on every beta page; never add beta to sitemap.xml.
- Placeholders: images `https://picsum.photos/seed/<word>/1600/900` (or local grey SVG), text clearly marked `[PLACEHOLDER]` in HTML comments + realistic draft copy. Keep a list of placeholders in STATUS.md.
- Brand = the live site palette (styles.css): navy #0b2a59 / #061a3a, electric blue #2463eb accent (`--accent`, buttons `.btn-accent`), blue-300 #8fb5ff on dark, ice #eef4fb / mist #f6f8fc neutrals; Montserrat. Red #D22630 only for deadlines/warnings (James said the red-led beta didn't match the aesthetic, 11 Nov 2026). No anchors/rope/cartoon nautical. British English, no serial comma.

## Motion stack (CDN, pinned versions)
- GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.1.x (unpkg) smooth scroll.
- Hero = scroll-scrubbed slow-mo video: `<video muted playsinline preload="auto">`, set `currentTime` from ScrollTrigger progress. Encode with all-keyframes for smooth scrub: `ffmpeg -i in.mp4 -an -vf scale=1920:-2 -c:v libx264 -g 1 -crf 22 -movflags +faststart hero.mp4` (+ a 720p mobile version). Fallback: poster image.
- Patterns: pinned sections, split-text reveals, parallax images, count-up stats, horizontal scroll strips.
- `prefers-reduced-motion` → no scrub/parallax, static poster. Mobile: lighter video, no pinning on small screens if janky.

## Page map
Home (hub) · Coaching (current training/booking, tidied) · Calendar (see bts-calendar) · Advice Hub (see bts-advice-content) · Venue Guides · About.
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

## Verify
Preview at :8765/beta/, check console errors, mobile (375px) and reduced-motion. At 375px also run `[innerWidth, document.documentElement.scrollWidth]`: both must be 375. Screenshot for James (SendUserFile the browser-tool screenshot paths).
- The Browser pane is often hidden, which freezes CSS/WAAPI animations and rAF: run `document.getAnimations().forEach(a=>a.finish())` before screenshots, and never make visible content depend on rAF/animation completing. Use `zoom` region 0,0,800,514 to crop the scaled 1400px view.
- Bash heredocs containing `.remove()` trip the rm safety check: write patch scripts to the scratchpad and run them.
