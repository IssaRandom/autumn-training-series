# James: what I need from you

_15 Nov 2026. Do Part A first: online booking can't go live without it. Part B can be done in any order._

---

## Where you are now (checked in the sheet, 15 Nov evening)
- ✅ New Code.gs pasted and `setup` run (the new columns are in *Online camps*). ✅ `medical_form_id` is the right editor link. ✅ The form is owned by the same Google account you edit the sheet with.
- ✅ I filled in `signups_offline` (5, 1, 1, 3, 3, 3), so places and mystery sailors now count the form/WhatsApp bookings.
- ❌ No sailor has a `medical_date` yet, so no form has been matched. Do **M1–M4** below.
- ❌ Still blank: bank details, `reply_to`. Christmas is still `open = N`; NY1 is still `open = Y` from testing.

### Medical form: M1–M4 (10 min)
1. **M1. Paste Code.gs again.** I changed it tonight: mystery sailors now include `signups_offline`, photo consent is read from your "Please confirm the following" boxes, and there's a new `checkMedical` checker. Then Deploy ▸ Manage deployments ▸ ✏ ▸ New version.
2. **M2. Run `checkMedical`** (function dropdown ▸ Run). It changes nothing. It prints whether the form trigger exists, your form's question titles, and for your latest form responses which name it read and which sailor that matched. **Copy the Execution log and send it to me.** That shows exactly why it didn't tick.
3. **M3. Run `syncMedical`.** It ticks every sailor whose form has already come in, and emails a receipt.
4. **M4. Test it on the real system, not test mode.** On your computer the booking pages run in *test mode* (fake data, a yellow "Test mode" box at the top). Medical forms can never tick there. Open `/beta/account/?live=1`, sign in with your real email, then fill in the form. **The name you type must exactly match a sailor on your account, e.g. "James Foster".** Come back to the tab and it should say "received".

Why it didn't work for you: the 27–30 "waitlist" proves you were in test mode (I had marked that fake camp waiting-list-only to test the button). In test mode nothing reaches the sheet. In the real sheet nothing has matched yet either; `checkMedical` will tell us why.

---

## Part A: finish the booking system (~30 min)

Target: **Christmas Camp is the first camp bookable online.** The booking deadline is 28 Nov.

Everything happens in two places:
- **The sheet:** Kai's *Autumn Training Series* spreadsheet, tabs *Booking settings*, *Online camps* and *Online bookings*.
- **The script:** the Apps Script project **BTS Bookings** (script.google.com, signed in as the Google account that owns it).

### A1. Fill in Booking settings (sheet, 3 min)
| key | what to type |
|---|---|
| `bank_account_name` | Name on the account |
| `bank_sort_code` | e.g. `12-34-56` |
| `bank_account_number` | 8 digits |
| `reply_to` | The beyondtheshift.co.uk address you want replies to go to |

