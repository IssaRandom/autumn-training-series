# Camera over a world

| | |
|---|---|
| **Group** | 3. Scrollytelling |
| **What it does for the story** | The whole article lives on one big drawn map/track; scrolling moves a camera across it. Turns reading into a journey. |
| **Seen on** | ESPN F1 (the world is a 31,491 × 10,936px div moved by JS; `shots/overview-espn-1280-*.jpg`). **Seen on 1.** |
| **Phone version** | ESPN keeps the world and re-composes the pieces for a narrow screen. Weak point: half-cards show mid-pan. |
| **How to build (vanilla)** | Avoid the fake-page-height version. Cheaper take: a normal vertical article with a sticky, full-screen SVG background (course map) whose `viewBox` or transform follows the chapter in view (IntersectionObserver). |
| **Cost / risks** | High. The ESPN version breaks find-in-page, anchors and screen readers. Only for flagship pieces. |
| **Reduced motion** | Static map per chapter, text flows normally. |
| **Use when** | A venue guide over a chart of the bay; a race story over the course. |
| **Don't use when** | Hub guides and how-tos (people skim and jump). |
