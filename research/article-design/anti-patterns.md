# Anti-patterns

_13 Nov 2026. Everything here was seen in the corpus (`calibration.md`, `corpus.md`) unless marked **(rule)**, which means it comes from James's or Kai's rules rather than a sighting. Each entry: what it is, where we saw it, why it hurts, what to do instead._

## Reading and navigation
| Anti-pattern | Seen on | Why it hurts | Instead |
|---|---|---|---|
| **Fake page height / scroll-jacking**: the page is a tall empty box and JS moves a fixed "world" | ESPN F1 (60,000px page, 31,491 × 10,936px world) | Breaks find-in-page, anchor links, Back to a position and screen readers; scroll speed isn't the reader's | Real DOM text in order; sticky sections inside a normal scroll (card 14), camera over a world only as a sticky background (card 02) |
| **Non-scrolling "articles"** (tap-through) | Pudding "Walkachusetts" | Breaks the reading habit and find-in-page; can't skim | A normal scrolling page; taps only for optional extras |
| **Landing-page-only design**: a clever hero, then a plain template | LeBron (most of the effort is in the first screens); every sailing site | The body is where people read; the hero is seen once | Judge the middle third; budget the effort there |
| **Chapter tabs squeezed onto a phone** | (avoided by BBC and Nature, who hide them at 375) | Unreadable, untappable | A "Chapter 3 of 6" pill that opens a drawer (card 15) |

## Pacing
| Anti-pattern | Seen on | Why it hurts | Instead |
|---|---|---|---|
| **Long text runs with only a decoration beside them** | BBC "The slow death of the screamer" (2–3 screens with a static drawing); Nature fusion's second half | A drawing that never changes isn't a beat; the page feels stalled | A beat every 1–2 screens (rhythm.md 2.1) |
| **Paragraph, photo, paragraph, photo (and nothing else)** | SailGP ×2, ETNZ, Red Bull: median 7/16 | Photos break the text but never explain anything; no repeated unit | One spine (card 14 or 16) for the explaining part; photos only where they show something |
| **Very airy scrolly pages for skim content** (~30 words per screen) | BBC "The boat that disappeared" (70 screens / 2,170 words), Nature brain (78 / 2,266), ESPN (32 / screen) | Fine for a narrative, far too slow for a guide people want to search | Dense 75–95 words per screen for hub/venue guides; airy only for stories or one walk-through chapter |
| **Endless pinned sections** | ESPN horizontal timeline ≈28 desktop screens | Reader loses the thread and patience, especially on a phone | ≤ 6 steps per pin; split into chapters |
| **Several big moments competing** **(rule)** | — (calibration rule: one repeated unit) | Reads as a showcase, not a story | ≤ 1 big moment per chapter, one pin style per page |
| **Slides feel**: a title band on every short section | (risk noted on card 18) | Page becomes a deck of slides | Bands only for chapters ≥ 2 phone screens |

## Phones
| Anti-pattern | Seen on | Why it hurts | Instead |
|---|---|---|---|
| **Half-cards mid-pan** | ESPN F1 at 375 | Fragments of two cards; nothing readable mid-scroll | One card per screen; snap or pin, never a diagonal pan on phones |
| **Photo rows that stack into a tower** | LeBron "Lift As You Climb" (≈4 phone screens of photos) | Long dead scroll | Swipe row (`scroll-snap`) or one photo on phones |
| **Squashed desktop layouts** (shrunk rows, tiny charts) | (nobody in the top 10 did it; finding 3) | Unreadable labels, thumbnails | Re-compose: row → column (card 21), re-crop pinned pictures |
| **Fixed chrome eating the screen**: countdowns, sponsor bars, extra sticky headers, pop-ups | SailGP (header + countdown + sponsor bar ≈ ¼ of a 375 × 812 screen); Red Bull location pop-up; ESPN consent box | Less than ¾ of the phone left for the article | One slim nav bar at most; nothing else fixed in the article body |
| **Tables that cut columns off** | Red Bull Alinghi crew table (role column clipped at 375) | Lost data, sideways scroll inside the page | Row → column cards on phones, or drop to the essential columns with the rest on tap |

## Weight
| Anti-pattern | Seen on | Why it hurts | Instead |
|---|---|---|---|
| **Heavy pages on phones** | America's Cup "The boats" 37 MB; LeBron 20–29 MB; SailGP 8.5–12.2; general corpus median ≈ 6.5 MB, only 1 of 10 under 3 MB | Slow on 4G at a club, burns data, pins stutter while images load | ≤ 3 MB hard cap, 1.5 MB target (rhythm.md 3.1) |
| **Autoplay video in the body** | America's Cup, LeBron | The main cause of the heaviest pages; distracts from the text | Poster + tap to play, `preload="none"` |
| **Third-party embeds mid-article** (YouTube, Instagram, X, Facebook SDK) | SailGP, ETNZ, America's Cup | Weight, trackers, layout shift | Poster image linking out |
| **A new full-screen photo for every pinned step** | Shorthand pieces swap whole images per card | Multiplies weight | One photo per pin; change crop, highlight or an SVG overlay (card 16) |

## Motion and accessibility
| Anti-pattern | Seen on | Why it hurts | Instead |
|---|---|---|---|
| **No reduced-motion fallback** | ESPN, LeBron, Nature brain (0 rules); the rest partial; no page in the corpus scored 2 | Motion-sensitive readers get the full show or a broken page | Every pattern ships its reduced-motion version and is checked with `SCROLLCAP_RM=1` |
| **Motion with no purpose** | (calibration: the good pages never did it) | Noise; slows the read | Motion only reveals, compares or moves on |
| **Text over a busy picture or video** | (risk on card 14; the good pages always used solid or blurred card backgrounds) | Unreadable, fails contrast | Card with a solid/blurred background, ≥ 4.5:1 |
| **Key facts only inside an aside or a hover** | (risk on card 20) | Skippable boxes and hovers hide them from some readers | The aside repeats or expands; the fact also lives in the main text (as the author wrote it) |
| **Sound** **(rule)** | ESPN engine play buttons; NBC inline audio | James: no audio on BTS, ever | Nothing. Not even opt-in |

## Writing
| Anti-pattern | Seen on | Why it hurts | Instead |
|---|---|---|---|
| **Rewording, trimming or reordering the author's copy to fit a layout** **(rule)** | — (Kai's rule) | It's their writing; facts and voice get lost | The layout bends to the text: long paragraphs stay in the column, not in a card |
| **Inventing beats in words** (made-up pull quotes, stat callouts, captions that add claims) **(rule)** | — | Puts words in the author's mouth | Beats come from structure the author already wrote (rhythm.md 4.2) |
| **Splitting a guide into hub + offshoots without the author** **(rule)** | — (New to ILCAs kept as one page) | Restructures their writing | Propose the split; the author decides |
