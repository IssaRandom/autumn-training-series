# Technical SEO findings - beyondtheshift.co.uk (audited 2026-11-16)

Score: 78/100

## Verified
- http -> https: 301 (good). Host is Cloudflare (Pages-style static hosting).
- www.beyondtheshift.co.uk: NXDOMAIN (no DNS record). Not a redirect, simply unresolvable. Medium: users/links typing www fail.
- Googlebot, GPTBot, ClaudeBot UAs all get 200 on /. No Cloudflare bot blocking seen.
- /privacy 200; /privacy/ 307 -> /privacy; /index.html 307 -> / (temporary code, should be 301/308; Cloudflare Pages clean-URL behaviour). Canonical on home correct.
- /nonexistent -> 404 status correct, but body is EMPTY (0 bytes). /404.html itself returns 307 (a custom 404.html exists in repo but is not being served; a custom page would help).
- /thank-you returns 200 (disallowed in robots, but no noindex meta confirmed; robots Disallow does not deindex).
- robots.txt: Allow all, Disallow /thank-you, Sitemap declared. Valid.
- sitemap.xml: valid, 2 URLs (/, /privacy), lastmod 2026-10-12 (stale, over a month old). Priority/changefreq ignored by Google.
- /llms.txt 404.
- /beta/ and /beta/advice/ return 200 with meta robots noindex,nofollow (no X-Robots-Tag header). Homepage has zero links to /beta, so not discoverable by crawl. Not in sitemap. Intentional. Risk: noindex only via meta; fine, but must be removed/swapped at go-live.
- Favicon: favicon.ico 200, also svg, apple-touch-icon, manifest linked. Good.
- Security headers present: X-Content-Type-Options nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy. MISSING: Strict-Transport-Security (HSTS), Content-Security-Policy.
- Caching: cache-control public, max-age=0, must-revalidate on all assets incl. favicon (fine for HTML; poor for images/css/js repeat visits). Cloudflare cf-cache-status HIT.
- Mobile: viewport meta present, theme-color set. Responsive images (srcset, sizes, width/height set -> low CLS).
- CWV source review: hero preloaded as webp with fetchpriority=high, but <img> fallback uses jpg srcset (check it is in a <picture>/matching source; preload type webp vs jpg img could cause double download). One stylesheet (render-blocking, small), script.js deferred, below-fold images lazy. Inline script present in head (check size). Good LCP outlook. No render-blocking third-party scripts seen.
- Rendering: static HTML, content server-delivered, no SPA. Good.
- Structured data: JSON-LD with Organization, Event, Offer, Place, PostalAddress. Present. (Event dates are Sep-Nov 2026: now past/ending, so refresh needed; validate separately.)
- Meta: title/description/OG/Twitter complete. og:site_name "KW | JF Sailing" differs from domain brand "Beyond the Shift" (brand inconsistency).
- hreflang: not needed.

## Issues
High
- Sitemap and site are only 2 indexable pages; event series (Sep-Nov 2026) is ending, Event schema and lastmod stale. Content thin for organic reach; /beta redesign (advice articles etc.) not live.
Medium
- No HSTS (add Cloudflare SSL/TLS > Edge Certificates > HSTS, or _headers Strict-Transport-Security: max-age=31536000; includeSubDomains).
- No CSP (add report-only first via _headers).
- www subdomain has no DNS: add proxied CNAME www -> apex and 301 redirect rule.
- Custom 404 not served; empty 404 body. Make 404.html serve with status 404.
- 307 redirects for /privacy/ and /index.html: prefer permanent. Make internal links consistently use /privacy (no slash); check beta pages use one convention before go-live since /beta/ dirs use trailing slash and root paths redirect slash->no-slash (Cloudflare Pages), which would conflict with canonical/sitemap on go-live.
- Brand mismatch (og:site_name "KW | JF Sailing" vs Beyond the Shift).
Low
- llms.txt missing (optional).
- Long-cache headers for static assets (versioned ?v= already used) via _headers: /assets/* public, max-age=31536000, immutable.
- /thank-you: add meta noindex rather than relying on robots Disallow.
- Sitemap lastmod stale; drop priority/changefreq.
- Go-live checklist: remove noindex from beta pages, update canonicals, expand sitemap, 301 any old paths.
