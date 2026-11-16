# Text cards over a pinned picture

| | |
|---|---|
| **Group** | 3. Scrollytelling |
| **What it does for the story** | One picture (photo, drawing, map, diagram) stays full screen while short text cards scroll up over it. Each card says one thing about the picture, so the reader looks and reads at the same time. |
| **Seen on** | BBC Sport "Olympic battle royale" (cut-out athlete on a gradient, `shots/bbc-olympic-375-015.jpg`) and BBC News "The boat that disappeared" (graphic-novel panels); Nature "How the world's biggest laser…" (3D target chamber, `shots/nature-fusion-375-007.jpg`) and Nature brain; Man City "10 years of City Women" (team line-up on a pitch, one card per player, `shots/mancity-women-375-011.jpg`); NBC "Built to keep Black from white" (map, `shots/nbc-detroit-375-007.jpg`); The Conversation "Beautiful buildings" (3D building, `shots/conv-buildings-375-004.jpg`). All Shorthand ("Scrollmation" / "Reveal" sections). **Seen on 5.** |
| **Phone version** | The picture fills the phone screen (cropped, focal point kept) and the cards narrow to about 85% width. Works on every site. It is the most phone-friendly scrolly pattern we found. |
| **How to build (vanilla)** | Section with a `position: sticky; top: 0; height: 100svh` figure, then the cards as normal blocks with `margin-bottom: 60–80svh`. Swap or tweak the picture per card with IntersectionObserver (`data-step` → class on the figure). No library. |
| **Cost / risks** | Low. Keep cards short (60 words or fewer) and give them a solid or blurred background so text never sits on a busy picture. |
| **Reduced motion** | Same layout; picture swaps become instant (no cross-fade). |
| **Use when** | Rigging (one card per control line over one photo), a venue chart with a card per hazard, a race leg. Sailing: one ILCA photo, cards for vang, cunningham, outhaul. |
| **Don't use when** | The text is long or argumentative; the picture doesn't change meaning between cards. |
