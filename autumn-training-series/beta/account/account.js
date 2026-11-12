/* /beta/account/: code sign-in, My bookings, sailors and contact details. Tabs use the URL hash
   (#bookings, #sailors, #details). ?next=<path> returns to the booking page after sign-in. */
(function () {
  "use strict";
  const B = window.BTSBook, U = window.BTSUI;
  const { esc, money, range, day, dueText, parse, today, placesText } = B.fmt;
  const $ = (s, r = document) => r.querySelector(s);
  const view = $("[data-view]");
  const signOutBtn = $("[data-signout]");
  const whoAmI = $("[data-who-am-i]");
  $("[data-banner]").appendChild(U.banner());

  let me = null;
  const TABS = [["bookings", "Bookings"], ["sailors", "Sailors"], ["details", "Your details"]];
  const tab = () => { const h = location.hash.slice(1); return TABS.some(t => t[0] === h) ? h : "bookings"; };

  /* Only follow ?next= to our own booking page. */
  function nextUrl() {
    const n = new URLSearchParams(location.search).get("next") || "";
    return /^\.\.\/book\/\?camp=[\w-]+$/.test(n) ? n : "";
  }

  function start() {
    if (B.mode === "off") { U.offNotice(view); return; }
    if (!B.signedIn) {
      signOutBtn.hidden = true;
      whoAmI.textContent = "Sign in to see your bookings and payment details.";
      U.signIn(view, { title: "Sign in", onDone: () => { const n = nextUrl(); n ? location.replace(n) : load(); } });
      return;
    }
    load();
  }

  async function load() {
    view.innerHTML = `<p class="bk-muted bk-loading" data-loader="start">Loading your bookings…</p>`;
    try {
      me = await B.call("me");
    } catch (e) {
      if (e.code === "AUTH") { start(); return; }
      view.innerHTML = `<div class="bk-card"><p class="bk-error" role="alert">${U.errorHtml(e)}</p><button class="btn btn-line" type="button" data-retry>Try again</button></div>`;
      $("[data-retry]", view).addEventListener("click", load);
      return;
    }
    signOutBtn.hidden = false;
    whoAmI.innerHTML = `Signed in as <b>${esc(me.profile.email)}</b>`;
    render();
  }

  function render() {
    const t = tab();
    const needsProfile = !me.profile.name || !me.profile.phone || !me.profile.emergency_phone;
    view.innerHTML = `
      <nav class="bk-tabs" aria-label="Account sections">${TABS.map(([k, l]) => `<a href="#${k}" aria-current="${k === t}">${l}${k === "sailors" ? ` (${me.sailors.length})` : ""}</a>`).join("")}</nav>
      ${needsProfile && t !== "details" ? `<p class="bk-warn">Please <a href="#details">add your contact and emergency details</a> before booking.</p>` : ""}
      <div data-panel></div>`;
    const panel = $("[data-panel]", view);
    ({ bookings, sailors, details })[t](panel);
  }
  /* The medical form opens in a new tab. When the parent comes back, re-check so "done" shows without a reload. */
  let formOpened = false, checking = false;
  view.addEventListener("click", e => {
    if (e.target.closest(".bk-med-link")) formOpened = true;
    const again = e.target.closest("[data-med-recheck]");
    if (again) { e.preventDefault(); recheck(true); }
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && formOpened) recheck(false); });
  async function recheck(manual) {
    if (checking || !me || !me.sailors.some(s => !s.medical_done)) return;
    checking = true;
    const before = me.sailors.filter(s => s.medical_done).length;
    try { me = await B.call("me"); } catch (e) { checking = false; return; }
    checking = false;
    const after = me.sailors.filter(s => s.medical_done).length;
    render();
    const msg = document.createElement("p");
    msg.setAttribute("role", "status");
    if (after > before) {
      formOpened = me.sailors.some(s => !s.medical_done);
      msg.className = "bk-error is-ok";
      msg.textContent = "Medical & image release form received. Thank you, we've emailed you a receipt.";
    } else {
      msg.className = "bk-warn";
      msg.innerHTML = `Sent the form? It can take a minute to reach us. <a href="#" data-med-recheck>Check again</a>`;
    }
    $("[data-panel]").prepend(msg);
    if (manual || after > before) msg.scrollIntoView({ block: "nearest" });
  }
  window.addEventListener("hashchange", () => { if (me) { render(); window.scrollTo({ top: 0 }); } });

  /* ---------- Bookings ---------- */
  function bookings(panel) {
    const now = today();
    const upcoming = me.bookings.filter(b => b.status !== "Cancelled" && (!b.end || parse(b.end) >= now))
      .sort((a, b) => (a.start || "9").localeCompare(b.start || "9"));
    const past = me.bookings.filter(b => !upcoming.includes(b));
    const sailorsById = Object.fromEntries(me.sailors.map(s => [s.sailor_id, s]));

    panel.innerHTML = `
      <div class="bk-wrap" style="width:100%">
        ${upcoming.length ? upcoming.map(b => card(b, sailorsById[b.sailor_id])).join("") : `
          <div class="bk-card bk-empty"><h2 class="bk-h">No upcoming bookings</h2>
          <p class="bk-muted">Pick a camp from the calendar or the list below.</p></div>`}
        <section class="bk-card" data-open-camps><h2 class="bk-h3">Open for booking</h2><p class="bk-muted bk-loading" data-loader="wave">Loading camps…</p></section>
        ${past.length ? `<details class="bk-card bk-details"><summary>Past and cancelled (${past.length})</summary><div class="bk-wrap" style="width:100%">${past.map(b => card(b, sailorsById[b.sailor_id], true)).join("")}</div></details>` : ""}
      </div>`;

    panel.querySelectorAll("details[data-who]").forEach(d => d.addEventListener("toggle", () => {
      if (d.open && !d.dataset.loaded) { d.dataset.loaded = "1"; U.who($("[data-who-list]", d), d.dataset.who); }
    }, { once: false }));

    openCamps($("[data-open-camps]", panel));
  }

  function card(b, sailor, past) {
    const now = today();
    const awaiting = b.status === "Awaiting payment";
    const overdue = awaiting && b.payment_due && parse(b.payment_due) < now;
    const med = sailor && !past && b.status !== "Cancelled"
      ? sailor.medical_done
        ? `<p class="bk-med is-done">✓ Medical &amp; image release form done for ${esc(sailor.first_name)} this season</p>`
        : `<p class="bk-med is-due">⚠ Medical &amp; image release form needed for ${esc(sailor.first_name)} <a class="bk-med-link" href="${esc(sailor.medical_link || me.medical_form_url)}" target="_blank" rel="noopener">Complete the form ↗</a></p>`
      : "";
    return `<article class="bk-card bk-booking">
      <div class="bk-booking-top">
        <div><h2 class="bk-h3">${esc(b.camp_title)}</h2><p class="bk-muted">${esc(b.sailor_name)}</p></div>
        ${U.pill(b.status)}
      </div>
      <ul class="bk-facts">
        ${b.start ? `<li><b>${esc(range(b.start, b.end))}</b></li>` : ""}
        ${b.venue ? `<li>${esc(b.venue)}</li>` : ""}
        <li>${money(b.amount)}${b.late_fee_applied ? " incl. late fee" : ""}</li>
        <li>Ref <b>${esc(b.reference)}</b></li>
      </ul>
      ${b.status === "Waitlist" ? `<p class="bk-hint">The camp is full, so you're on the waitlist. Please don't pay yet: we'll be in touch if a place comes up.</p>` : ""}
      ${overdue ? `<p class="bk-late">Payment was due ${esc(day(b.payment_due))}. Please pay as soon as you can, or reply to your booking email if something's wrong.</p>` : ""}
      ${awaiting ? `<details class="bk-details" ${overdue || parse(b.payment_due || "2999-01-01") - now < 8 * 864e5 ? "open" : ""}><summary>Payment details · due ${esc(dueText(b.payment_due))}</summary>
          <div>${U.bankBlock(me.bank, [{ name: b.sailor_name, amount: b.amount, reference: b.reference }], b.payment_due, me.payment_note)}</div></details>` : ""}
      ${b.status === "Paid" ? `<p class="bk-hint">Payment received. James or Kai will be in touch to confirm your place.</p>` : ""}
      ${med}
      ${!past && b.status !== "Cancelled" ? `<details class="bk-details" data-who="${esc(b.camp_id)}"><summary>Who's going</summary><div data-who-list></div></details>` : ""}
    </article>`;
  }

  async function openCamps(host) {
    try {
      const camps = await B.camps();
      host.innerHTML = `<h2 class="bk-h3">Open for booking</h2>` + (camps.length
        ? `<div class="bk-pick">${camps.map(c => `<a class="bk-pick-item" href="../book/?camp=${encodeURIComponent(c.camp_id)}" style="text-decoration:none">
            <span style="flex:1"><span class="bk-pick-name">${esc(c.title)}</span><span class="bk-pick-sub">${esc(range(c.start, c.end))} · ${esc(c.venue)}${placesText(c) ? ` · ${esc(placesText(c))}` : ""}</span></span>
            <span class="arrow" aria-hidden="true" style="font-weight:700;color:var(--blue)">${money(c.price_now)}</span></a>`).join("")}</div>`
        : `<p class="bk-muted">No camps are open for online booking right now. See the <a href="../calendar/">calendar</a> for dates.</p>`);
    } catch (e) {
      host.innerHTML = `<h2 class="bk-h3">Open for booking</h2><p class="bk-muted">${esc(e.message)}</p>`;
    }
  }

  /* ---------- Sailors ---------- */
  function sailors(panel) {
    panel.innerHTML = `<div class="bk-wrap" style="width:100%">
      ${me.sailors.map(s => `<article class="bk-card">
        <div class="bk-sailor">
          <div><h2 class="bk-h3">${esc(s.first_name)} ${esc(s.surname)}</h2>
            <p class="bk-muted">ILCA ${esc(s.rig)}${s.sail_number ? ` · ${esc(s.sail_number)}` : ""}${s.club ? ` · ${esc(s.club)}` : ""}</p></div>
          <div class="bk-actions"><button class="btn btn-line" type="button" data-edit="${esc(s.sailor_id)}">Edit</button></div>
        </div>
        ${s.medical_done
          ? `<p class="bk-med is-done">✓ Medical &amp; image release form done this season</p>`
          : `<p class="bk-med is-due">⚠ Medical &amp; image release form needed <a class="bk-med-link" href="${esc(s.medical_link || me.medical_form_url)}" target="_blank" rel="noopener">Complete the form ↗</a></p>`}
        <p class="bk-hint">Photo &amp; video consent: ${s.medical_done ? (s.image_consent ? "given" : "not given") : "on the form"} · Who's going lists: ${s.show_on_list ? "shown" : "hidden"}</p>
        <div data-form-for="${esc(s.sailor_id)}"></div>
      </article>`).join("")}
      <section class="bk-card" data-add>
        ${me.sailors.length ? `<button class="btn btn-accent" type="button" data-add-btn>+ Add a sailor</button>` : `<h2 class="bk-h">Add your sailor</h2><div data-add-form></div>`}
      </section>
    </div>`;

    const add = $("[data-add]", panel);
    const showAdd = () => {
      add.innerHTML = `<h2 class="bk-h">Add a sailor</h2><div data-add-form></div>`;
      U.sailorForm($("[data-add-form]", add), null, { onSaved: saved, onCancel: me.sailors.length ? render : null });
    };
    if (me.sailors.length) $("[data-add-btn]", add).addEventListener("click", showAdd);
    else showAdd();

    panel.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => {
      const s = me.sailors.find(x => x.sailor_id === btn.dataset.edit);
      const host = $(`[data-form-for="${CSS.escape(s.sailor_id)}"]`, panel);
      btn.hidden = true;
      U.sailorForm(host, s, { onSaved: saved, onCancel: render });
      host.insertAdjacentHTML("beforeend", `<p class="bk-row-links" style="margin-top:12px"><button type="button" class="bk-link" data-remove style="color:var(--t-dl-tx)">Remove this sailor</button></p>`);
      $("[data-remove]", host).addEventListener("click", ev => {
        if (!confirm(`Remove ${s.first_name} ${s.surname} from your account?`)) return;
        U.quiet(U.busy(ev.currentTarget, $("form", host), async () => { me = await B.call("deleteSailor", { sailor_id: s.sailor_id }); render(); }));
      });
    }));
  }
  function saved(next) { me = next; render(); }

  /* ---------- Details ---------- */
  function details(panel) {
    panel.innerHTML = `<section class="bk-card"><h2 class="bk-h">Your details</h2>
      <p class="bk-muted">Email: <b>${esc(me.profile.email)}</b></p><div data-profile></div></section>`;
    U.profileForm($("[data-profile]", panel), me.profile, {
      onSaved: next => {
        me = next;
        const n = nextUrl();
        if (n) { location.href = n; return; }
        render();
        const ok = document.createElement("p");
        ok.className = "bk-error is-ok"; ok.textContent = "Details saved.";
        $("[data-panel]").prepend(ok);
      },
    });
  }

  signOutBtn.addEventListener("click", async () => {
    signOutBtn.disabled = true;
    await B.signOut();
    me = null;
    location.hash = "";
    signOutBtn.disabled = false;
    start();
  });

  start();
})();
