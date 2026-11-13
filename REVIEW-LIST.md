# James's review list

_12 Nov 2026. Built from STATUS.md, POLISH-AUDIT.md, BOOKING-PLAN.md, memory and git. Everything is committed on `beta`. There are **10 commits that haven't been pushed**. STATUS.md still says "UNCOMMITTED" in several places, but that's out of date._

## 1. Look at it on your phone (built, not seen by you yet)
- [ ] **Dark theme + homepage like the live site:** hero, coach cards, same nav on every page, 12px corners, Montserrat for small text.
- [ ] **Calendar wave v3:** change the rig or filters. New events should float in on the wave and set down as it goes back. Removed ones float out. Check both Year view (desktop) and Months view (phone list rows).
- [ ] **Splash** on Book buttons (homepage "See camps & book", Confirm booking, "Book with BTS" in the calendar sheet).
- [ ] **Basics pass (P0):** how presses feel, the ☰ on the calendar, the new BTS home-screen icon (Add to Home Screen), `/beta/404.html` ("Off the layline").
- [ ] **Loaders + skeletons** on a slow connection: calendar, /account, Weymouth guide.
- [ ] **Venues hub** `/beta/venues/`: Weymouth feature card and the Poole/Hayling/Rutland "coming soon" cards.
- [ ] **Calendar rounds 5 + 6:** one toolbar row, Filter sheet, first-visit tour, tips, event sheet (bell / calendar icon buttons), venue guide tiles, the humour.
- [ ] Turn on **Reduce motion** on your phone once and check nothing looks broken. Nobody has checked this by eye yet.

## 2. Copy only you can write
- [ ] **Four loader coach lines**, all drafts: calendar "Plan the season, then sail it.", account "Good prep is half the regatta.", Weymouth "Read the water before you race it.", /book "Check the kit list while you wait."
- [ ] **10–20 one-liners** in your voice for the microcopy pass (#17), plus a **"currently" line** for the footer.
- [ ] **Hero headline** ("Sail faster by thinking clearer.") and the coach one-liners for you and Kai, all drafts.
- [ ] Tip: `tools/copy-editor` (launch config "copy-editor", port 8781) shows every phrase on /beta in one table you can edit.

## 3. Booking system (live, needs your hands)
- [ ] **Paste the new Code.gs into Apps Script and Deploy ▸ New version.** These changes are waiting: P2/P3 fixes, the reference format, medical form matching + receipt email, booking alerts going through `notifyAdmins_`, and `testNotify()`.
- [ ] **Connect the medical form:** put the form's editor URL in `medical_form_id`, run `setup` (approve Forms), run `syncMedical`, then make a New version. Then test it again: fill in the form, check the site shows it done and the receipt email arrives.
- [ ] **Clean up the test:** set winterNY1 back to `open`=N and cancel the test booking (if not done already).
- [ ] **Fill in Booking settings:** bank details, `reply_to`.
- [ ] **Camp capacities**, then set `open`=Y on the camps you want bookable.
- [ ] Reword the "book by 28 Nov" notes in events.js now the 7-day payment rule is final.
- [ ] Archive the old empty Apps Script deployment (`…AKfycbxeng…`).

## 4. Calendar decisions
- [ ] **Real dates for the 3 BTS placeholder blocks:** Summer Block 1 (19–23 Jul), Pre-Nationals at Largs (3–5 Aug), Summer Block 2 (23–27 Aug). Also: is the joint pre-Nats with the Irish happening?
- [ ] **Trim the calendar** (the rule was list everything, then trim): 83+ events, many of them provisional foreign nationals.
- [ ] National Opens 2–6 are marked "check NOR" because their rigs aren't confirmed.
- [ ] Recheck once these are published: RYA Youth Nationals 2027, GP Series rounds, U21 Euros dates, ILCA 4 Youth Euros venue (Carnac or Quiberon), foreign nationals, Palamós, RLymYC winter coaching.
- [ ] Email youth@ilca.uk to check the Oct 2023 qualification policy is still current.

## 5. Content and assets still to come from you / Kai
- [ ] Slow-mo footage (60–120fps) and photos, including **one photo of each coach**. Picsum placeholders are on the venue cards, the guides and the Weymouth hero + map.
- [ ] **Voice notes per wind direction** for Weymouth (harbour vs bay). SW/NE/N are drafts, E is a stub, the rest say "notes coming".
- [ ] Weymouth placeholders: map pin positions, bias %, tide range, timeline times, stay/eat copy, cost calculator defaults, real Windfinder wind rose numbers, and the Race Navigator link (currently `#`).
- [ ] New to ILCA guide: all copy is draft, and the price/cost/sail-number tables are tagged "To verify".
- [ ] Ask the British team what they'd let us publish from their Weymouth notes.

## 6. Next build: pick one
- [ ] Sprint step 2: **#17 microcopy pass** (needs your lines from section 2).
- [ ] Sprint step 4: **#15 page transitions** (View Transitions).
- [ ] Then #19 start-sequence countdowns, #20 beat progress bar, #26 easter eggs, #27 flag favicon, #16 live wind badge (needs a Navigator endpoint).
- [ ] Pages not built yet: an **Advice hub** page (like Venues), **About**, **Coaching**. Advice cards 02–05 still link to `#advice`.
- [ ] Event intel roadmap: host NoR/SI PDFs, parse key info, weather/Navigator/Windfinder links per event.
- [ ] Later ideas: season templates per sailor type, route map with costs, travel info directory, "Export all (.ics)", a "my rig only" share link.

## 7. Housekeeping
- [ ] **Push `beta`** (10 commits only exist locally), when you're happy.
- [ ] Small known gaps: the venues hub "Next here" line shifts the page slightly after load; 78 low-priority audit items (innerHTML escaping, 11 images without width/height, 16 events without a source URL); no full Lighthouse run yet.
- [ ] When beta goes live: swap the live site's "KW | JF" 404, manifest, favicon and meta for Beyond the Shift; sync camps between `events.js` and the live `script.js`.
