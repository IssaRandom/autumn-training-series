/* /beta/book/?camp=<id>: sign in → (details, first sailor if missing) → tick sailors → confirm → bank details.
   Price, late fee and payment-due date come from the server (camps → price_now, late_now, payment_due_now),
   so the page always matches what the booking email will say. */
(function () {
  "use strict";
  const B = window.BTSBook, U = window.BTSUI;
  const { esc, money, range, day, dueText, placesText } = B.fmt;
  const $ = (s, r = document) => r.querySelector(s);
  const campId = new URLSearchParams(location.search).get("camp") || "";
  const campHost = $("[data-camp]"), step = $("[data-step]"), whoBox = $("[data-who]");
  const CFG = B.cfg;
  let camp = null, me = null;

  $("[data-banner]").appendChild(U.banner());

  function campHeader(c, fromEvents) {
    const p = placesText(c);
    const pcls = c.full ? "is-full" : c.places_left !== null && c.places_left <= 3 ? "is-low" : "";
    campHost.innerHTML = `<section class="bk-camp">
      <p class="eyebrow">BTS training camp</p>
      <h1>${esc(c.title)}</h1>
      <ul class="bk-camp-meta">
        <li><b>${esc(range(c.start, c.end))}</b></li>
        <li>${esc(c.venue)}</li>
        ${fromEvents ? "" : `<li><b>${money(c.price)}</b> per sailor</li>`}
        ${p ? `<li class="bk-places ${pcls}">${esc(p)}</li>` : ""}
      </ul>
    </section>`;
    document.title = `Book ${c.title} — Beyond the Shift (beta)`;
  }

  async function start() {
    const ev = (window.BTS_EVENTS || []).find(e => e.id === campId);
    if (B.mode === "off") {
      if (ev) campHeader({ title: ev.name, start: ev.start, end: ev.end, venue: ev.venue, places_left: null }, true);
      else campHost.innerHTML = `<h1 class="bk-title">Book a training camp</h1>`;
      U.offNotice(step);
      return;
    }
    try {
      const camps = await B.camps(true);
      camp = camps.find(c => c.camp_id === campId) || null;
    } catch (e) {
      campHost.innerHTML = `<div class="bk-card"><h1 class="bk-h">Booking</h1><p class="bk-error" role="alert">${esc(e.message)}</p>
        <div class="bk-actions"><button class="btn btn-line" type="button" data-retry>Try again</button>
        <a class="btn btn-accent" href="${esc(CFG.fallbackForm)}" target="_blank" rel="noopener">Use the booking form</a></div></div>`;
      $("[data-retry]", campHost).addEventListener("click", () => location.reload());
      return;
    }
    if (!camp) {
      if (ev) campHeader({ title: ev.name, start: ev.start, end: ev.end, venue: ev.venue, places_left: null }, true);
      else campHost.innerHTML = `<h1 class="bk-title">Book a training camp</h1>`;
      step.innerHTML = `<div class="bk-card"><h2 class="bk-h">Not open for online booking</h2>
        <p>${ev ? "This camp isn't taking online bookings yet." : "We couldn't find that camp."} You can still book with our booking form, or pick another camp.</p>
        <div class="bk-actions"><a class="btn btn-accent" href="${esc(CFG.fallbackForm)}" target="_blank" rel="noopener">Booking form</a>
        <a class="btn btn-line" href="../account/#bookings">Camps open online</a></div></div>`;
      return;
    }
    campHeader(camp);
    next();
  }

  /* Decide which step to show. */
  async function next() {
    if (!B.signedIn) {
      whoBox.hidden = true;
      U.signIn(step, { title: "Sign in to book", onDone: next });
      return;
    }
    if (!me) {
      step.innerHTML = `<p class="bk-muted bk-loading" data-loader="wave">Loading your account…</p>`;
      try { me = await B.call("me"); }
      catch (e) {
        if (e.code === "AUTH") { me = null; next(); return; }
        step.innerHTML = `<p class="bk-error" role="alert">${U.errorHtml(e)}</p>`;
        return;
      }
    }
    whoBox.hidden = false;
    U.who($("[data-who-list]", whoBox), camp.camp_id);

    const p = me.profile;
    if (!p.name || !p.phone || !p.emergency_phone) {
      step.innerHTML = `<section class="bk-card"><h2 class="bk-h">Your details</h2><div data-f></div></section>`;
      U.profileForm($("[data-f]", step), p, { intro: "Just once: how we reach you, and who to call in an emergency.", submit: "Continue", onSaved: m => { me = m; next(); } });
      return;
    }
    if (!me.sailors.length) {
      step.innerHTML = `<section class="bk-card"><h2 class="bk-h">Add your sailor</h2><p class="bk-muted">Saved to your account, so next time it's one tap.</p><div data-f></div></section>`;
      U.sailorForm($("[data-f]", step), null, { submit: "Add sailor and continue", onSaved: m => { me = m; next(); } });
      return;
    }
    pick();
  }

  function pick() {
    const booked = new Set(me.bookings.filter(b => b.camp_id === camp.camp_id && b.status !== "Cancelled").map(b => b.sailor_id));
    const free = me.sailors.filter(s => !booked.has(s.sailor_id));
    const rigs = (window.BTS_EVENTS || []).find(e => e.id === camp.camp_id)?.rigs || [];

    step.innerHTML = `<section class="bk-card">
      <h2 class="bk-h">Who's coming?</h2>
      <form class="bk-form" novalidate>
        <div class="bk-pick">
          ${me.sailors.map(s => {
            const isBooked = booked.has(s.sailor_id);
            const rigNote = rigs.length && !rigs.includes(Number(s.rig)) ? ` · <span class="bk-rig-note">camp is for ILCA ${rigs.join("/")}</span>` : "";
            return `<label class="bk-pick-item ${isBooked ? "is-off" : ""}">
              <input type="checkbox" name="sailor" value="${esc(s.sailor_id)}" ${isBooked ? "disabled checked" : free.length === 1 ? "checked" : ""}>
              <span><span class="bk-pick-name">${esc(s.first_name)} ${esc(s.surname)}</span>
              <span class="bk-pick-sub">${isBooked ? "Already booked on this camp" : `ILCA ${esc(s.rig)}${s.club ? ` · ${esc(s.club)}` : ""}${rigNote}`}</span></span>
            </label>`;
          }).join("")}
        </div>
        <p class="bk-row-links"><button type="button" class="bk-link" data-add>+ Add another sailor</button></p>
        <div data-sum></div>
        <p class="bk-error" data-error role="alert" tabindex="-1" hidden></p>
        <button class="btn btn-accent bk-submit" type="submit" data-confirm>Confirm booking</button>
        <p class="bk-hint">By booking you agree to our <a href="/terms">terms</a> and <a href="/cancellation">cancellation policy</a>. We'll email you the payment details too.</p>
      </form>
    </section>`;

    const f = $("form", step);
    const chosen = () => [...f.querySelectorAll('input[name="sailor"]:checked:not(:disabled)')].map(i => i.value);
    const sum = () => {
      const n = chosen().length;
      const btn = $("[data-confirm]", f);
      btn.disabled = !n;
      btn.textContent = n > 1 ? `Confirm booking for ${n} sailors` : "Confirm booking";
      if (!n) { $("[data-sum]", f).innerHTML = free.length ? `<p class="bk-hint">Tick at least one sailor.</p>` : `<p class="bk-hint">All your sailors are booked on this camp. See <a href="../account/">My bookings</a>.</p>`; return; }
      const fee = camp.late_now ? camp.late_fee : 0;
      /* The server gives places in the order sailors are listed; anyone past the places left joins the waitlist. */
      const left = camp.full ? 0 : camp.places_left;
      const paying = left === null || left === undefined ? n : Math.min(n, left);
      const waiting = n - paying;
      const names = chosen().map(id => me.sailors.find(s => s.sailor_id === id)?.first_name || "");
      const waitNames = names.slice(paying).map(esc).join(" and ");
      $("[data-sum]", f).innerHTML = `<div class="bk-sum" aria-live="polite">
        ${camp.full ? `<p class="bk-warn"><b>This camp is full.</b> You'll join the waitlist and won't need to pay unless a place comes up.</p>`
          : waiting ? `<p class="bk-warn"><b>Only ${left} place${left === 1 ? "" : "s"} left.</b> ${waitNames} will join the waitlist and won't need to pay unless a place comes up.</p>` : ""}
        ${paying ? `<div class="bk-sum-row"><span>${paying} × camp fee</span><span>${money(camp.price * paying)}</span></div>
        ${fee ? `<div class="bk-sum-row"><span>${paying} × late booking fee</span><span>${money(fee * paying)}</span></div>` : ""}` : ""}
        ${waiting && !camp.full ? `<div class="bk-sum-row"><span>${waiting} on the waitlist</span><span>${money(0)}</span></div>` : ""}
        <div class="bk-sum-row bk-sum-total"><span>${paying ? "Total to pay" : "Total"}</span><span>${money(camp.price_now * paying)}</span></div>
        ${!paying ? "" : `<p class="bk-hint">Payment by bank transfer, due <b>${esc(dueText(camp.payment_due_now))}</b>. You'll see the bank details and your reference straight after booking.</p>`}
        ${fee ? `<p class="bk-late">The camp starts within ${CFG.payDays} days, so a ${money(fee)} late booking fee applies and payment is due straight away.</p>` : `<p class="bk-hint">Payment is due ${CFG.payDays} days after booking, or ${CFG.payDays} days before the camp if that's sooner. Bookings in the final ${CFG.payDays} days add a ${money(camp.late_fee || CFG.lateFee)} late fee.</p>`}
      </div>`;
    };
    f.addEventListener("change", sum);
    sum();

    /* The add-sailor form can't sit inside this form (nested forms), so it replaces the picker until saved or cancelled. */
    $("[data-add]", f).addEventListener("click", () => {
      step.innerHTML = `<section class="bk-card"><h2 class="bk-h">Add a sailor</h2><div data-f></div></section>`;
      U.sailorForm($("[data-f]", step), null, { submit: "Add sailor", onSaved: m => { me = m; pick(); }, onCancel: pick });
    });
    f.addEventListener("submit", ev => {
      ev.preventDefault();
      const ids = chosen();
      if (!ids.length) return;
      U.quiet(U.busy($("[data-confirm]", f), f, async () => {
        const r = await B.call("book", { camp_id: camp.camp_id, sailor_ids: ids });
        me = r.me;
        try { sessionStorage.removeItem("bts-book-camps"); } catch (e) { /* ignore */ }
        done(r, ids);
      }));
    });
  }

  function done(r, ids) {
    const pay = r.bookings.filter(b => b.status !== "Waitlist");
    const wait = r.bookings.filter(b => b.status === "Waitlist");
    const needForm = me.sailors.filter(s => ids.includes(s.sailor_id) && !s.medical_done);
    step.innerHTML = `<section class="bk-card" tabindex="-1" data-done>
      <div class="bk-done-tick" aria-hidden="true">✓</div>
      <h2 class="bk-h">Booking received</h2>
      <div class="bk-pick">${r.bookings.map(b => `<div class="bk-pick-item bk-done-item">
        <span class="bk-grow"><span class="bk-pick-name">${esc(b.sailor_name)}</span><span class="bk-pick-sub">${money(b.amount)}${b.late_fee_applied ? " incl. late fee" : ""} · Ref ${esc(b.reference)}</span></span>${U.pill(b.status)}</div>`).join("")}</div>
      ${pay.length ? U.bankBlock(r.bank, pay.map(b => ({ name: b.sailor_name, amount: b.amount, reference: b.reference })), pay[0].payment_due, me.payment_note) : ""}
      ${wait.length ? `<p class="bk-warn">${wait.map(b => esc(b.sailor_name.split(" ")[0])).join(" and ")} ${wait.length > 1 ? "are" : "is"} on the waitlist. Please don't pay for ${wait.length > 1 ? "them" : "this place"} yet: we'll be in touch if a place comes up.</p>` : ""}
      ${needForm.length ? `<div class="bk-warn"><b>One more thing:</b> the medical &amp; image release form is needed for ${needForm.map(s => esc(s.first_name)).join(" and ")} this season.<br>
        ${needForm.map(s => `<a href="${esc(s.medical_link || me.medical_form_url)}" target="_blank" rel="noopener" style="font-weight:700">Complete the form for ${esc(s.first_name)} ↗</a>`).join("<br>")}
        <br><span class="bk-hint">Once it's sent we'll email you a receipt, and <a href="../account/">My bookings</a> will show it as done.</span></div>` : ""}
      <h3 class="bk-h3">What happens next</h3>
      <ol class="bk-steps">
        <li>We've emailed these details to <b>${esc(me.profile.email)}</b>.</li>
        ${pay.length ? `<li>Pay by bank transfer using the reference${pay.length > 1 ? "s" : ""} above.</li><li>Once it arrives, James or Kai will be in touch personally to confirm your place.</li>` : `<li>We'll contact you if a place comes up.</li>`}
      </ol>
      <div class="bk-actions"><a class="btn btn-accent" href="../account/">My bookings</a><a class="btn btn-line" href="../calendar/">Back to calendar</a></div>
    </section>`;
    const box = $("[data-done]", step);
    box.scrollIntoView({ behavior: "smooth", block: "start" });
    box.focus({ preventScroll: true });
    // refresh header (places left)
    B.camps(true).then(list => { const c = list.find(x => x.camp_id === camp.camp_id); if (c) { camp = c; campHeader(c); } }).catch(() => {});
    U.who($("[data-who-list]", whoBox), camp.camp_id);
  }

  start();
})();
