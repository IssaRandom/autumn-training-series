/* Shared booking UI pieces for /beta/account/ and /beta/book/: beta banner, code sign-in, profile form,
   sailor form, bank details, status pills and the "Who's going" list. Needs api.js. Exposes window.BTSUI. */
(function () {
  "use strict";
  const B = window.BTSBook;
  const { esc, money, day, dueText } = B.fmt;
  const $ = (s, r = document) => r.querySelector(s);

  function banner() {
    const el = document.createElement("aside");
    el.className = "bk-banner";
    el.setAttribute("aria-label", "Beta notice");
    el.innerHTML = `<span class="bk-beta">Beta</span>
      <p>Online booking is in beta. Your place is confirmed when we contact you personally after payment.
      Prefer the old way? <a href="${esc(B.cfg.fallbackForm)}" target="_blank" rel="noopener">Use the booking form</a>.</p>`;
    if (B.mode === "mock") el.insertAdjacentHTML("beforeend", `<p class="bk-mock"><b>Test mode (fake data on this computer).</b> Nothing is saved to the real sheet, no emails are sent, and medical forms won't tick here. Sign-in code is <b>123456</b>. <a href="?live=1">Switch to the real system</a>.</p>`);
    return el;
  }

  /* Error text, plus the booking-form link when the booking system can't be reached. */
  const errorHtml = e => esc(e.message) + (e.code === "NET" || e.code === "BUSY"
    ? ` <a href="${esc(B.cfg.fallbackForm)}" target="_blank" rel="noopener">Use the booking form instead</a>.` : "");

  /* Tie an error to the fields it is about: aria-invalid + aria-describedby on fields that fail their
     constraints, or on the only text field when the server rejected it (e.g. a wrong code). */
  let errSeq = 0;
  const fieldsOf = form => [...form.querySelectorAll("input:not([type=hidden]):not([type=checkbox]), select, textarea")];
  function clearFields(form) {
    fieldsOf(form).forEach(i => { i.removeAttribute("aria-invalid"); if (i.dataset.errBy) { i.removeAttribute("aria-describedby"); delete i.dataset.errBy; } });
  }
  function markFields(form, err) {
    if (!err.id) err.id = `bk-err-${++errSeq}`;
    const all = fieldsOf(form);
    let bad = all.filter(i => i.willValidate && !i.checkValidity());
    if (!bad.length && all.length === 1) bad = all;
    bad.forEach(i => {
      i.setAttribute("aria-invalid", "true");
      if (!i.hasAttribute("aria-describedby")) { i.setAttribute("aria-describedby", err.id); i.dataset.errBy = "1"; }
    });
  }
  document.addEventListener("input", ev => {
    const i = ev.target;
    if (i.getAttribute && i.getAttribute("aria-invalid") === "true" && (!i.willValidate || i.checkValidity())) {
      // a radio group is fixed as a whole
      (i.type === "radio" && i.form ? [...i.form.querySelectorAll(`input[name="${i.name}"]`)] : [i]).forEach(x => x.removeAttribute("aria-invalid"));
    }
  });

  /* Run an async action with the button disabled and a spinner; errors go to the form's [data-error]. */
  async function busy(btn, form, fn) {
    const err = form && $("[data-error]", form);
    if (err) { err.hidden = true; err.textContent = ""; err.classList.remove("is-ok"); clearFields(form); }
    btn.disabled = true; btn.classList.add("is-busy");
    try { return await fn(); }
    catch (e) {
      if (err) { err.innerHTML = errorHtml(e); err.hidden = false; if (e.code !== "NET" && e.code !== "BUSY") markFields(form, err); err.focus?.(); }
      else alert(e.message);
      if (e.code === "AUTH") setTimeout(() => location.reload(), 1200);
      throw e;
    }
    finally { btn.disabled = false; btn.classList.remove("is-busy"); }
  }
  const quiet = p => p.catch(() => {});
  const errorBox = `<p class="bk-error" data-error role="alert" tabindex="-1" hidden></p>`;

  function signIn(host, { title = "Sign in to book", onDone } = {}) {
    let email = B.email;
    function step1() {
      host.innerHTML = `<form class="bk-card bk-form" novalidate>
        <h2 class="bk-h">${esc(title)}</h2>
        <p class="bk-muted">No password. We'll email you a 6-digit code.</p>
        <label class="bk-field"><span>Email address</span>
          <input type="email" name="email" autocomplete="email" inputmode="email" required value="${esc(email)}"></label>
        ${errorBox}
        <button class="btn btn-accent bk-submit" type="submit">Email me a code</button>
      </form>`;
      const f = $("form", host);
      f.addEventListener("submit", ev => {
        ev.preventDefault();
        email = f.email.value.trim();
        quiet(busy($("button", f), f, async () => { await B.requestCode(email); step2(); }));
      });
      if (!email) f.email.focus();
    }
    function step2() {
      host.innerHTML = `<form class="bk-card bk-form" novalidate>
        <h2 class="bk-h">Check your email</h2>
        ${B.mode === "mock"
          ? `<p class="bk-mock">Test mode: no email is sent. Use the code <b>123456</b>. To test real emails, add <b>?live=1</b> to the address.</p>`
          : `<p class="bk-muted">We sent a code to <b>${esc(email)}</b>. It works for 15 minutes. Check spam if it hasn't arrived in a minute.</p>`}
        <label class="bk-field"><span>6-digit code</span>
          <input class="bk-code" name="code" autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]*" maxlength="7" required></label>
        ${errorBox}
        <button class="btn btn-accent bk-submit" type="submit">Sign in</button>
        <p class="bk-row-links"><button type="button" class="bk-link" data-back>Use a different email</button>
          <button type="button" class="bk-link" data-resend>Send a new code</button></p>
      </form>`;
      const f = $("form", host);
      f.code.focus();
      f.code.addEventListener("input", () => { if (f.code.value.replace(/\D/g, "").length === 6) f.requestSubmit(); });
      f.addEventListener("submit", ev => {
        ev.preventDefault();
        quiet(busy($(".bk-submit", f), f, async () => { await B.verifyCode(email, f.code.value); onDone && onDone(); }));
      });
      $("[data-back]", f).addEventListener("click", step1);
      $("[data-resend]", f).addEventListener("click", ev => quiet(busy(ev.currentTarget, f, async () => {
        await B.requestCode(email);
        const e = $("[data-error]", f); e.textContent = "New code sent."; e.hidden = false; e.classList.add("is-ok");
      })));
    }
    step1();
  }

  function profileForm(host, profile, { onSaved, intro = "", submit = "Save details" } = {}) {
    const p = profile || {};
    host.innerHTML = `<form class="bk-form" novalidate>
      ${intro ? `<p class="bk-muted">${intro}</p>` : ""}
      <div class="bk-grid">
        <label class="bk-field"><span>Your name</span><input name="name" autocomplete="name" required value="${esc(p.name)}"></label>
        <label class="bk-field"><span>Mobile</span><input name="phone" type="tel" autocomplete="tel" required value="${esc(p.phone)}"></label>
        <label class="bk-field"><span>Emergency contact name</span><input name="emergency_name" required value="${esc(p.emergency_name)}"></label>
        <label class="bk-field"><span>Emergency contact phone</span><input name="emergency_phone" type="tel" required value="${esc(p.emergency_phone)}"></label>
      </div>
      <p class="bk-hint">The emergency contact should be someone who isn't at the camp with the sailor, if possible.</p>
      ${errorBox}
      <button class="btn btn-accent bk-submit" type="submit">${esc(submit)}</button>
    </form>`;
    const f = $("form", host);
    f.addEventListener("submit", ev => {
      ev.preventDefault();
      const data = Object.fromEntries(new FormData(f));
      quiet(busy($(".bk-submit", f), f, async () => { const me = await B.call("saveProfile", { profile: data }); onSaved && onSaved(me); }));
    });
  }

  function sailorForm(host, sailor, { onSaved, onCancel, submit } = {}) {
    const s = sailor || {};
    const rig = String(s.rig || "");
    host.innerHTML = `<form class="bk-form bk-sailor-form" novalidate>
      <div class="bk-grid">
        <label class="bk-field"><span>First name</span><input name="first_name" autocomplete="off" required value="${esc(s.first_name)}"></label>
        <label class="bk-field"><span>Surname</span><input name="surname" autocomplete="off" required value="${esc(s.surname)}"></label>
        <label class="bk-field"><span>Date of birth</span><input name="dob" type="date" required value="${esc(s.dob)}" max="${B.fmt.iso(new Date())}"></label>
        <fieldset class="bk-field bk-rigs"><legend>Rig</legend>
          ${["4", "6", "7"].map(r => `<label class="bk-chip"><input type="radio" name="rig" value="${r}" ${rig === r ? "checked" : ""} required><span>ILCA ${r}</span></label>`).join("")}
        </fieldset>
        <label class="bk-field"><span>Sail number <i>(optional)</i></span><input name="sail_number" inputmode="numeric" value="${esc(s.sail_number)}"></label>
        <label class="bk-field"><span>Club <i>(optional)</i></span><input name="club" value="${esc(s.club)}"></label>
      </div>
      <p class="bk-hint">Medical details and photo &amp; video consent are given on our medical &amp; image release form, once a season. We'll link you to it after booking.</p>
      <label class="bk-check"><input type="checkbox" name="show_on_list" ${s.show_on_list ? "checked" : ""}>
        <span>Show this sailor on camp “Who's going” lists (first name, surname initial and club, seen only by signed-in parents).</span></label>
      ${errorBox}
      <div class="bk-actions">
        <button class="btn btn-accent bk-submit" type="submit">${esc(submit || (s.sailor_id ? "Save sailor" : "Add sailor"))}</button>
        ${onCancel ? `<button class="btn btn-line" type="button" data-cancel>Cancel</button>` : ""}
      </div>
    </form>`;
    const f = $("form", host);
    f.addEventListener("submit", ev => {
      ev.preventDefault();
      const fd = new FormData(f);
      const data = { sailor_id: s.sailor_id || "", first_name: fd.get("first_name"), surname: fd.get("surname"), dob: fd.get("dob"), rig: fd.get("rig") || "",
        sail_number: fd.get("sail_number"), club: fd.get("club"), show_on_list: !!fd.get("show_on_list") };
      quiet(busy($(".bk-submit", f), f, async () => { const me = await B.call("saveSailor", { sailor: data }); onSaved && onSaved(me); }));
    });
    if (onCancel) $("[data-cancel]", f).addEventListener("click", onCancel);
    f.first_name.focus();
  }

  const PILL = { "Awaiting payment": "due", Paid: "paid", Confirmed: "ok", Waitlist: "wait", Cancelled: "off" };
  const pill = status => `<span class="bk-pill bk-pill-${PILL[status] || "off"}">${esc(status)}</span>`;

  /* Bank transfer box. rows = [{ name, amount, reference }] */
  function bankBlock(bank, rows, due, note) {
    const total = rows.reduce((t, r) => t + Number(r.amount), 0);
    const copy = v => `<button type="button" class="bk-copy" data-copy="${esc(v)}" aria-label="Copy ${esc(v)}">Copy</button>`;
    return `<div class="bk-bank">
      <p class="bk-bank-head">Pay <b>${money(total)}</b> by bank transfer${due ? ` <b>by ${esc(dueText(due))}</b>` : ""}</p>
      <dl class="bk-dl">
        <dt>Account name</dt><dd>${esc(bank.account_name || "–")}</dd>
        <dt>Sort code</dt><dd><span data-copy-src>${esc(bank.sort_code || "–")}</span> ${bank.sort_code ? copy(bank.sort_code) : ""}</dd>
        <dt>Account number</dt><dd><span data-copy-src>${esc(bank.account_number || "–")}</span> ${bank.account_number ? copy(bank.account_number) : ""}</dd>
        ${rows.map(r => `<dt>Reference${rows.length > 1 ? ` · ${esc(r.name.split(" ")[0])}` : ""}</dt><dd><b class="bk-ref" data-copy-src>${esc(r.reference)}</b> ${copy(r.reference)}${rows.length > 1 ? ` <span class="bk-muted">${money(r.amount)}</span>` : ""}</dd>`).join("")}
      </dl>
      ${rows.length > 1 ? `<p class="bk-hint">One payment per sailor, each with its own reference.</p>` : ""}
      ${note ? `<p class="bk-hint">${esc(note)}</p>` : ""}
    </div>`;
  }
  /* Copy buttons: visible "Copied" plus a polite live-region message for screen readers.
     If the clipboard is blocked, say so and select the value so it can be copied by hand. */
  let live = null;
  const announce = msg => {
    if (!live) {
      live = document.createElement("p");
      live.className = "sr-only"; live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite");
      document.body.appendChild(live);
    }
    live.textContent = "";
    setTimeout(() => { live.textContent = msg; }, 50);
  };
  document.addEventListener("click", ev => {
    const b = ev.target.closest("[data-copy]");
    if (!b) return;
    const v = b.dataset.copy;
    const done = () => {
      b.textContent = "Copied"; b.classList.add("is-done"); announce(`Copied ${v}`);
      clearTimeout(b._t); b._t = setTimeout(() => { b.textContent = "Copy"; b.classList.remove("is-done"); }, 2000);
    };
    const failed = () => {
      announce("Couldn't copy. The text is selected; copy it by hand.");
      const node = b.parentNode.querySelector("[data-copy-src]") || b.parentNode;
      const r = document.createRange(); r.selectNodeContents(node);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(v).then(done, failed);
    else failed();
  });

  /* Sailors who booked but didn't tick "show my name" appear as foil "Mystery sailor" cards that tease a
     famous name ("Could be Ben Ainslie…"), cycling through the list. Only the count reaches the page. */
  /* Short names only (12 characters max) so a card never changes size as the names rotate (James, 15 Nov). */
  const LEGENDS = ["Ben Ainslie", "Blair Tuke", "Tom Slingsby", "Giles Scott", "Hannah Mills", "Matt Wearn",
    "Iain Percy", "Philipp Buhl", "Emma Wilson", "Saskia Clark", "Sam Meech"].filter(n => n.length <= 12);
  const MYSTERY_CARDS = 3;
  const shuffled = () => LEGENDS.map(n => [Math.random(), n]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  function mysteryHtml(hidden, start) {
    const names = shuffled(), shown = Math.min(hidden, MYSTERY_CARDS), rest = hidden - shown;
    let html = "";
    for (let k = 0; k < shown; k++) html += `<li class="bk-who-mystery" style="--i:${start + k}" aria-label="Mystery sailor (name not shown)">
      <b aria-hidden="true">Mystery sailor <i class="bk-myst-q">?</i></b>
      <span aria-hidden="true">Could be <em class="bk-myst-name" data-k="${k}">${esc(names[k])}</em>…</span></li>`;
    if (rest > 0) html += `<li class="bk-who-more" style="--i:${start + shown}">+ ${rest} more mystery sailor${rest > 1 ? "s" : ""}</li>`;
    return html;
  }
  function rotateMystery(host) {
    const els = [...host.querySelectorAll(".bk-myst-name")];
    if (!els.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let pool = shuffled(), p = 0;
    const next = () => { if (p >= pool.length) { pool = shuffled(); p = 0; } return pool[p++]; };
    let turn = 0;
    const t = setInterval(() => {
      if (!host.isConnected || !els[0].isConnected) return clearInterval(t);
      const el = els[turn++ % els.length];   // one card at a time so they don't all flicker together
      el.classList.add("is-out");
      setTimeout(() => {
        let n = next();
        if (els.some(e => e.textContent === n)) n = next();
        el.textContent = n; el.classList.remove("is-out");
      }, 260);
    }, 1800);
  }

  /* Who's going: while it loads, show sailor cards with the names hidden under moving water; once the list
     arrives, the water wipes off each card in turn to reveal the real names. */
  async function who(host, campId) {
    const veil = n => `<i class="bk-veil" style="width:${n}%"></i>`;
    host.innerHTML = `<p class="sr-only" role="status">Loading who's going…</p>
      <ul class="bk-who is-veiled" aria-hidden="true">${[[72, 54], [58, 66], [80, 48], [64, 60]].map(([a, b], i) =>
        `<li style="--i:${i}">${veil(a)}${veil(b)}</li>`).join("")}</ul>`;
    try {
      const r = await B.call("whoIsGoing", { camp_id: campId });
      const hidden = r.booked - r.listed.length;
      host.innerHTML = r.booked
        ? `<ul class="bk-who is-revealing">${r.listed.map((x, i) => `<li style="--i:${i}"><b>${esc(x.name)}</b><span>${esc(x.club || "")}${x.rig ? ` · ILCA ${esc(x.rig)}` : ""}</span></li>`).join("")}
            ${hidden > 0 ? mysteryHtml(hidden, r.listed.length) : ""}</ul>`
        : `<p class="bk-muted bk-who-empty">No one has booked online yet. Be the first.</p>`;
      rotateMystery(host);
    } catch (e) {
      host.innerHTML = `<p class="bk-muted">${esc(e.message)}</p>`;
    }
  }

  function offNotice(host) {
    host.innerHTML = `<div class="bk-card"><h2 class="bk-h">Online booking opens soon</h2>
      <p>For now, please book with our booking form. We'll reply with payment details.</p>
      <a class="btn btn-accent arrow" href="${esc(B.cfg.fallbackForm)}" target="_blank" rel="noopener">Open the booking form</a></div>`;
  }

  /* Mobile nav toggle + footer year (these pages don't load beta.js). */
  const nav = $("[data-nav]"), toggle = $("[data-nav-toggle]");
  if (nav && toggle) toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open"))));
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  window.BTSUI = { banner, busy, quiet, errorHtml, signIn, profileForm, sailorForm, pill, bankBlock, who, offNotice, day };
})();
