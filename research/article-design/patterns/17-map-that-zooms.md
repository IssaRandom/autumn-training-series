# Map that zooms and adds layers

| | |
|---|---|
| **Group** | 5. Explaining things (maps) |
| **What it does for the story** | A map the story keeps coming back to. It zooms from city to street, then adds a layer (zones, a wall, a boat's position) as the text explains it. |
| **Seen on** | NBC "Built to keep Black from white" (Detroit, then redlined zones in pink, then the neighbourhood, then the wall drawn in red, with an archive form laid over the map; https://www.nbcnews.com/specials/detroit-segregation-wall/, `shots/nbc-detroit-1280-010.jpg`); BBC "The boat that disappeared" (Mediterranean chart with the boat's last position and a phone icon, revisited between chapters, `shots/bbc-boat-1280-048.jpg`). Both Shorthand. **Seen on 2.** |
| **Phone version** | Both pin the map full screen with cards over it (card 14). NBC re-frames each zoom so the area of interest stays centred at 375. |
| **How to build (vanilla)** | Pre-rendered map images or one SVG; each step changes the `viewBox` (or a CSS `transform` on the image) and toggles overlay layers. No map library needed for a fixed area. |
| **Cost / risks** | Medium. Map tiles are heavy; use one optimised image per zoom level. |
| **Reduced motion** | Jump cut between zoom levels, overlays shown without fades. |
| **Use when** | Venue guides (Weymouth: harbour, then Portland, then the race areas), a course leg by leg, tide flow. |
| **Don't use when** | One static map says it all. |
