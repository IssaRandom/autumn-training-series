# Stacking cards

| | |
|---|---|
| **Group** | 2. Pacing |
| **What it does for the story** | Each new card slides up and sits on top of the last one (a few px apart), so a list feels like a pile you are building. |
| **Seen on** | LeBron "More Than Basketball" (`shots/lebron-1280-022.jpg`). **Seen on 1.** |
| **Phone version** | Becomes a vertical list of cards; stacking still works with sticky. |
| **How to build (vanilla)** | Pure CSS: each card `position: sticky; top: calc(var(--nav) + n * 12px)`. No JS. |
| **Cost / risks** | Low. Cards must be shorter than a phone screen. |
| **Reduced motion** | Same (sticky isn't motion). |
| **Use when** | Values, "5 things to pack", the steps of a routine. |
| **Don't use when** | Long cards that overflow a phone screen. |
