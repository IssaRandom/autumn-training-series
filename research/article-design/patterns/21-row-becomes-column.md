# Row becomes a column on phones

| | |
|---|---|
| **Group** | 4. Pictures and video / 6. Data |
| **What it does for the story** | A wide comparison (a row of three things, a horizontal chart) is turned 90° for phones, so each item keeps its size instead of shrinking to a thumbnail. |
| **Seen on** | The Pudding NBA champions (the logo beeswarm runs left to right on desktop and top to bottom on phones, `shots/pudding-champs-375-018.jpg`); Nature brain (mouse, macaque, human neurons in a row on desktop, a labelled column on phones, `shots/nature-brain-375-048.jpg`). **Seen on 2.** |
| **Phone version** | This card *is* the phone version: a re-composition, not a squash. |
| **How to build (vanilla)** | Two SVG/images (`<picture>` with `media`) or one SVG whose layout flips with a container query; for HTML rows, `grid-auto-flow: row` under 600px. |
| **Cost / risks** | Low to medium (a second drawing for charts). |
| **Reduced motion** | Not motion-related. |
| **Use when** | ILCA 4 vs 6 vs 7 rigs, a season timeline, wind-range bars. |
| **Don't use when** | The comparison only works side by side (use a before/after slider, card 04). |
