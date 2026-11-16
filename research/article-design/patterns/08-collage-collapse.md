# Collage that collapses into one line

| | |
|---|---|
| **Group** | 1. Openings / 3. Scrollytelling |
| **What it does for the story** | A cluster of photos converges (or flies apart) to leave one sentence alone on the screen: many moments → one idea. |
| **Seen on** | LeBron "Just a Kid, From Akron." (`shots/lebron-1280-004.jpg` → `-006.jpg`). **Seen on 1.** |
| **Phone version** | Kept; photos stack vertically, then collapse the same way. |
| **How to build (vanilla)** | Pinned section (sticky, ~200svh); each photo's `transform`/`opacity` keyed to scroll progress with a scroll-driven animation; fallback: IntersectionObserver toggles one "collapsed" class with a CSS transition. |
| **Cost / risks** | Medium. Easy to over-do; once per page. |
| **Reduced motion** | Photos as a static grid, the line under them. |
| **Use when** | Opening of an athlete/coach story, or a chapter start ("Weymouth, 2012"). |
| **Don't use when** | How-tos and hub guides. |
