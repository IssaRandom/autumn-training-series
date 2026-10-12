# KW | JF Sailing — Autumn Training Series

A complete static website for the 2026 Autumn Training Series for ILCA 4 and ILCA 6 sailors.

The site uses only HTML, CSS and vanilla JavaScript. It has no database, build process, content management system or paid dependency. Open `index.html` directly to test it or upload this complete folder to Netlify.

## Folder structure

```text
autumn-training-series/
├── index.html
├── styles.css
├── script.js
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── netlify.toml
├── privacy.html
├── terms.html
├── cancellation.html
├── photography.html
├── README.md
└── assets/
    ├── images/
    │   ├── hero-sailing.jpg
    │   ├── programme-training.jpg
    │   ├── kai-wolgram.jpg
    │   ├── james-foster.jpg
    │   ├── calendar-training.jpg
    │   └── footer-sailing.jpg
    └── icons/
        └── README.txt
```

## Content hierarchy

1. Sticky navigation and action-focused hero
2. Programme introduction and four core benefits
3. Equal coach profiles for Kai Wolgram and James Foster
4. Interactive seven-event training schedule
5. Training environment and what sailors can expect
6. Seven-stage programme progression
7. Booking information and under-18 information reminder
8. Accessible FAQ accordion
9. Final booking and WhatsApp calls to action
10. Contact, policy and legal footer

## Live site details

- Live URL: `https://beyondtheshift.co.uk` (hosted on Cloudflare, which serves pages without `.html`, e.g. `/privacy`)
- Google Form: `https://forms.gle/X7offBwNaL24wZ4t7`
- Medical and image release form: linked from the booking section and `thank-you.html`
- WhatsApp group: `https://chat.whatsapp.com/Ela5XJPNzAq9mNSzR45p3q`
- Venues: WPNSA, Osprey Quay, Portland, Dorset DT5 1SA · Poole Yacht Club, New Harbour Road West, Hamworthy, Poole BH15 4AQ
- No public email or phone number by choice; contact is via the WhatsApp group and booking form.

## Launch checklist status

| Item | Where |
|---|---|
| Custom 404 page | `404.html` (Cloudflare serves it automatically for missing URLs) |
| CTA above the fold | Hero "Book a camp" and "View dates & prices" buttons |
| Meta title and description per page | Every HTML file's `<head>` |
| Open Graph image | `assets/images/og-image.jpg` (1200×630) |
| Favicon set | `favicon.ico`, `favicon.svg`, `assets/icons/*`, `site.webmanifest` |
| robots.txt and sitemap.xml | Root of the site; only indexable pages are listed |
| Alt text | Every `<img>` has descriptive alt text |
| Sticky mobile CTA | `.mobile-cta` bar under 860px; hides while another booking button is on screen |
| Performance | Responsive WebP/JPG images; first load is roughly 180 KB |
| Thank-you page | `thank-you.html` — put `https://beyondtheshift.co.uk/thank-you` in the Google Form's confirmation message |
| Privacy notice | `privacy.html` |
| Cookie banner and analytics | Not used: the site sets no cookies and loads no tracking, so neither is legally required. If analytics are added later, review the privacy notice and consent first. |
| Security and cache headers | `_headers` (Cloudflare); `netlify.toml` kept for reference |

## Placeholders to replace

Search the complete folder for square brackets (`[`) to find these quickly.

| Placeholder | Where it appears | What to add |
|---|---|---|
| `[TERMS_AND_CONDITIONS]` | `terms.html` | Approved terms |
| `[CANCELLATION_POLICY]` | `cancellation.html` | Approved cancellation and refund policy |
| `[PHOTOGRAPHY_CONSENT]` | `photography.html` | Approved consent wording |
| `[LEGAL TEXT REQUIRED BEFORE PUBLISHING]` | Policy pages | Replace with approved legal text, then add the page back to the footer and `sitemap.xml` and remove `noindex` |

## Replacing images

The supplied photographs are already installed. If you change them later:

1. Prepare a JPG with the same filename as the image being replaced.
2. Keep hero and training images landscape where possible.
3. Aim for 1600–2200 pixels wide for hero images and 900–1400 pixels wide for portraits.
4. Export at approximately 80–85% JPG quality.
5. Replace the matching file inside `assets/images`.
6. Open the site and check the crop on desktop and mobile.

Crop positions can be adjusted in `styles.css` by changing `object-position`. Image-placement comments are included in `index.html`.

## Editing dates, prices or camp details

Each event appears in two places:

1. The visible event button in the `AUTUMN TRAINING DATES` section of `index.html`
2. The matching event object near the top of `script.js`

