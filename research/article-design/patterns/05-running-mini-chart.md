# Running mini chart

| | |
|---|---|
| **Group** | 6. Data |
| **What it does for the story** | A small chart stays with the reader and its marker moves as the story moves, so one number builds up across sections. |
| **Seen on** | ESPN F1 "Champion car weights" line; the dot moves to each year (`shots/espn-1280-016.jpg`); The Conversation "The science of beautiful buildings" (Shorthand): a small bell curve sits in each caption card and its dot moves to where each building lands (https://stories.theconversation.com/the-science-of-beautiful-buildings/, `shots/conv-buildings-375-009.jpg`). **Seen on 2.** |
| **Phone version** | ESPN: kept, smaller, under the card. The Conversation: the curve lives inside the caption card, so it is phone-sized by default (the better model). |
| **How to build (vanilla)** | Inline SVG polyline; the active stop sets a CSS variable that moves the marker (`transform` on a `<circle>`). |
| **Cost / risks** | Low–medium (needs real data). |
| **Reduced motion** | Static chart with all points labelled. |
| **Use when** | Wind range across a season, ranking through a regatta series, hours on the water. |
| **Don't use when** | No real numbers behind it. |
