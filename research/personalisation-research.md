# Making BTS feel authored, not generated — research

Compiled 17 Nov 2026. Web research only. Quotes are kept under 15 words. Where a source is a vendor or agency blog rather than research, it is marked *(practitioner)*. NN/g and Baymard are research-backed. Most "AI tell" lists are community consensus, not studies.

---

## 1. Tells that make a site look AI-generated or template-generic

**The key point:** no single tell is fatal. Stacking 3–4 of them is what reads as an unedited AI export ([Utsubo, 2026](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026) *(practitioner)*).

### Visual tells
| Tell | What it looks like | Source |
|---|---|---|
| Purple/indigo-to-blue gradient | `from-purple-600 to-blue-600` on heroes, buttons, icons. It comes from Tailwind's default palette leaning purple | [925 Studios](https://www.925studios.co/blog/ai-slop-design-tells); [prg.sh essay](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website); [noqta](https://noqta.tn/en/blog/ai-design-slop-overused-ui-patterns-fix-2026) |
| Gradient text headings | `background-clip: text` on the H1 | [Laith UX-skill wiki](https://github.com/Laith0003/ux-skill/wiki/How-to-detect-AI-slop-in-your-design) |
| Unchosen Inter | Inter at default weights with no display face. The tell is the missing decision, not the font itself | [Kosta Canatselis](https://world.hey.com/kostac/spot-the-slop-a-ui-designer-s-guide-to-fixing-ai-defaults-4c448c9c); [925 Studios](https://www.925studios.co/blog/ai-slop-design-tells) |
| Centred hero, then exactly three cards | Three equal rounded cards, each with an icon and a faint shadow, repeated down the page with no hierarchy | [Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026); [aiwebsitedetector](https://aiwebsitedetector.com/blog/10-signs-ai-landing-page) |
| Uniform cards everywhere | The same radius, padding and shadow on every block, with cards nested in cards | [Laith ban list](https://github.com/Laith0003/ux-skill/wiki/Anti-AI-slop-ban-list) |
| Pill badge above the headline | "New", "Beta" or "Now with…" chips | [Laith wiki](https://github.com/Laith0003/ux-skill/wiki/How-to-detect-AI-slop-in-your-design) |
| Thin-line generic icons, emoji as icons | Interchangeable Lucide/Heroicons grids and emoji bullets | [925 Studios](https://www.925studios.co/blog/ai-slop-design-tells); [Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026) |
| Neon glow and glassmorphism | Unprompted glows, blurred glass cards and gradient blobs | [Laith wiki](https://github.com/Laith0003/ux-skill/wiki/How-to-detect-AI-slop-in-your-design) |
| Plastic AI imagery | Over-smooth 3D blobs, mangled signage text, malformed hands | [Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026) |
| Generic stock people | Models instead of the real team. Users skip them as "filler" | [NN/g – Photos as web content](https://www.nngroup.com/articles/photos-as-web-content/) |
| Purposeless motion | Every section fades up the same way on scroll, and hovers don't respond to anything | [Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026); [NN/g – Animation purpose](https://www.nngroup.com/articles/animation-purpose-ux/); [NN/g – Scrolljacking](https://www.nngroup.com/articles/scrolljacking-101/) |
| Identical section rhythm | Heading, paragraph and CTA, repeated with the same spacing. This is the "great flattening" | [23eleven](https://www.the23eleven.com/blog/your-website-looks-like-everyone-elses.html) *(practitioner)* |
| Over-correction | Asking an AI to look "less AI" gets cream and terracotta, or near-black with one acid accent | [noqta](https://noqta.tn/en/blog/ai-design-slop-overused-ui-patterns-fix-2026) |

### Copy tells
- **Weightless headlines** like "Build faster. Ship smarter." could belong to anyone ([925 Studios](https://www.925studios.co/blog/ai-slop-design-tells)). Typical stock openers are "Elevate your…", "Unlock…", "Your journey starts here" and "In today's fast-paced world".
- **Buzzwords** such as "seamless", "robust", "cutting-edge", "world-class" and "passionate" commit to nothing. Replace them with numbers or named specifics ([Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026)).
- **An em-dash in every sentence**, plus "It's not X, it's Y" constructions and triplets ([Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026)).
- **Hedging** like "may help you", and emoji-led bullet lists with no stance ([Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026)).
- **No real proof**: anonymous testimonials ("Sarah, parent"), no numbers, no names ([Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026); [NN/g – Trustworthy design](https://www.nngroup.com/articles/trustworthy-design/)).
- **Boilerplate metadata**: duplicate meta descriptions, a default OG image, alt text that just says "image" ([Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026)).
- **Typos and broken links** quickly erode credibility ([NN/g – Trustworthy design](https://www.nngroup.com/articles/trustworthy-design/)).

### Quick self-check for BTS
- Does any section use three equal cards with an icon on top?
- Does every section use the same reveal animation?
- Is any icon an emoji or a stock Lucide glyph doing a job a photo or diagram could do?
- Is there a testimonial without a full name or context?
- Is there a headline that a surf school could use unchanged?

---

## 2. What top designers do to make a small or personal brand feel authored

1. **Real people, real process photos.** On a team page, users spent 10% more time on real staff portraits than on bios, even though the bios took 316% more space ([NN/g](https://www.nngroup.com/articles/photos-as-web-content/)). For service businesses, NN/g advises showing the *process and the actual workers*, not just polished results ([NN/g – Trustworthy design](https://www.nngroup.com/articles/trustworthy-design/)). For BTS, that means James and Kai on the RIB, debriefs, whiteboards and the trolley park, in one consistent colour grade.
2. **A palette and type from something true about the subject.** Fix the gradient tell by building colour "from something true about the product" ([925 Studios](https://www.925studios.co/blog/ai-slop-design-tells)). Lando Norris's site pulls neon accents from his helmet ([DesignRush](https://www.designrush.com/best-designs/websites/lando-norris-website-design)). For BTS, that could be sail-number type, ILCA rig colours, chart datum blue, or the colour of the burgee.
3. **A signature motif and behaviour.** Codrops calls this a project's "digital signature": one reactive behaviour that is singular to the brand ([Codrops – Adrien Vanderpotte, 2026](https://tympanus.net/codrops/2026/05/27/whooshes-snaps-and-shaders-adrien-vanderpotte-and-the-feeling-of-the-interface/)). Leclerc's site is built to mirror an F1 circuit, and calendar transitions are part of that ([Awwwards](https://www.awwwards.com/sites/charles-leclerc)). One motif done well beats many effects.
4. **Keep the hand visible.** Readymag recommends keeping raw sketches with their grain, starting from scanned real objects, and treating each project as a story ([Readymag, Aug 2025](https://blog.readymag.com/10-habits-to-design-like-humans/)). Trend reports describe sketchbook aesthetics with handwritten captions ([Framer trends](https://www.framer.com/ja/blog/web-design-trends/); [TBH Creative](https://www.tbhcreative.com/?p=9802)). For BTS, that could be coach's-pen annotations on photos, such as arrows on sail shape or a handwritten "J" sign-off.
5. **Founder voice and first-person quotes.** Leclerc's site weaves his own quotes, anecdotes and a team-radio clip through a third-person narrative ([charlesleclerc.com](https://charlesleclerc.com/)). Team Malizia leads with Boris Herrmann's first-person lines ([team-malizia.com](https://www.team-malizia.com/)). *(BTS rule: no audio, so use quotes and transcribed lines instead.)*
6. **Specific numbers as proof.** Leclerc's stats sidebar lists Grands Prix, podiums and poles ([charlesleclerc.com](https://charlesleclerc.com/)). Surf Simply states its coach count and a maximum of 14 guests a week ([surfsimply.com](https://www.surfsimply.com/)). Swap superlatives for numbers ([Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026)). For BTS, that means sailors coached, ratio per coach, days on the water, and James's own results.
7. **Real testimonials with name, context and specifics.** Named, specific quotes are judged more credible, and photos reduce doubt. Get consent first ([Ryviu](https://www.ryviu.com/blog/the-impact-of-real-names-photos-and-context-on-testimonial-credibility) *(practitioner)*). NN/g notes users trust third-party sources such as reviews, social media and press more than on-site quotes ([NN/g](https://www.nngroup.com/articles/trustworthy-design/)). Surf Simply shows screenshots of real Google and TripAdvisor reviews and a "Featured in" press row ([surfsimply.com](https://www.surfsimply.com/)).
8. **Personality in copy, with a point of view.** Surf Simply calls itself "surf geeks" and opens by contrasting itself with conventional surf schools ([surfsimply.com](https://www.surfsimply.com/)). Take a position on who you are for, and who you are not for ([Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026)).
9. **Useful free tools and content before the sale.** Surf Simply offers a board volume calculator, a "Tree of Knowledge", video tutorials and a podcast ([surfsimply.com](https://www.surfsimply.com/)). BTS's calendar, guides and venue pages already do this, so lean into it.
10. **Serialised, current storytelling.** Team Malizia runs day-by-day race diaries, "How to follow" guides and a dated card grid ([team-malizia.com](https://www.team-malizia.com/)). Content that is current signals trust ([NN/g](https://www.nngroup.com/articles/trustworthy-design/)). A "Now / this week" strip or a camp diary would do this for BTS.
11. **Credit photographers by name.** Leclerc's footer and captions credit individual photographers, and captions carry place and date, for example "Monza – September 2024" ([charlesleclerc.com](https://charlesleclerc.com/)).
12. **Upfront disclosure.** Show prices, what's included, cancellation terms and contact details openly ([NN/g](https://www.nngroup.com/articles/trustworthy-design/)).
13. **Vary rhythm and hierarchy on purpose.** Give priority content more room, and break the three-column reflex with asymmetry or content that doesn't fit a grid ([925 Studios](https://www.925studios.co/blog/ai-slop-design-tells); [Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026)).
14. **Motion tied to meaning.** Use animation for feedback, state change and directing attention, not as decoration ([NN/g](https://www.nngroup.com/articles/animation-purpose-ux/)). Avoid hijacking scroll ([NN/g](https://www.nngroup.com/articles/scrolljacking-101/)).
15. **Let taste lead, not trends.** A consistent personal style is what people hire for ([Readymag](https://blog.readymag.com/10-habits-to-design-like-humans/)).

---

## 3. Exemplary sites: techniques worth borrowing

### Charles Leclerc — https://charlesleclerc.com/
Awwwards Site of the Day, 24 Apr 2025, by Apart and Uprising ([Awwwards](https://www.awwwards.com/sites/charles-leclerc)).
- Split into "The Driver" and "The Man": a fast, circuit-like half and a fluid, intimate half.
- Numbered chapter menu (01–05) and long-scroll chapters: Beginnings, Motorsport, Ferrari, Life as a driver.
- Stats sidebar with hard numbers, and year-by-year karting results.
- Large pull quotes in his own words, family anecdotes, and a section on training and preparation routines.
- Strict two-colour palette (Ferrari red and light blue), calendar typography transitions, and photographer credits.
- **For BTS:** a "James the coach / James the athlete" split, a numbered chapter menu for long guides, and a results timeline.

### Lando Norris — https://landonorris.com/
By OFF+BRAND (Glasgow), Awwwards SOTD ([Awwwards](https://www.awwwards.com/sites/lando-norris); [DesignRush](https://www.designrush.com/best-designs/websites/lando-norris-website-design)).
- Palette lifted from his helmet, with neon accents.
- "On Track" and "Off Track" split: results versus culture.
- A helmet archive acts as a signature collection object.
- Reactive overlays on the hero respond to the cursor.
- **For BTS:** a "sail archive" or "boat log" collection object, with a palette drawn from BTS's own kit.

### Surf Simply (surf coaching resort) — https://www.surfsimply.com/
- A strong, nerdy voice ("surf geeks") that positions itself against conventional surf schools.
- Small-group numbers stated plainly: coach count and a maximum of 14 guests.
- Review screenshots instead of polished quote cards, plus a press row.
- Free coaching tools (calculator, video tutorials, podcast) build trust before booking.
- Objection-killing copy about logistics.
- **For BTS:** this is the closest business model. Copy its proof approach and its "useful before you buy" content.

### Team Malizia (Boris Herrmann, offshore sailing) — https://www.team-malizia.com/
- Skipper-led first-person headlines, and day-numbered race diaries.
- A "Data" item in the main nav for live tracking.
- A news grid with bold date stamps and mixed-crop photos (landscape and portrait) for rhythm.
- Lowercase, stacked editorial tagline, and partners grouped by tier.
- A purpose thread (science and sustainability stories).
- **For BTS:** dated camp diaries, mixed photo crops, and a tiered sponsor block (Sailing Chandlery).

### Uncharted Waters (US Olympic sailing documentary) — http://uncharted.sunbrella.com
Awwwards SOTD 2016 ([Awwwards](https://www.awwwards.com/sites/uncharted-waters)).
- Documentary-led: athlete profile films, video diaries, and an interactive map of training and travel.
- Monochrome palette, so the photography carries the colour.
- Older, but the closest precedent for an Olympic-campaign sailing story.
- **For BTS:** a map of James's campaign season, and athlete-diary style posts.

### Rapha Journal (cycling) — https://www.rapha.cc/gb/en/journal
- One consistent image format and grade across every story tile.
- Mix of practical guides ("Plan your…") and heritage storytelling.
- Campaign pieces get their own type treatment.
- **For BTS:** use one grade and crop ratio for all guide cards, and save special type treatments for flagship stories.

---

## 4. Craft-detail checklist (pro-built vs generated)

**Typography**
- [ ] Deliberate type pairing (display + text) with a modular scale; not one family at default weights ([Kosta Canatselis](https://world.hey.com/kostac/spot-the-slop-a-ui-designer-s-guide-to-fixing-ai-defaults-4c448c9c)). Montserrat alone risks this, so consider a second face for display or quotes.
- [ ] Body measure of 50–75 characters (`max-width: 65ch`), and WCAG 1.4.8 says 80 or fewer ([Baymard](https://baymard.com/blog/line-length-readability); [Butterick](https://practicaltypography.com/line-length.html)).
- [ ] `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs to avoid orphans ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap); [Chrome blog](https://developer.chrome.com/blog/css-text-wrap-pretty)).
- [ ] `hanging-punctuation: first` on pull quotes (Safari only; otherwise use a negative text-indent) ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/hanging-punctuation)).
- [ ] Real typographic quotes and apostrophes (’ “ ”), en-dashes in ranges (Jan–Mar), non-breaking spaces in "ILCA 6" and "10 kts" ([Butterick](https://practicaltypography.com/)).
- [ ] Tabular numerals (`font-variant-numeric: tabular-nums`) in tables, prices and calendars.
- [ ] Optical alignment: nudge large headings and icons so they *look* aligned, not just align by box.

**Images**
- [ ] One consistent photo grade, real people only, and captions with place and date plus a photographer credit ([NN/g](https://www.nngroup.com/articles/photos-as-web-content/)).
- [ ] Art direction per breakpoint with `<picture>` and `media` (a tighter crop on phones), `width`/`height` set to stop layout shift, and `loading="lazy"` below the fold ([web.dev](https://web.dev/articles/browser-level-image-lazy-loading)).
- [ ] Dark-mode image handling: no white-background images on dark pages, slight dimming of bright photos, and SVG diagrams using `currentColor`.
- [ ] Descriptive alt text, never "image" ([Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026)).

**Interaction**
- [ ] Visible custom `:focus-visible` styles that meet WCAG 2.2 focus appearance ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).
- [ ] `prefers-reduced-motion` honoured ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)). Motion should mean something ([NN/g](https://www.nngroup.com/articles/animation-purpose-ux/)), and scroll should never be hijacked ([NN/g](https://www.nngroup.com/articles/scrolljacking-101/)).
- [ ] Scroll restoration and anchor offsets (`scroll-margin-top` under a sticky nav) ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration)).
- [ ] One consistent icon set with a consistent stroke, and custom glyphs where meaning matters (wind arrow, rig, mark).
- [ ] Loading, empty and error states written in the brand voice. NN/g says empty states should explain what's going on and offer a next step ([NN/g](https://www.nngroup.com/articles/empty-state-interface-design/)). For example, "No events match ILCA 4 in March, try All rigs".
- [ ] Button micro-copy that names the outcome ("Book Weymouth, 14–15 Mar"), not "Get started" or "Learn more" ([925 Studios](https://www.925studios.co/blog/ai-slop-design-tells)).

**Polish and metadata**
- [ ] A favicon set: SVG with a dark-mode media query, a 180px apple-touch icon, and a manifest ([Evil Martians](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)).
- [ ] An OG image and a unique meta description per page ([Utsubo](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026)).
- [ ] A custom 404 page in the brand voice, with routes back.
- [ ] Print styles for the calendar, kit lists and guides (`@media print`: hide nav, show URLs).
- [ ] No typos or broken links, and visibly current content ([NN/g](https://www.nngroup.com/articles/trustworthy-design/)).
- [ ] Contact details, prices and terms are easy to find ([NN/g](https://www.nngroup.com/articles/trustworthy-design/)).

---

### Source quality note
NN/g, Baymard, MDN and W3C are authoritative. Awwwards and DesignRush pages describe the example sites. The "AI slop" catalogues (Utsubo, 925 Studios, the Laith wiki, noqta) are practitioner opinion, but they agree with each other closely. The site observations in section 3 come from text-only fetches on 17 Nov 2026, so check them visually before copying anything.
