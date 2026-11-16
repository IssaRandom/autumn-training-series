# Small multiples grid

| | |
|---|---|
| **Group** | 6. Data / 4. Pictures (grids) |
| **What it does for the story** | The same small card repeated for every item (season, event, sailor) in a grid, so the eye compares them without reading. |
| **Seen on** | The Pudding "Ethical NBA championships" (one card per title-winning season, a pile of cartoon heads for the games the opponents missed; https://pudding.cool/2026/06/ethical-champions, `shots/pudding-champs-1280-016.jpg`). **Seen on 1.** |
| **Phone version** | Pudding keeps two cards per row at 375 with a short label each. Works. |
| **How to build (vanilla)** | CSS grid `repeat(auto-fill, minmax(150px, 1fr))`; each card a tiny SVG or icon set from data. Fade the grid in once. |
| **Cost / risks** | Low. Needs real, comparable data. |
| **Reduced motion** | Static grid. |
| **Use when** | Results by event across a season, wind per day at a regatta, a squad. |
| **Don't use when** | Fewer than 6 items. |
