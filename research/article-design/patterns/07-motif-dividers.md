# Motif dividers (the subject becomes the page)

| | |
|---|---|
| **Group** | 2. Pacing |
| **What it does for the story** | One visual metaphor from the subject runs the whole page: dividers, backgrounds and transitions are all drawn from it. |
| **Seen on** | ESPN F1: red/white kerbs, asphalt texture, a chequered finish line (`shots/espn-1280-006.jpg`, `-090.jpg`). **Seen on 1.** |
| **Phone version** | Same, shrunk to the edges. |
| **How to build (vanilla)** | SVG/CSS shapes between sections; a diagonal `clip-path` wedge that slides in on enter (`animation-timeline: view()` with a fallback class). |
| **Cost / risks** | Low per divider; the cost is restraint (one motif only). |
| **Reduced motion** | Static shapes. |
| **Use when** | BTS: wake lines, tide arrows, a wave edge (we already have the calendar wave), start/finish line. |
| **Don't use when** | Mixing several motifs. |
