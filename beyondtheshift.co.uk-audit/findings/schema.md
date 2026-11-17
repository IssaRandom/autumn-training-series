# Schema / Structured Data audit: beyondtheshift.co.uk (home.html), 2026-11-16

Score: **38 / 100**

## Detection
- One JSON-LD block, `@context` https://schema.org, `@graph` with 1 Organization + 7 Event nodes. No Microdata/RDFa. No WebSite, Person, WebPage or BreadcrumbList.
- Page: title "Winter Dates Now Live | ILCA 4 & 6 Training 2026/27", canonical https://beyondtheshift.co.uk/, og:image 1200x630 exists (/assets/images/og-image.jpg). No social/sameAs links were found in the saved HTML.

## Validation
| Node | Result | Issues |
|---|---|---|
| Organization | Syntax pass, content fail | Name is "KW \| JF Sailing", not "Beyond the Shift": brand-entity mismatch, hurts the brand query. Missing alternateName, description, sameAs, founder/employee, areaServed, knowsAbout, contactPoint. logo is a plain URL (valid; ImageObject preferred). |
| Event x7 (Autumn #1-#5, Race Camp WPNSA, Race Camp Poole) | Valid but ineligible/weak | See below |

Event issues:
1. **All 7 events are in the past** (latest: #5 on 2026-11-08; Race Camps 19-30 Oct). The markup describes zero upcoming events, so no event rich result is possible, and `eventStatus: EventScheduled` on finished events is stale. The title says "Winter Dates Now Live" but the schema contains none of the winter dates. Highest-impact fix: generate Event nodes from the same data as the visible dates section and drop past ones (or keep them only on an archive page).
2. Missing Google-recommended fields: `description`, `image`, `performer` (the coaches), `offers.availability`, `offers.validFrom`. `startDate`/`endDate` are date-only; add times and timezone offset (e.g. 2026-09-19T09:00:00+01:00).
3. `offers.url` goes to a Google Form: acceptable, but Google prefers a URL on the event's own page; add an Event `url`.
4. Locations have full PostalAddress (good); optionally add `url`.
5. Event names "October Race Camp � WPNSA" contain a garbled character in the saved file: confirm the page is served as UTF-8 (`<meta charset>` and header), or use a plain hyphen.
6. Organizer references `#organisation`, which resolves (good). Names are generic ("#1"); include ILCA 4/6 and the venue.
7. Visible copy targets ILCA 4/6; the target terms include "ILCA training/coaching/UK training", so reflect this in descriptions and `knowsAbout`.

## Type choice (justification)
Use **Organization**, not LocalBusiness/SportsActivityLocation: there is no public premises, sessions run at third-party venues (WPNSA, Poole YC), and LocalBusiness expects a real address/opening hours that would mislead. Use `areaServed` (Dorset / UK) and `knowsAbout` instead. Add **Person** nodes for James Foster and Kai Wolgram (`founder`, `knowsAbout` ILCA, and `sameAs` to World Sailing / RYA / Instagram profiles once confirmed). Add a **WebSite** node with name "Beyond the Shift" and alternateName entries. Skip SearchAction (sitelinks searchbox retired).

Do not use FAQPage (no SERP feature since May 2026) or HowTo (removed). For a genuine user Q&A page, use QAPage.

## Ready-to-paste JSON-LD (replaces the existing block)
No `sameAs` is included because no profile URLs were found; add them to the Organization and each Person once confirmed. Confirm contact details too.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://beyondtheshift.co.uk/#website",
      "url": "https://beyondtheshift.co.uk/",
      "name": "Beyond the Shift",
      "alternateName": ["BTS Sailing", "Beyond the Shift ILCA Coaching", "KW | JF Sailing"],
      "inLanguage": "en-GB",
      "publisher": {"@id": "https://beyondtheshift.co.uk/#organisation"}
    },
    {
      "@type": "Organization",
      "@id": "https://beyondtheshift.co.uk/#organisation",
      "name": "Beyond the Shift",
      "alternateName": ["BTS", "KW | JF Sailing"],
      "legalName": "KW | JF Sailing",
      "url": "https://beyondtheshift.co.uk/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://beyondtheshift.co.uk/assets/icons/icon-512.png",
        "width": 512,
        "height": 512
      },
      "image": "https://beyondtheshift.co.uk/assets/images/og-image.jpg",
      "description": "ILCA 4, ILCA 6 and ILCA 7 coaching and training camps in Dorset, UK, run by British Sailing Squad ILCA 7 sailors James Foster and Kai Wolgram.",
      "areaServed": [
        {"@type": "AdministrativeArea", "name": "Dorset"},
        {"@type": "Country", "name": "United Kingdom"}
      ],
      "knowsAbout": ["ILCA sailing", "ILCA 4", "ILCA 6", "ILCA 7", "Dinghy racing coaching", "Youth sailing training", "ILCA UK training"],
      "founder": [
        {"@id": "https://beyondtheshift.co.uk/#james-foster"},
        {"@id": "https://beyondtheshift.co.uk/#kai-wolgram"}
      ]
    },
    {
      "@type": "Person",
      "@id": "https://beyondtheshift.co.uk/#james-foster",
      "name": "James Foster",
      "jobTitle": "ILCA Coach",
      "description": "ILCA coach and British Sailing Squad ILCA 7 sailor.",
      "worksFor": {"@id": "https://beyondtheshift.co.uk/#organisation"},
      "knowsAbout": ["ILCA 7", "ILCA 6", "ILCA 4", "Sailing coaching"],
      "url": "https://beyondtheshift.co.uk/"
    },
    {
      "@type": "Person",
      "@id": "https://beyondtheshift.co.uk/#kai-wolgram",
      "name": "Kai Wolgram",
      "jobTitle": "ILCA Coach",
      "description": "ILCA coach and British Sailing Squad ILCA 7 sailor.",
      "worksFor": {"@id": "https://beyondtheshift.co.uk/#organisation"},
      "knowsAbout": ["ILCA 7", "ILCA 6", "ILCA 4", "Sailing coaching"],
      "url": "https://beyondtheshift.co.uk/"
    },
    {
      "@type": "WebPage",
      "@id": "https://beyondtheshift.co.uk/#webpage",
      "url": "https://beyondtheshift.co.uk/",
      "name": "ILCA 4 & 6 Training Camps 2026/27 | Beyond the Shift",
      "isPartOf": {"@id": "https://beyondtheshift.co.uk/#website"},
      "about": {"@id": "https://beyondtheshift.co.uk/#organisation"},
      "inLanguage": "en-GB"
    }
  ]
}
```

### Event template
Add one per UPCOMING date only. Dates, times, numbering and price below are illustrative; use the real values from the dates section.

```json
{
  "@type": "Event",
  "@id": "https://beyondtheshift.co.uk/#event-autumn-6",
  "name": "ILCA 4 & 6 Autumn Training Series #6 - Poole Yacht Club",
  "description": "Two-day ILCA 4 and ILCA 6 coached training weekend at Poole Yacht Club with British Sailing Squad sailors James Foster and Kai Wolgram.",
  "url": "https://beyondtheshift.co.uk/",
  "startDate": "2026-11-21T09:00:00+00:00",
  "endDate": "2026-11-22T16:30:00+00:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "image": ["https://beyondtheshift.co.uk/assets/images/og-image.jpg"],
  "location": {
    "@type": "Place",
    "name": "Poole Yacht Club",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "The Yacht Haven, New Harbour Road West, Hamworthy",
      "addressLocality": "Poole",
      "addressRegion": "Dorset",
      "postalCode": "BH15 4AQ",
      "addressCountry": "GB"
    }
  },
  "organizer": {"@id": "https://beyondtheshift.co.uk/#organisation"},
  "performer": [
    {"@id": "https://beyondtheshift.co.uk/#james-foster"},
    {"@id": "https://beyondtheshift.co.uk/#kai-wolgram"}
  ],
  "offers": {
    "@type": "Offer",
    "price": "180",
    "priceCurrency": "GBP",
    "availability": "https://schema.org/InStock",
    "validFrom": "2026-11-16T00:00:00+00:00",
    "url": "https://forms.gle/X7offBwNaL24wZ4t7"
  }
}
```

## Other recommendations
1. Add `sameAs` (Instagram, Facebook, YouTube, World Sailing/RYA profiles) to Organization and both Persons; none were found on the page.
2. Add BreadcrumbList on inner pages and Article/BlogPosting with `author` pointing to the Person nodes on advice articles; this builds coach entities and "ILCA coaching" topical authority.
3. Align title/H1 with the target terms: put "Beyond the Shift" and "ILCA training" in the title/H1 (currently "Winter Dates Now Live"). Schema alone will not rank them.
4. Keep the brand name "Beyond the Shift" identical across site, socials and profiles; keep "KW | JF Sailing" only as legalName/alternateName.
5. Render Event nodes from the same data source as the visible calendar and filter out `endDate < today` at build time; re-test in the Rich Results Test.
