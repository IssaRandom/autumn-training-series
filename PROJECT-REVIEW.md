# BTS website: project review

_15 Nov 2026 · made with the `bts-project-manager` skill · sources: STATUS.md, REVIEW-LIST.md, BOOKING-PLAN.md, POLISH-AUDIT.md, git, events.js, and the booking Google Sheet (read only)_

## 1. Headline
A lot is built on `/beta`: calendar, booking, the New to ILCAs guide, Weymouth guide and lots of polish. **None of it is public.** `/beta` isn't on `master`, and the 27 beta commits plus 61 uncommitted files only exist on the `beta` branch and this laptop. The biggest risk is that online booking misses the winter camps. The setup is about 30 minutes of your clicks, the Christmas deadline is **28 Nov (13 days)** and New Year #1 closes **6 Dec**. The most useful thing you can do this week is finish the booking setup (section 5, ★ items) and decide how `/beta` goes public.

## 2. Scoreboard
| Area | Status | What's left |
|---|---|---|
| Live site (beyondtheshift.co.uk) | **Live**, last change 3 Nov | Still books through the Google Form. "KW \| JF" is still in the 404, manifest and favicon |
| Calendar | **Built on beta** (rounds 1–6, wave, tour, filters) | Your phone check; NO entry-close dates; 3 summer placeholder blocks; trim; recheck dates once published |
| Booking (Sheet + Apps Script) | **Built, half set up** | Bank details, reply_to and medical form are all blank. Code.gs not redeployed. 3 test bookings still in the sheet. NY1 still `open=Y` |
| New to ILCAs guide | **Built on beta** (4 review rounds) | Photos: RYA regional, BTS Poole YC, maker logos, Racing photo credit. Latest photo work uncommitted |
| Advice directory | **Built on beta** | 10 of 11 guides are "Under construction" and waiting on Kai's Website-tab topics |
| Weymouth venue guide | **Partly built** (explorer uncommitted) | 14 yellow `.todo` slots, 11 `.draft`, picsum images, wind notes per direction, harbour sketch, Windfinder numbers |
| Venues hub | **Built on beta** | Picsum images, 6 other venues "coming soon" |
| Polish / motion | **Mostly done** (P0, splash, wave, loaders, skeletons, page wake) | Your phone feel-check; 4 loader lines + one-liners in your voice |
| Coaching / About pages | **Not started** | "Coaching" links still go to the live homepage |
| Promotion to live | **Not started, no plan** | Decide: replace live, or put /beta up beside it |

Across beta HTML: 33 `PLACEHOLDER`, 33 `.wip`, 15 picsum images, 11 `.verify`, 11 `.draft`, 14 `.todo`.

## 3. What's halting progress (worst first)
1. **Booking can't go live: three of your clicks, plus a missing deploy.**
   - The sheet has **no bank details and no reply_to**. The first real booking email would show blank payment details.
   - `medical_form_id` is blank, so the medical tick never clears and no receipt email goes out (the exact problem you hit on 11 Nov).
   - Code.gs changes from 11–12 Nov are not pasted or redeployed.
   - Even when all that's done, parents can't reach `/beta/book/` because `/beta` isn't deployed on `master`.
2. **Nothing has shipped in 12 days.** Each round of work adds to a pile only you can see. The longer beta stays separate, the harder the merge gets, and the more `events.js` drifts from the live `script.js` camps (two copies of the same data).
3. **Your review is the bottleneck.** Most "Where we are" entries in STATUS end with "Not checked: real phone". REVIEW-LIST has around 30 items for you to look at. Building is running about 3 rounds ahead of your feedback.
4. **Content only you and Kai can supply:** photos (coaches, venues, how-to), Weymouth voice notes per wind direction, Kai's next guide topics, and lines in your voice. 10 empty guide pages and the Weymouth slots all wait on this.
5. **Too much uncommitted work:** 27 modified and 34 new files (Weymouth explorer, New to ILCAs photos), sitting next to booking/calendar hunks in shared files. One bad session could lose it.
6. **Balance.** About 26 of the last 27 commits were design and motion (wave versions 1–6, loaders, transitions, rig walk). It's good work and you asked for it, but nothing in it gets a parent booked or a page live. Recommended rule for the next two weeks: no new animation until booking is live and beta is public in some form.