Type the bank details yourself (I'm not allowed to enter them). The column is plain text, so leading zeros are kept.

### A2. Get the medical form's editor link (2 min)
1. Open your **Medical & image release** Google Form in the editor (the pencil view, not the one parents fill in).
2. Copy the address bar. It looks like `https://docs.google.com/forms/d/LONG-ID/edit`. **It must have `/edit` and no `/e/`.** The link already in `medical_form_url` is the parents' link (`/d/e/…/viewform`) and won't work for this.
3. Paste it into the **`medical_form_id`** row in *Booking settings*.
4. While the form is open, check two question titles are exactly:
   - **`Sailors full name`** (that's how a form is matched to a sailor; if you rename it, change `medical_q_sailor` to match)
   - one starting **`Please confirm the following`** (the tick that includes photo/video consent).
5. The Google account that owns the Apps Script needs **edit access to the form**. If the form belongs to a different account, add it as an editor (form ⋮ ▸ Add collaborators).

### A3. Paste the new script (3 min)
1. Open `apps-script/Code.gs` from this repo (I updated it today: places now work like the old site, see A6) and copy **all** of it.
2. In the BTS Bookings Apps Script editor, open `Code.gs`, select all, delete, paste, **Ctrl+S**.

### A4. Run three functions (5 min)
Use the function dropdown at the top of the editor ▸ pick the name ▸ **Run**:
1. **`setup`**. Google will ask for a new permission (Google Forms): Review permissions ▸ your account ▸ Advanced ▸ Go to BTS Bookings ▸ Allow. It adds three new columns to *Online camps* (`signups_offline`, `second_group`, `waitlist`) and hooks onto the medical form.
2. **`syncMedical`**. Marks every sailor who has already filled in the form since 1 Sep as done, and emails each parent a receipt. Your own test entry should flip to done.
3. **`testNotify`**. You and Kai should get a test alert email. Check it arrived.

### A5. Publish the new version (1 min)
**Deploy ▸ Manage deployments ▸ ✏ (pencil) ▸ Version: New version ▸ Deploy.** The URL stays the same, so nothing on the site changes.

### A6. Set up the camps (sheet, *Online camps*, 5 min)
Places now follow the **old site's rule**: 6 places at the start, counting down as sailors book, then holding at "2 places left" once 4 are in (the group runs). Sailors who booked through the Google Form or WhatsApp count too. Type them into `signups_offline`. These are the numbers on the live site now:

| camp_id | signups_offline | open |
|---|---|---|
| winterChristmas | 5 | **Y** (first live camp) |
| winterNY1 | 1 | N for now (Y when you're ready) |
| winterNY2 | 1 | N for now |
| winter9 | 3 | N |
| winterFebruary | 3 | N |
| winter10 | 3 | N |

- `second_group` = **Y** shows "Second group forming". `waitlist` = **Y** shows "Waiting list only", and new bookings go in as waitlist (parents are told not to pay).
- The old `capacity` column is now ignored. You can delete it or leave it.
- **Every time someone books through the Google Form or WhatsApp, add 1 to `signups_offline`**, or the count goes wrong.

### A7. Clean up the tests (sheet, 1 min)
- In *Online bookings*, delete the 3 test rows (James Foster, "Kai Wolgramator", "adsd asd", all on winterNY1). Or say "go ahead" and I'll do it.
- Set winterNY1 `open` back to **N** (it's still Y from testing).

### A8. Test it once for real (10 min)
Once the homepage is done and `/beta` is published, I'll send you a link. Then:
1. Sign in on your phone and book one sailor on Christmas Camp. Check the confirmation email shows the **bank details and reference**.
2. Tap the medical form link in that email and submit it. Within a minute the site should show "received", and you should get a **receipt email**.
3. Cancel the test booking in the sheet (status ▸ Cancelled).

If anything fails, screenshot the Apps Script **Executions** page (left sidebar) and send it to me.

---

## Part B: stuff I need from you

### B1. Photos (biggest gap)
I've used 2 of the 19 photos from your zip so far (BTS training + Finale on New to ILCAs). The homepage training-series section I'm building now will use more of them. Still needed:

| Where | What's there now | What I need |
|---|---|---|
| Homepage hero | Photo, no video | Slow-mo clip 60–120 fps, landscape + vertical (optional, the photo is fine) |
| Venues hub: Weymouth, HISC, Grafham, Rutland, Pwllheli, Warsash, Vilamoura, Largs | Stock/picsum stand-ins | One good photo per venue (yours, a club's with credit, or tell me to look for some) |
| Weymouth guide hero + map | Picsum | Harbour/bay photo; your sketch of where the pressure sits in the harbour |
| New to ILCAs: RYA regional training polaroid | Placeholder | A regional training photo |
| New to ILCAs: BTS Poole YC | Placeholder | A Poole training photo |
| New to ILCAs: maker logos (Devoti, etc.) | "LOGO TO COME" | Say "fetch them from maker sites" or send them |
| New to ILCAs: Racing band | Photo with unknown credit | Who took it, or OK to swap |
| How-to offshoots (later) | none | Boat on trailer, strap types, lowering the mast |

The easiest way: drop them in a new zip or folder and tell me where. Phone photos are fine.

### B2. Copy only you can write
- 4 loader lines (calendar, account, Weymouth, booking). The drafts are on the site and fine to keep if you like them.
- Hero headline: you've asked for the old wording back, so that's done on the homepage.

### B3. Weymouth wind notes (a chat, not voice notes)
I'll ask you questions in a session ("in a SW in the harbour, which side pays and why?") and type up your answers. About 20 minutes per area (harbour, bay). Say when.

### B4. Decisions
- National Open entry close: is "the Sunday before the event" final?
- Real dates for Summer Block 1, Pre-Nats at Largs and Summer Block 2, or keep them as placeholders?
- Kai: his next Website-tab topic after New to ILCAs.
- Is `/beta` OK to publish on the live server, hidden from Google and reached by link only, once the homepage is signed off? (Needed for the booking test in A8.)

### B5. Legal pages
I'm porting the old Privacy, Terms and Cancellation pages into the beta style **word for word**. One thing needs your OK: the privacy page should get a short line saying booking data (parent and sailor details) is kept in your Google Sheet and used only for bookings. I'll mark that line in yellow for you to approve.
