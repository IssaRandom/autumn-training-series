# Object turned by scroll

| | |
|---|---|
| **Group** | 3. Scrollytelling (scrub) |
| **What it does for the story** | A 3D model (or photo sequence) of one object turns and moves as you scroll, to show each side the text is talking about. |
| **Seen on** | The Conversation "The science of beautiful buildings" (grey 3D models of Villa Stein and Robie House rotate and change viewpoint between caption cards; https://stories.theconversation.com/the-science-of-beautiful-buildings/, `shots/conv-buildings-375-007.jpg`). **Seen on 1.** (Only the phone run reached the middle third; desktop timed out.) |
| **Phone version** | Pinned full screen, caption cards over it (card 14). |
| **How to build (vanilla)** | An image sequence (20–40 WebP frames) drawn to a `<canvas>`, frame picked from scroll progress; or a short muted `<video>` whose `currentTime` follows scroll. Lazy-load the frames. |
| **Cost / risks** | High weight (frames or video). Phone budget first. |
| **Reduced motion** | Show 3–4 key frames as stills next to the captions. |
| **Use when** | One hero object: an ILCA hull or rig turned to show controls, a mast going up. |
| **Don't use when** | A labelled still does the job. |
