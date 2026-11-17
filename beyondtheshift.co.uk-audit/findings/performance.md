# Performance / Core Web Vitals - https://beyondtheshift.co.uk (audit 2026-11-16)

## Method and limits
- PSI API keyless: rate limited (mobile and desktop both failed). No CrUX data (no key).
- `npx lighthouse` was blocked by the permission classifier, so NO Lighthouse lab run exists. LCP/INP/CLS are NOT measured; the status below is an estimate from static/network inspection (curl, render_page.py raw mode - page is not an SPA).
- Score is an estimate, not a Lighthouse score. Re-run PSI with an API key to confirm.

## Measured facts (homepage, from a CDG Cloudflare edge)
- TTFB ~0.38-0.50s, HTTP/2 (h3 advertised), Cloudflare cache HIT, Brotli on CSS/JS. Good (<0.8s).
- HTML 26.6KB raw; 1 CSS (14.3KB br), 1 JS (7.4KB br, `defer`); no @import/@font-face, no web fonts (system stack: Inter/Arial Narrow/Georgia fallbacks) so no font LCP/CLS risk.
- Hero (LCP candidate): `<picture>` webp 800/1280/2048w (29/55/105KB), preloaded with imagesrcset, `fetchpriority="high"`, width=2048 height=1365 set. Textbook setup.
- Below-fold images (4) are `loading="lazy"`, `decoding="async"`, with width/height set. Weights 14-58KB webp.
- Images: `cache-control: public, max-age=31536000, immutable`.
- HTML/CSS/JS: `max-age=0, must-revalidate` (CSS/JS use ?v= cache-busting query, so long-lived caching is possible but not used).
- Total homepage weight roughly 0.3MB on mobile.

## Estimated CWV (lab-style, unconfirmed)
| Metric | Estimate | Status |
|---|---|---|
| LCP | ~1.5-2.2s mobile on 4G (hero 29-55KB, preloaded, one render-blocking 14KB CSS) | Likely PASS |
| INP | Low risk: 7KB deferred JS, small DOM (~300 tags) | Likely PASS |
| CLS | Low risk: dimensions on all images, no fonts, no ads/embeds | Likely PASS |

Estimated performance score: ~90 (mobile ~88-95, desktop ~95-100).

## Issues by severity
1. MEDIUM (unverified risk) - No real measurement. Rate-limited PSI and blocked Lighthouse means nothing confirmed; no CrUX field data. Action: get a free PSI/CrUX API key and re-run mobile + desktop.
2. LOW - HTML/CSS/JS served `max-age=0, must-revalidate`; every repeat visit does revalidation round-trips. Since CSS/JS are versioned via `?v=`, set a Cloudflare/`_headers` rule for `styles.css`/`script.js` of `max-age=31536000, immutable` (or at least a few hours) and keep HTML short-lived.
3. LOW - `styles.css` is render-blocking (14KB br). Fine at this size; optionally inline critical above-the-fold CSS.
4. LOW - Hero `sizes="100vw"` on mobile picks 800w/1280w; confirm 800w is chosen on ~400px phones at DPR 2-3 (800w is ample). Consider a 480/640w variant to cut ~10-15KB on phones; ensure the preload `imagesrcset`/`sizes` matches the `<picture>` source so it is not double-fetched (preload is webp; picture source is webp - matches).
5. INFO - Hero in `<picture>` with a JPG `<img>` fallback; fine.
6. INFO - Live site appears to be the old (non-/beta) design. The git working tree is mid-move of /beta into root (go-live branch); re-audit after the redesign deploys, especially new pages with maps, calendar JS, and article scroll animations (INP/CLS risk areas).

## Browser sandbox
render_page.py ran in raw mode (no Chromium), so no sandbox concern.
