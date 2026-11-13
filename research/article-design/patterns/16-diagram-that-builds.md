# Diagram that builds step by step

| | |
|---|---|
| **Group** | 5. Explaining things |
| **What it does for the story** | One diagram is redrawn as the text moves on: a part lights up, a line is added, a state changes. The reader never loses their place because it is always the same picture. |
| **Seen on** | The Pudding "Dicing an onion" (radial cuts added, then deeper cuts; https://pudding.cool/2025/08/onions, `shots/pudding-onions-375-009.jpg`); Nature fusion (target chamber, then lasers firing, then the capsule imploding, `shots/nature-fusion-1280-024.jpg`); Nature brain (one brain region highlighted at a time, `shots/nature-brain-1280-036.jpg`); The Conversation (one building model turned to show each feature). **Seen on 3.** |
| **Phone version** | Pudding: the diagram sits in the column at full width, text under it. Nature: the diagram is pinned full screen with cards over it (card 14). Both work. |
| **How to build (vanilla)** | Inline SVG with each layer in a `<g data-step="n">`; IntersectionObserver on the text steps sets `data-step` on the SVG; CSS shows layers up to that step (`opacity` or `stroke-dashoffset` transition). Pudding used Svelte; Nature swapped images in Shorthand. |
| **Cost / risks** | Medium: the drawing work. Keep labels as real text for screen readers. |
| **Reduced motion** | Layers switch on without transitions. |
| **Use when** | Rig controls, a tide turning round a headland, the start sequence, mast-lowering steps. Sailing: an ILCA side view where kicker, cunningham and outhaul light up in turn. |
| **Don't use when** | Each step needs a different picture (use card 03, figure cards). |
