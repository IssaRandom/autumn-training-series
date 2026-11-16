# BTS bookings: Google Sheet setup (about 15 minutes)

**Which spreadsheet:** `BOOKINGS_SHEET_ID` at the top of `Code.gs` points at Kai's **Autumn Training Series** sheet. `setup` adds its own tabs there (*Online bookings, Online camps, Parents, Sailors, Booking settings*, plus two hidden sign-in tabs) and never changes or deletes Kai's existing tabs. James's Google account must have **edit** access to that sheet. To use a different sheet, change the ID (or blank it to create a new one).

All the data lives in **one private Google Sheet**. The script works either opened from that sheet (Extensions ▸ Apps Script) or as a standalone project at script.google.com: there, `setup` creates a sheet called **BTS Bookings** in your Drive and prints its link in the Execution log. `Code.gs` is the only thing that reads or writes it. Emails are sent from the Google account that owns the sheet.

## 1. Create the sheet and paste in the script
1. In Google Drive: **New ▸ Google Sheets**. Name it `BTS Bookings`.
2. In the sheet: **Extensions ▸ Apps Script**. Name the project `BTS Bookings API`.
3. Delete what's in `Code.gs` and paste in the whole of `apps-script/Code.gs` from this repo. Save (Ctrl+S).
4. Project Settings (⚙): set **Time zone = (GMT+00:00) London**.

## 2. Run the setup
1. In the function dropdown at the top, pick **setup**, then press **Run**.
2. Google asks for permission ("Review permissions" ▸ your account ▸ Advanced ▸ Go to BTS Bookings API). This is your own script asking to use your own sheet and send email as you.
3. Back in the sheet you'll now have these tabs: **Bookings, Camps, Parents, Sailors, Settings**. The sign-in tabs Codes and Sessions are there too, but hidden.

## 3. Fill in Settings (the `Settings` tab)
| key | what to put |
|---|---|
| `bank_account_name`, `bank_sort_code`, `bank_account_number` | Your bank details. They are only shown to signed-in parents and in booking emails. |
| `reply_to` | One of the beyondtheshift.co.uk addresses, so replies come to you. |
| `notify_emails` | Who gets a copy of each booking, e.g. your Gmail and Kai's, separated by commas. |
| `medical_form_id` | The medical & image release form's **editor** URL (`…/forms/d/<id>/edit`, not the `/d/e/…/viewform` link). See step 4. |
| `medical_q_sailor` | The exact question title for the sailor's name. Already set to `Sailors full name`. |
| `medical_prefill_url` | Leave blank: the site already prefills the sailor's full name (entry.1504912846). |

Then run **testEmail** from the editor to check the sender name and Reply-To look right.

## 4. Connect the medical & image release form
The form stays exactly as it is (your questions, your format). The script only records **when** a sailor's form came in and whether the "Please confirm the following" box (which includes photo & video consent) was ticked.
1. Open the form in the editor and copy its URL (`https://docs.google.com/forms/d/<id>/edit`). Paste it into `medical_form_id` in **Booking settings**. The script owner needs edit access to the form.
2. In Apps Script, run **setup** again. It asks for one new permission (Google Forms) and puts a submit trigger on the form itself, so you don't need to change where the form saves its responses.
3. Run **syncMedical** once. It reads every response since `season_start` and marks matching sailors as done, with a receipt email (picks up forms filled in before the trigger existed).

From then on each submission: marks the sailor done on My bookings, sets `image_consent`, emails the parent a receipt ("Medical & image release form received") and copies `notify_emails`. Matching is by the sailor's **full name**; it must match exactly one sailor. If it doesn't, `notify_emails` gets a "not matched" email and you can type the date into `Sailors ▸ medical_date` yourself.

(Alternative: link the form to this spreadsheet via Responses ▸ Link to Sheets and name the new tab `Medical responses`. The same code handles both.)

## 5. Publish the web app
1. **Deploy ▸ New deployment ▸ ⚙ Select type ▸ Web app** (not *Library* or *API executable*).
2. Execute as: **Me**. Who has access: **Anyone**.
3. Copy the **Web app URL** (it ends in `/exec`) and send it to Claude. The website pages need it.
4. **After any later change to `Code.gs`:** Deploy ▸ Manage deployments ▸ ✏ ▸ Version: *New version*. This keeps the same URL.

"Anyone" only means the website can reach the script. The sheet itself stays private, and the script only ever gives a signed-in parent their own rows.

## 6. Share with Kai
Use the **Share** button on the sheet and give Kai **Editor** access. Don't share it with anyone else.

## Day to day
- **Payment due dates are automatic:** 7 days after booking, or 7 days before the camp if sooner. Booking in the last 7 days adds the camp's `late_fee` (£20). If your Camps tab still has a `payment_due` column from an earlier version, delete it.
- **Camps tab:** set `open` to **Y** to take online bookings. Leave `capacity` blank for unlimited places. You can change any date or price per camp.
- **Bookings tab:** when money arrives, set `status` to **Paid**. After you've been in touch personally, set it to **Confirmed**. You can edit `amount` by hand, for example to add a late fee.
- If a camp is full, new bookings go in as **Waitlist** and those parents are told not to pay yet.
- Sending limit: a free Gmail account can send 100 emails a day. Each booking uses 2 (the parent's email and your copy), and each sign-in code uses 1.
