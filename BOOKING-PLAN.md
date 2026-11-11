# BTS online booking (beta): plan v2

_Revised 2026-11-11. Status: backend + frontend phases 2–5 built; waiting for the deployed /exec URL._
_v1 (Supabase + Resend) was dropped: James wants all data in his own Google Sheet and no new accounts or services._

## Goal
Booking should take a returning parent under a minute. The flow is: sign in → pick a camp → tick the sailor → confirm. They then get an email with the bank details, the amount, a payment reference, and the medical and image release link if it is still outstanding. James or Kai confirm personally once the money arrives. The parent can see everything they have booked and what each booking still needs. There are no card payments, no provider fees and no new third-party accounts.

## How it works today (live site)
- The site is a static site on **Cloudflare Pages**, using `_headers`. (`netlify.toml` is left over and unused.)
- One Google Form (`forms.gle/X7offBwNaL24wZ4t7`) for every camp, so parents type everything again each time.
- A separate Google Form for medical and image release.
- Bank details, the reference and payment are all handled by hand afterwards.

## Stack: only what James already owns
| Need | Tool | Notes |
|---|---|---|
| Website | Cloudflare Pages (as now) | Gets new static pages: `/beta/account/`, `/beta/book/`, `/beta/my-bookings/` |
| Database | **One private Google Sheet** in James's Drive | One tab per table (below). Never shared publicly. |
| Backend | **Google Apps Script** attached to that sheet, deployed as a web app | It is the only thing that reads or writes the sheet. The website talks to it with `fetch()`. |
| Emails | **Gmail via Apps Script** (`MailApp`/`GmailApp`) | Sent from James's own Google address, so no DNS changes are needed. Daily limit: 100 on a free Gmail account, 1,500 on Google Workspace. Plenty either way. |
| Spam protection (optional) | Cloudflare Turnstile | Already part of the Cloudflare account. It goes on the sign-in form only. |

**Admin is the Google Sheet itself.** James and Kai mark payments in a dropdown column, add notes, filter and sort. No admin page needs building.

## Sign-in without passwords
1. The parent enters their email. Apps Script emails them a **6-digit code** that is valid for 15 minutes. This is better than a magic link: on phones, links open in the email app's own browser and lose the session.
2. The parent enters the code. The script returns a random session token, saved in that browser for 90 days. Only a hash of the token is stored in the sheet.
3. Every later request sends the token. The script only ever returns rows belonging to that email.

Rules:
- Five wrong codes means a 15-minute lockout.
- "Sign out" deletes the session row.

## Sheet tabs
- **Parents**: email (the key), name, phone, emergency contact name and phone, created date.
- **Sailors**: sailor_id, parent email, name, date of birth, rig (4/6/7), sail number, club, image consent, medical done for season (Y/N plus date).
- **Camps** (the source of truth for anything bookable): id (matches `events.js`, e.g. `winterChristmas`), title, dates, venue, price, booking deadline, late fee (£20), capacity, open (Y/N), reference code (e.g. `XMAS26`). The price always comes from here, never from the browser.
- **Bookings**: booking_id, created, sailor_id, camp id, amount due, payment reference, **status** dropdown, admin notes. This is the tab James works from.
- **Settings**: bank account name, sort code, account number, payment terms text, medical form URL. Sent only to signed-in users.
- **Sessions** and **Codes**: hidden tabs used by sign-in.
- **Medical form responses**: stay in James's own Google Form. A submit trigger on the form (setting `medical_form_id`) records only the date and photo consent per sailor.

## Booking statuses
`Awaiting payment` → `Paid` (James sets it in the sheet) → `Confirmed` (after the personal follow-up). Other states: `Cancelled` and `Waitlist`.

The **My bookings** page shows each booking with its status, amount, reference and bank details. It also shows a "Medical & image form: outstanding / done" line per sailor.

## Payment reference
UK bank references allow 18 characters. Use camp code + surname: `BTS XMAS26 SMITH`. If siblings attend the same camp, add an initial (`SMITHJ`). The script generates the reference.

