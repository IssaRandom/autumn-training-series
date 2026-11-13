# Chapter menu that follows you

| | |
|---|---|
| **Group** | 7. Getting around |
| **What it does for the story** | The chapter list stays reachable while you read, so a long guide can be skimmed and re-entered. |
| **Seen on** | BBC Sport "The slow death of the screamer" and "Olympic battle royale": a sticky tab bar with the chapter names on desktop, current chapter marked (`shots/bbc-screamer-1280-016.jpg`); Nature brain (15 in-page anchors) and Nature fusion: a header menu that opens a chapter drawer. Both Shorthand. **Seen on 2.** |
| **Phone version** | Both sites hide the tabs on phones and use a menu button that opens a chapter drawer (the nav sits off-screen at 375). We should do the same, or show a single "Chapter 3 of 6" pill that opens the list. |
| **How to build (vanilla)** | `<nav>` of `#anchor` links, `position: sticky; top: 0`. IntersectionObserver on each `h2` sets `aria-current` on its link. Phone: a `<details>` drop-down. Pair with card 06 (segmented progress). |
| **Cost / risks** | Low. Needs real `id`s on headings; never hijack scroll. |
| **Reduced motion** | No change; use `scroll-behavior: smooth` only under `prefers-reduced-motion: no-preference`. |
| **Use when** | Every hub guide (New to ILCAs, campaign management). |
| **Don't use when** | Under about 5 phone screens. |
