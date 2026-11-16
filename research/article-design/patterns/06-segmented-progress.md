# Segmented progress

| | |
|---|---|
| **Group** | 7. Getting around |
| **What it does for the story** | A row of short bars, one per section or card, with the current one filled. Tells you how much is left without a scrollbar. |
| **Seen on** | ESPN F1: chapter progress across the top of the 2026 section, and 4-segment bars inside each spec panel (`shots/espn-1280-078.jpg`, `-047.jpg`). **Seen on 1.** |
| **Phone version** | Same, thinner. |
| **How to build (vanilla)** | Flex row of `<span>`s; IntersectionObserver on each section sets `aria-current` on the matching segment. Can double as a jump menu (links). |
| **Cost / risks** | Low. |
| **Reduced motion** | No change (it isn't motion). |
| **Use when** | Hub guides with chapters, any multi-step how-to. |
| **Don't use when** | Short articles (under ~4 screens). |