## The automatic email (sent the moment a booking is made)
1. Thanks. It names the sailor, camp, dates and venue.
2. **Amount due, bank details, the reference and the date payment is due.**
3. **If this sailor's medical and image form isn't done for this season:** a button to the Google Form, prefilled with the sailor's full name (the form has no email question).
4. "We'll be in touch personally once payment arrives." It links to My bookings.
5. A beta line: "Online booking is new. If anything looks wrong, just reply."

James and Kai get a short copy of every booking.

## Medical and image form
- Keep the existing Google Form, but link its responses into the booking spreadsheet.
- A form-submit trigger matches the response to the sailor by full name (one unique match), sets the date and `image_consent`, and emails the parent a receipt. The reminder then stops appearing in emails and on My bookings, and the account page re-checks when the parent returns from the form tab.
- **James (11 Nov):** keep his form's format. The site must not ask its own consent/medical tick boxes that duplicate the form.
- Health data stays in Google, where it already lives.

## Beta labelling
- A banner on the sign-in, booking and My bookings pages: _"Online booking is in beta. Your place is confirmed when we contact you personally after payment. Prefer the old way? Use the booking form."_ The banner links to the Google Form.
- A "Beta" tag next to the Book buttons, and a beta line in every email.
- The Google Form keeps running in parallel until a full camp has gone through the new system cleanly.

## Things to know about this approach
- **Speed:** each Apps Script call takes about 1–2 seconds, so the pages show a spinner. That's fine for booking, but too slow for anything instant.
- **Scale:** a sheet comfortably handles thousands of bookings. A lock stops two people taking the last place at the same moment.
- **Ownership:** everything sits in James's Google account and Cloudflare. To back up, download the sheet.
- **Privacy page:** it needs a short update saying data about parents and sailors is kept in Google Workspace/Drive and used only for bookings, with a retention period.

## Build phases
1. **Sheet + script.** Create the spreadsheet tabs with validation and dropdowns, seed Camps from `events.js`, and deploy the Apps Script web app.
2. **Sign-in.** `/beta/account/`: email → code → session. Profile and add/edit sailors.
3. **Book.** Book buttons (calendar sheet and camp cards) open `/beta/book/?camp=<id>`: pick a sailor, see the price (including the late fee after the deadline), confirm. The page shows bank details and the reference straight away.
4. **Email** on booking, plus a copy to James and Kai.
5. **My bookings** page.
6. **Medical form link-up** (linked responses and the submit trigger).
7. **Privacy update + soft launch** with a few families, alongside the Google Form.

Target: the New Year or February camps. The Christmas deadline (28 Nov) is too soon.

## Decisions (answered 2026-11-11)
1. **Feedback:** parents depend on James and Kai replying on WhatsApp to get payment details, and they can't see whether they're booked or who else is going. The system must therefore give **instant payment details**, a **My bookings** page, and **places left plus a "Who's going" list** for each camp.
2. The account holder is **the parent**, with **multiple sailors** per account.
3. The beyondtheshift.co.uk addresses can **only receive**, not send. Emails therefore go out from the Google account that owns the sheet, with sender name "Beyond the Shift". Reply-To is set to a beyondtheshift.co.uk address, so replies land in the normal inbox. If sending from the domain becomes possible later, only the Settings tab changes.
4. **Payment rule (confirmed 11 Nov):** payment is due 7 days after booking or 7 days before the camp, whichever is sooner. Booking within the last 7 days before the camp adds a £20 fee, with payment due straight away. Worked out per booking by the script (`terms_`).
5. Sending address and copy recipients: **not decided yet**. They are blank in the Settings tab until James fills them in.
6. Kai gets **edit access to the sheet**: share it with his Google account.
7. Reference format **`BTS XMAS26 SMITH`**: approved.

## "Who's going" (from the feedback)
- The public camp list shows **places left** only.
- Signed-in parents also see a list of the other sailors booked, showing **first name, surname initial and club** (e.g. "Sam T., Poole YC"). It only includes sailors whose parent ticked "Show my sailor on camp lists". The box is unticked by default because these are children's names.

## Open questions
- Camp capacities. A blank capacity means unlimited.
- Which Google account owns the sheet? A free Gmail account can send 100 emails a day, which is plenty.
