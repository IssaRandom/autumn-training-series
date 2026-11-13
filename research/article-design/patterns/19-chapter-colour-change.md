# Chapter colour change

| | |
|---|---|
| **Group** | 2. Pacing |
| **What it does for the story** | Each chapter gets its own background colour, so the reader feels the move to a new part and can tell where they are at a glance. |
| **Seen on** | BBC Olympic (white for athletics, purple for cycling, a gradient behind each sport, `shots/bbc-olympic-1280-024.jpg`); Man City (sky-blue line-up chapter, then navy "Footballing firsts", `shots/mancity-women-375-017.jpg`); Nature brain (navy chapters alternate with white text chapters, `shots/nature-brain-1280-039.jpg`). **Seen on 3.** |
| **Phone version** | Same. Colour is the cheapest beat on a phone. |
| **How to build (vanilla)** | Each section sets `--bg`. Either hard edges, or a sticky full-screen background whose colour changes via IntersectionObserver with `transition: background-color .6s`. |
| **Cost / risks** | Very low. Check contrast in every colour. On the BTS dark theme vary depth (navy, deep teal, near-black) rather than switching to light. |
| **Reduced motion** | Hard edges, no colour transition. |
| **Use when** | Seasons (winter, spring, summer); rigs (ILCA 4, 6, 7, each in its calendar colour). |
| **Don't use when** | The colours carry no meaning; more than about 5 chapters. |
