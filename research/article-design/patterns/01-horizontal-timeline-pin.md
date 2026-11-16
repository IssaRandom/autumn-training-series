# Horizontal timeline, pinned

| | |
|---|---|
| **Group** | 3. Scrollytelling |
| **What it does for the story** | Walks the reader through time, one stop per screen, in the same layout each time so changes are easy to compare. |
| **Seen on** | ESPN F1 (champion cars 1950–2024, `shots/espn-1280-016.jpg`); LeBron (1984/2003/… years, `shots/lebron-1280-009.jpg`). **Seen on 2.** |
| **Phone version** | Both keep it horizontal with one stop filling the width. Keep stops to 8 or fewer on phones or it feels endless (ESPN's runs ≈28 desktop screens). |
| **How to build (vanilla)** | Section height = n stops × 100svh; inner track `position: sticky; top: 0; height: 100svh`; translate the track with a CSS scroll-driven animation (`animation-timeline: view()`) where supported, else a small scroll listener mapping progress → `translateX`. Each stop is a real `<article>` in the DOM so find-in-page and screen readers read it in order. |
| **Cost / risks** | Medium. Pins are fiddly on iOS (address bar resize: use `svh`). The beta already dropped a GSAP pin for being clunky, so build CSS-first. |
| **Reduced motion** | Unpin: stops become a normal vertical list (or a horizontal `scroll-snap` row the reader swipes). |
| **Use when** | Seasons, pathways (ILCA 4 → 6 → 7), a race leg by leg, a campaign year. |
| **Don't use when** | Fewer than 4 stops; content that isn't sequential. |