Dates and prices also appear in the JSON-LD event data in the `<head>` of `index.html`. Update all three locations so visible information and search metadata remain consistent.

## Test locally

No special software is required:

1. Download and unzip the website.
2. Open the `autumn-training-series` folder.
3. Double-click `index.html`.
4. The site will open in your normal web browser.
5. Test the menu, every camp, every booking button, the FAQs and each footer link.
6. Resize the browser window to check the mobile layout.

Some browsers limit particular features when files are opened directly. The core website and all main interactions will still work.

## Publish with Netlify — recommended

1. Download and unzip the completed website.
2. Replace any photographs inside `assets/images` if needed.
3. Replace the email, Instagram, domain, venue and policy placeholders listed above.
4. Test `index.html` locally.
5. Go to [Netlify](https://www.netlify.com/) and create a free account.
6. Open Netlify Drop or choose **Add new site** then **Deploy manually**.
7. Drag the complete `autumn-training-series` folder or its ZIP file into the upload area.
8. Wait for Netlify to show the temporary website address.
9. Open the live site and test the menu, date selector, booking buttons and policy links on both a phone and computer.
10. To use your own domain, open **Domain management** and add `[DOMAIN_NAME]`.
11. Netlify normally enables HTTPS automatically. Check that the live address begins with `https://`.
12. For future updates, edit the local files and upload the updated folder or ZIP through the site’s **Deploys** area.

If a ZIP upload is not accepted in the interface shown, unzip it and drag in the complete folder instead.

## Alternative: GitHub Pages without command-line tools

1. Create a free account at [GitHub](https://github.com/).
2. Select **New repository**.
3. Give it a simple name such as `autumn-training-series` and make it public.
4. Choose **uploading an existing file**.
5. Drag all files and folders from inside the website folder into the upload area.
6. Select **Commit changes**.
7. Open the repository’s **Settings**, then **Pages**.
8. Under **Build and deployment**, choose **Deploy from a branch**.
9. Select the `main` branch and `/ (root)`, then save.
10. Wait a few minutes and use the website address shown by GitHub.
11. If using a custom domain, add it in the Pages settings and update `[CANONICAL_URL]`.

Netlify remains the simpler option for manual drag-and-drop updates.

## Pre-publication checklist

### Dates and programme

- [ ] Confirm whether the series starts on 19–20 September or 26–27 September.
- [ ] Confirm all seven dates, venues and prices.
- [ ] Confirm the names “Autumn Training Series” and “October Race Camp”.
- [ ] Confirm the three-week booking deadline and £20 late fee wording.
- [ ] Confirm whether sailors may attend individual camps.
- [ ] Confirm what the camp price includes.
- [ ] Confirm the unsuitable-weather plan.
- [ ] Confirm equipment requirements.
- [ ] Confirm whether accommodation and meals are excluded.
- [ ] Confirm where joining instructions will be sent.

### People and imagery

- [ ] Confirm every coach biography and achievement.
- [ ] Confirm that each portrait is assigned to the correct coach.
- [ ] Confirm permission and photo-credit requirements for every image.
- [ ] Confirm that photography of under-18s may be used on the website.

### Links and contact details

- [ ] Test the Google Form in a private browser window.
- [ ] Test the WhatsApp invitation.
- [ ] Replace `[CONTACT_EMAIL]`.
- [ ] Replace `[INSTAGRAM_URL]`.
- [ ] Replace `[CANONICAL_URL]` everywhere.
- [ ] Add both confirmed venue addresses.

### Safeguarding, privacy and legal

- [ ] Add approved privacy wording.
- [ ] Add approved terms and conditions.
- [ ] Add an approved cancellation and refund policy.
- [ ] Add photography and video consent wording.
- [ ] Confirm how parent or guardian details are collected.
- [ ] Confirm emergency contact and medical information handling.
- [ ] Confirm safeguarding information and the relevant contact.
- [ ] Remove `noindex` from each legal page only after its wording is complete.

### Quality assurance

- [ ] Search the complete folder for `[` and resolve every remaining placeholder.
- [ ] Check the site at approximately 375px, 768px, 1024px and 1440px widths.
- [ ] Test with keyboard only: menu, date cards, links and FAQs.
- [ ] Check text contrast and visible focus outlines.
- [ ] Check for horizontal scrolling on mobile.
- [ ] Check all image crops and alt text.
- [ ] Test every internal and external link.
- [ ] Confirm the copyright and website credit.
- [ ] Consider analytics and cookie consent only after privacy requirements are agreed.

## Analytics

No tracking is loaded. An optional marker is included in `index.html`. Do not add Google Analytics, Plausible or another service until the privacy and consent implications have been considered.
