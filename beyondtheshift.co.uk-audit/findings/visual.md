# Visual findings: https://beyondtheshift.co.uk (captured 2026-11-16)

Screenshots: screenshots/desktop.png (1920x1080), screenshots/mobile.png (375x812), plus *-full.png full-page.
Note: the bundled capture_screenshot.py crashed Chromium ("Target crashed") on all 4 viewports; captured with a direct Playwright script (--disable-gpu, --no-sandbox) instead, so the page was rendered without the browser sandbox. render_page.py itself worked (HTTP 200).

## Above the fold
- Visible brand: "KW | JF SAILING" (top-left logo, also og:site_name and JSON-LD Organization name). "Beyond the Shift" appears nowhere on screen. Title tag: "Winter Dates Now Live | ILCA 4 & 6 Training 2026/27" (no brand either).
- H1: "AUTUMN & WINTER TRAINING SERIES" (102px desktop, 51px mobile), visible on both. Sub-line "ILCA 4 & 6", then "Connected camps at WPNSA and Poole Yacht Club, coached by British Sailing Squad sailors James Foster and Kai Wolgram."
- What it offers: clear (ILCA 4 & 6, camps, WPNSA/Poole). Gaps: ILCA 7 not mentioned; "Dorset" never stated (Poole/WPNSA implies it); "coaching" implied by "coached by" only.
- Who: weak. Brand initials "KW | JF" are unexplained; coach names appear only in the sub-copy.
- Next step: strong. Primary CTA "BOOK A CAMP" (blue) + secondary "DATES & PRICES", both in first screen on desktop (y=622) and mobile; "BOOK NOW" in desktop nav; "NEW: Winter 2026/27 dates live" pill; "Next camps" cards (19-23 Dec, 27-30 Dec, 31 Dec-3 Jan) peek in at the fold.
- Hero photo of an ILCA with GBR sail loads fast (preloaded, no layout shift observed). Dark overlay keeps white text readable.

## Mobile (375px)
- No horizontal scroll: scrollWidth 375 = viewport.
- Body font 15px (slightly under 16px guideline); 78 text elements under 14px (e.g. camp-card meta lines "Poole Yacht Club . Starts in 5 weeks" ~11-12px, kickers). Hero paragraph is readable.
- Tap targets above the fold: CTAs ~48px tall, OK; hamburger OK; only the logo link is under 44px (87x37). Desktop nav links are 39px tall (below 44-48px, minor, mouse context).
- Hamburger nav present.
- Camp cards truncate on mobile ("WINTER TRAINING..." ellipsis, second card cut off at right edge, which reads as a deliberate carousel but has no visible scroll cue).

## Issues (priority)
1. Brand mismatch: user-facing brand is "KW | JF Sailing"; "Beyond the Shift" is absent (logo, title, H1, schema). Decide on one and apply consistently. Medium/High for brand recognition and SEO entity.
2. Add "Dorset" and ILCA 7 (if offered) to hero copy/H1 area; add short "coaching" wording.
3. Expand/explain "KW | JF" or add the coach names/wordmark in the logo.
4. Raise mobile small text (card meta) to >=12-13px and body to 16px; enlarge logo tap area to 44px.
5. Truncated card title on mobile; add scroll hint or shorten title.