## 4. Top priorities
1. **Finish booking setup.** You, S (~30 min). Fill in bank details + reply_to, paste the medical form editor URL, paste Code.gs, run `setup` + `syncMedical`, New version. Delete the 3 test bookings and set NY1 back to N. *Unblocks:* online booking for NY/Feb camps.
2. **Decide how /beta goes public** (see ★ questions), then Claude merges and deploys. You decide, Claude builds, M. The quickest safe route is shipping `/beta` to `master` as-is: it's already `noindex`, so it's reachable by link only. Then send a few families the `/beta/book/` link for NY1/NY2 next to the Google Form, as BOOKING-PLAN already intends. *Unblocks:* real use, your phone review on the real URL, and an end to drift.
3. **Commit and push everything.** Claude, S. Stage per piece (Weymouth explorer, NTI photos, docs). *Unblocks:* safety; a clean merge for #2.
4. **One 30-minute phone review on the real URL.** You, S. Do the whole REVIEW-LIST section 1 in one sitting and send a voice note. Put photos of what's wrong ahead of new builds. *Unblocks:* about 10 "not checked" items.
5. **Content drop.** You + Kai, M. Coach photos, 5–10 venue/how-to photos, Weymouth voice notes (SW, W, NE first), and Kai's next Website-tab topic. *Unblocks:* Weymouth, the empty guides, and the picsum placeholders.
6. **Coaching page on beta.** Claude, M (after your answers). It's the last piece needed before beta can replace the live homepage, because every "Coaching" link still goes off-site.
7. **Calendar tidy.** You decide, Claude builds, S. Entry-close rule, the 3 summer block dates, the trim list.

## 5. Questions for James
**Booking**
- ★ Can you fill in the bank details and `reply_to` in *Booking settings* this week? (Or tell me the reply_to address and I'll put it in. Bank details you should type yourself.)
- ★ Want online booking for **New Year #1/#2** (closes 6 and 10 Dec) or start with **February**? Christmas (28 Nov) is probably too soon.
- ★ Camp capacities? Blank = unlimited right now.
- Can I delete the 3 test bookings (you, "Kai Wolgramator", "adsd asd") and set winterNY1 back to `open=N`?

**Going public**
- ★ Shall `/beta` go onto `master` now, hidden from Google and linked only from booking messages? Or keep it private until it's ready to replace the live site?
- When beta replaces live, should the live homepage become the beta homepage, or should beta start as a new section (Calendar + Advice) linked from live?
- Who reviews before something goes live: just you, or Kai too?

**Content**
- ★ When can you send coach photos and a first batch of venue/how-to photos?
- Which Kai topic comes next after New to ILCAs? (He supplies the copy; we build the page.)
- Weymouth: OK to put it live with yellow "coming soon" slots, or does it wait until the wind notes are done?

**Calendar**
- National Open entry close: is "the Sunday before" final? Then the estimate note goes.
- Real dates for Summer Block 1, Pre-Nats at Largs and Summer Block 2, or keep them as placeholders?

**Scope**
- OK to freeze new animation and polish until booking is live and beta is public?

## 6. Ready for Claude now (no input needed)
- **Commit the working tree:** "Commit the uncommitted beta work in pieces (Weymouth explorer, New to ILCAs photos, STATUS/skills), following beta commit hygiene, run beta-bust, and push `beta`."
- **Merge plan:** "Write a merge plan for getting `beta` into `master` with `/beta` noindex: conflicts, `_headers`/`robots`, sitemap exclusions and a rollback step. Don't merge yet."
- **Placeholder sweep:** "List every PLACEHOLDER/picsum/.todo/.wip/.verify on /beta in one table by page, with what each needs and from whom, so James can batch-supply them."
- **Single source for camps:** "Propose how the live `script.js` camps and `beta/data/events.js` can share one source so dates can't drift."
- **Review backlog:** "Run the web-design-reviewer static audit on /beta and fix the P3 innerHTML-escaping and missing img width/height items."
- **Refresh REVIEW-LIST.md:** it's dated 12–13 Nov and says 10 unpushed (now 2 unpushed, 27 ahead of master).

## 7. Parked / later (fine to leave)
Calendar bar→sheet morph; start-sequence countdowns; beat progress bar; easter eggs; live wind badge; NoR/SI parsing and hosting; season templates; route map with costs; travel directory; link graph of guides; 3D start-line view; photo offshoot guides; article-design skill evals.

## 8. Housekeeping
- 2 commits not pushed; 27 commits on beta not on master; 61 uncommitted files.
- STATUS.md is 190 lines and the "Where we are" log is very long. Suggest moving entries older than 12 Nov to an archive section so sessions start faster.
- REVIEW-LIST.md is out of date (see above).
- `netlify.toml` is unused (Cloudflare), but the beta 404 rule was added there. Check that Cloudflare `_redirects` does the same job.
- Archive the empty `…AKfycbxeng…` Apps Script deployment.
- At promotion: swap "KW | JF" in the live 404, manifest, favicon and meta.
