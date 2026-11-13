# Small chart dropped into the text

| | |
|---|---|
| **Group** | 6. Data |
| **What it does for the story** | A chart the size of a paragraph, inside the text column, gives a long read a break without leaving the column. |
| **Seen on** | ESPN F1 "Constructors' champions: lightest vs heaviest" bars inside the Evolution column (`shots/espn-1280-008.jpg`); BBC Sport "The slow death of the screamer" line and bar charts in the column (`shots/bbc-screamer-375-021.jpg`), BBC "Olympic battle royale" medal bars; Nature brain stacked bars (`shots/nature-brain-375-044.jpg`); The Pudding NBA champions bars (`shots/pudding-champs-1280-010.jpg`). **Seen on 4.** |
| **Phone version** | Same width as the text on all four sites. BBC keeps axis labels big enough to read at 375; Pudding swaps long bars for a taller, narrower version. |
| **How to build (vanilla)** | Inline SVG or CSS bars (`width: calc(var(--v) * 1%)`), grow once on enter. |
| **Cost / risks** | Low. |
| **Reduced motion** | Bars at full width. |
| **Use when** | Wind ranges per rig, weight bands for ILCA 4/6/7, results. |
| **Don't use when** | Decorative charts with no point. |
