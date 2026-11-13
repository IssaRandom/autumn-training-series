# Before/after pair

| | |
|---|---|
| **Group** | 4. Pictures and video |
| **What it does for the story** | Two of the same thing side by side (or a drag slider) so the difference is the story. |
| **Seen on** | ESPN F1 top-down 1968 vs 2024 floors/aero/tires (`shots/espn-1280-049.jpg`); Nature "How the world's biggest laser…" spherical vs spiky implosion, stacked with labels (https://www.nature.com/immersive/d41586-024-03745-z/index.html, `shots/nature-fusion-375-012.jpg`); Nature "What's so special about the human brain?" mouse / macaque / human neurons side by side (`shots/nature-brain-375-048.jpg`). **Seen on 2.** |
| **Phone version** | ESPN and Nature both stack the pair (Nature turns its three-up row into a column with a label on each). A drag slider is better on phones when the pictures line up exactly. |
| **How to build (vanilla)** | Side-by-side figure with a shared caption; or `<input type=range>` controlling `clip-path` on the top image (no library). |
| **Cost / risks** | Low. Needs matching photos (same angle and crop). |
| **Reduced motion** | Static pair. |
| **Use when** | Right vs wrong trim, ILCA 4 vs 6 vs 7 rig, old vs new kit, light vs strong wind setup. |
| **Don't use when** | Pictures that don't line up. |
