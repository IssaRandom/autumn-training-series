# Try-it slider (explorable)

| | |
|---|---|
| **Group** | 9. Interaction |
| **What it does for the story** | After the text explains an idea, the reader gets a few sliders or toggles to try it and see the diagram change. |
| **Seen on** | The Pudding onions (layers, cut depth and cut type controls under the onion diagram, with a live "standard deviation" score; `shots/pudding-onions-375-010.jpg`). **Seen on 1.** |
| **Phone version** | Controls stack under the diagram, full width, big touch targets. |
| **How to build (vanilla)** | `<input type="range">` and radio buttons wired to the same SVG used by card 16; `<output>` for the live number. |
| **Cost / risks** | Medium: the model behind it must be right. |
| **Reduced motion** | Instant redraws. |
| **Use when** | Rig tension vs wind, how much hiking changes boat speed (only if we have a real model). |
| **Don't use when** | There is nothing real to compute. |
