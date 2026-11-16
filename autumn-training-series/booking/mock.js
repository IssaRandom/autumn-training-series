/* DEV ONLY: a fake booking backend in localStorage, so /beta/account/ and /beta/book/ can be tried on localhost
   without the real Google Sheet. api.js loads it on localhost unless ?live=1 is in the URL.
   Sign-in code is always 123456. Reset with: localStorage.removeItem("bts-mock-db-v2").
   Mirrors apps-script/Code.gs, including the payment rule (terms). */
(function () {
  "use strict";
  const KEY = "bts-mock-db-v2"; // v2 (15 Nov): no test camp, live places rule, offline sign-ups
  const DAY = 864e5;
  const t0 = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const plus = (d, n) => new Date(d.getTime() + n * DAY);
  const id = p => p + Math.random().toString(36).slice(2, 10).toUpperCase();

  function seed() {
    const soon = plus(t0(), 4);
    return {
      camps: [
        { camp_id: "winterChristmas", title: "Christmas Camp", start: "2026-12-19", end: "2026-12-23", venue: "Poole Yacht Club", price: 450, ref_code: "XMAS26", late_fee: 20, signups_offline: 5, open: "Y" },
        { camp_id: "winterNY1", title: "New Year’s Camp #1", start: "2026-12-27", end: "2026-12-30", venue: "Poole Yacht Club", price: 360, ref_code: "NY1-26", late_fee: 20, signups_offline: 1, open: "Y" },
        { camp_id: "winterNY2", title: "New Year’s Camp #2", start: "2026-12-31", end: "2027-01-03", venue: "Poole Yacht Club", price: 360, ref_code: "NY2-26", late_fee: 20, signups_offline: 1, open: "Y" },
        { camp_id: "winter9", title: "Winter Series #9", start: "2027-02-13", end: "2027-02-14", venue: "Poole Yacht Club", price: 180, ref_code: "WTS9-27", late_fee: 20, signups_offline: 3, open: "N" },
      ],
      parents: {},
      sailors: [
        { sailor_id: "SX1", parent_email: "other@example.com", first_name: "Sam", surname: "Taylor", rig: "6", club: "Poole YC", show_on_list: true },
        { sailor_id: "SX2", parent_email: "other2@example.com", first_name: "Ella", surname: "Morgan", rig: "4", club: "WPNSA", show_on_list: true },
        { sailor_id: "SX3", parent_email: "other3@example.com", first_name: "Jack", surname: "Reid", rig: "6", club: "Hayling Island SC", show_on_list: false },
      ],
      bookings: [
        { booking_id: "BX1", camp_id: "winterChristmas", sailor_id: "SX1", status: "Paid" },
        { booking_id: "BX2", camp_id: "winterChristmas", sailor_id: "SX2", status: "Awaiting payment" },
        { booking_id: "BX3", camp_id: "winterChristmas", sailor_id: "SX3", status: "Confirmed" },
        { booking_id: "BX4", camp_id: "winterNY1", sailor_id: "SX1", status: "Paid" },
        { booking_id: "BX5", camp_id: "winterNY1", sailor_id: "SX2", status: "Paid" },
      ],
      sessions: {},
    };
  }
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (e) { return seed(); } };
  const save = db => localStorage.setItem(KEY, JSON.stringify(db));
  const fail = (m, code) => { const e = new Error(m); e.user = true; e.code = code; throw e; };
  const active = s => s !== "Cancelled";

  function terms(c, now) {
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const weekBefore = plus(parse(c.start), -7);
    const late = today > weekBefore;
    const inAWeek = plus(today, 7);
    const due = late ? today : inAWeek < weekBefore ? inAWeek : weekBefore;
    return { late, fee: late ? Number(c.late_fee || 0) : 0, due: iso(due) };
  }
  /* Same rule as Code.gs placesLeft_ (live site): 6 down to 4 sailors, then hold at 2. waitlist = full. */
  function placesLeft(db, c) {
    if (c.waitlist === "Y") return 0;
    const n = (c.signups_offline || 0) + db.bookings.filter(b => b.camp_id === c.camp_id && active(b.status) && b.status !== "Waitlist").length;
    return n < 4 ? 6 - n : 2;
  }
  function placesLabel(c, left) {
    return c.waitlist === "Y" ? "Waiting list only" : c.second_group === "Y" ? "Second group forming" : `${left} ${left === 1 ? "place" : "places"} left`;
  }
  function campOut(db, c) {
    const left = placesLeft(db, c), t = terms(c, new Date());
    return { camp_id: c.camp_id, title: c.title, start: c.start, end: c.end, venue: c.venue, price: c.price, late_fee: c.late_fee,
      late_now: t.late, price_now: c.price + t.fee, payment_due_now: t.due, places_left: left, places_label: placesLabel(c, left), full: left === 0 };
  }
  const BANK = { account_name: "Beyond the Shift (TEST)", sort_code: "00-00-00", account_number: "00000000" };
  const MED = "https://docs.google.com/forms/d/e/1FAIpQLScmOkxPW_HbmuHhicCGmGYDoMkjkoaw5JGdzGMCqr2qwxXnjg/viewform";

  function auth(db, token) {
    const email = db.sessions[token];
    if (!email) fail("Please sign in again.", "AUTH");
    return email;
  }
  function me(db, email) {
    const p = db.parents[email] || { email };
    const camps = Object.fromEntries(db.camps.map(c => [c.camp_id, c]));
    return {
      profile: { email, name: p.name || "", phone: p.phone || "", emergency_name: p.emergency_name || "", emergency_phone: p.emergency_phone || "" },
      sailors: db.sailors.filter(x => x.parent_email === email).map(x => Object.assign({}, x, { medical_link: MED })),
      bookings: db.bookings.filter(b => b.parent_email === email).slice().reverse().map(b => {
        const c = camps[b.camp_id] || {};
        return Object.assign({}, b, { start: c.start, end: c.end, venue: c.venue });
      }),
      bank: BANK,
      medical_form_url: MED,
      payment_note: "Payment is due 7 days after booking, or 7 days before the camp if that is sooner. Bookings made in the final 7 days include a £20 late booking fee.",
    };
  }
  function txt(v, max, label) { const t = String(v == null ? "" : v).trim().slice(0, max); if (label && !t) fail(`Please fill in: ${label}.`); return t; }

  const A = {
    camps: db => db.camps.filter(c => c.open === "Y" && parse(c.end) >= t0()).map(c => campOut(db, c)),
    requestCode: (db, r) => { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email || "")) fail("Please enter a valid email address."); console.info("[mock] sign-in code: 123456"); return { sent: true }; },
    verifyCode: (db, r) => {
      if (String(r.code).replace(/\D/g, "") !== "123456") fail("That code is not right. Please check the email and try again.");
      const email = r.email.trim().toLowerCase(), token = id("T") + id("");
      db.sessions[token] = email;
      if (!db.parents[email]) db.parents[email] = { email };
      return { token, email };
    },
    me: (db, r) => me(db, auth(db, r.token)),
    saveProfile: (db, r) => {
      const email = auth(db, r.token), p = r.profile || {};
      db.parents[email] = { email, name: txt(p.name, 80, "Your name"), phone: txt(p.phone, 30, "Phone number"), emergency_name: txt(p.emergency_name, 80, "Emergency contact name"), emergency_phone: txt(p.emergency_phone, 30, "Emergency contact phone") };
      return me(db, email);
    },
    saveSailor: (db, r) => {
      const email = auth(db, r.token), x = r.sailor || {};
      if (!["4", "6", "7"].includes(String(x.rig))) fail("Please choose a rig (ILCA 4, 6 or 7).");
      const data = { first_name: txt(x.first_name, 40, "Sailor's first name"), surname: txt(x.surname, 40, "Sailor's surname"), dob: txt(x.dob, 10, "Date of birth"), rig: String(x.rig), sail_number: txt(x.sail_number, 12), club: txt(x.club, 60), show_on_list: !!x.show_on_list };
      if (x.sailor_id) {
        const s = db.sailors.find(s => s.sailor_id === x.sailor_id && s.parent_email === email);
        if (!s) fail("Sailor not found.");
        Object.assign(s, data);
      } else db.sailors.push(Object.assign({ sailor_id: id("S"), parent_email: email, medical_done: false }, data));
      return me(db, email);
    },
    deleteSailor: (db, r) => {
      const email = auth(db, r.token);
      if (db.bookings.some(b => b.sailor_id === r.sailor_id && active(b.status))) fail("This sailor has bookings, so they cannot be removed. Please get in touch.");
      db.sailors = db.sailors.filter(s => !(s.sailor_id === r.sailor_id && s.parent_email === email));
      return me(db, email);
    },
    book: (db, r) => {
      const email = auth(db, r.token);
      const ids = r.sailor_ids || [];
      if (!ids.length) fail("Please choose at least one sailor.");
      const c = db.camps.find(c => c.camp_id === r.camp_id);
      if (!c || c.open !== "Y") fail("Sorry, this camp is not open for online booking.");
      if (parse(c.start) <= t0()) fail("Sorry, this camp has already started.");
      const p = db.parents[email];
      if (!p || !p.name || !p.phone || !p.emergency_phone) fail("Please complete your contact and emergency details first.");
      // Validate everything first, as Code.gs does.
      const chosen = [...new Set(ids)].map(sid => {
        const s = db.sailors.find(x => x.sailor_id === sid && x.parent_email === email);
        if (!s) fail("Sailor not found. Please refresh the page and try again.");
        const name = `${s.first_name} ${s.surname}`;
        if (db.bookings.some(b => b.camp_id === c.camp_id && b.sailor_id === sid && active(b.status))) fail(`${name} is already booked on this camp.`);
        return { sid, s, name };
      });
      // Siblings on one camp get an initial, as reference_() in Code.gs.
      const ref = (c, s) => {
        const sur = s.surname.toUpperCase().replace(/[^A-Z]/g, ""), ini = s.first_name.toUpperCase().replace(/[^A-Z]/g, "").charAt(0);
        const base = `BTS ${String(c.ref_code || c.camp_id).toUpperCase()} `.slice(0, 14), room = 18 - base.length;
        const fit = suf => (base + sur.slice(0, Math.max(0, room - suf.length)) + suf).trim();
        const taken = new Set(db.bookings.filter(b => b.camp_id === c.camp_id).map(b => b.reference));
        return [fit(""), fit(ini), fit(ini + id("").slice(-2))].find(r => !taken.has(r)) || (base + id("")).slice(0, 18);
      };
      const created = chosen.map(({ sid, s, name }) => {
        const left = placesLeft(db, c), t = terms(c, new Date());
        const b = { booking_id: id("B"), created: iso(new Date()), parent_email: email, sailor_id: sid, sailor_name: name, camp_id: c.camp_id, camp_title: c.title,
          amount: c.price + t.fee, late_fee_applied: t.fee > 0, reference: ref(c, s),
          payment_due: t.due, status: left > 0 ? "Awaiting payment" : "Waitlist" };
        db.bookings.push(b);
        return b;
      });
      return { bookings: created, bank: BANK, me: me(db, email) };
    },
    whoIsGoing: (db, r) => {
      auth(db, r.token);
      const c = db.camps.find(c => c.camp_id === r.camp_id);
      if (!c) fail("Camp not found.");
      const list = db.bookings.filter(b => b.camp_id === c.camp_id && active(b.status) && b.status !== "Waitlist");
      const sailors = Object.fromEntries(db.sailors.map(s => [s.sailor_id, s]));
      return { camp: campOut(db, c), booked: list.length + (c.signups_offline || 0), listed: list.map(b => sailors[b.sailor_id]).filter(s => s && s.show_on_list).map(s => ({ name: `${s.first_name} ${s.surname[0]}.`, club: s.club, rig: s.rig })) };
    },
    signOut: (db, r) => { delete db.sessions[r.token]; return { signedOut: true }; },
  };

  window.BTS_MOCK = function (req) {
    return new Promise(res => setTimeout(() => {
      const db = load();
      try {
        const fn = A[req.action];
        if (!fn) fail("Unknown request.");
        const data = JSON.parse(JSON.stringify(fn(db, req)));
        save(db);
        res({ ok: true, data });
      } catch (e) {
        if (!e.user) console.error(e);
        res({ ok: false, code: e.code || "", error: e.user ? e.message : "Something went wrong." });
      }
    }, 450));
  };
  window.BTS_MOCK.terms = terms;
})();
