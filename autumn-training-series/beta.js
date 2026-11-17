/* Beyond the Shift /beta — homepage behaviour. */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 820px)").matches;
  const C = window.BTSCal;
  const events = (window.BTS_EVENTS || []).filter(e => !e.optional);

  /* ---------- Nav ---------- */
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const setSolid = () => nav.classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.6);
  setSolid();
  /* Hide on the way down, back (logo, menu and Book a camp button) on the first scroll up (James, 15 Nov; same as article.js). */
  let lastY = window.scrollY;
  const navScroll = () => {
    const y = window.scrollY, d = y - lastY;
    setSolid();
    if (Math.abs(d) < 4 && y > 80) return;
    document.body.classList.toggle("nav-hid", y > 80 && d > 0 && !nav.classList.contains("is-open"));
    lastY = y;
  };
  window.addEventListener("scroll", navScroll, { passive: true });
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }));
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Places left ----------
     Live rule (live script.js placesLeft): count down from 6 until 4 sailors are in, then hold at "2 places left";
     secondGroup / waitlist switched on by hand. Offline numbers from data/camps.js; once the booking sheet answers,
     its places_label (signups_offline + online bookings) wins. */
  const D = window.BTS_CAMP_DETAILS || {};
  let online = {};
  const places = id => {
    const o = online[id];
    if (o && o.places_label) return { label: o.places_label, low: o.full || o.places_left < 3 };
    const d = D[id];
    if (!d) return null;
    if (d.waitlist) return { label: "Waiting list only", low: true };
    if (d.secondGroup) return { label: "Second group forming", low: false };
    const n = d.signups || 0, left = n < 4 ? 6 - n : 2;
    return { label: `${left} ${left === 1 ? "place" : "places"} left`, low: left < 3 };
  };
  const BK = window.BTSBook;
  if (BK && BK.mode !== "off") BK.camps().then(list => {
    online = Object.fromEntries(list.map(c => [c.camp_id, c]));
    document.dispatchEvent(new Event("bts:places"));
  }).catch(() => {});

  /* ---------- Autumn + winter training dates (live #dates section, rebuilt 15 Nov) ---------- */
  const FORM = "https://forms.gle/X7offBwNaL24wZ4t7";
  const evList = document.querySelector("[data-event-list]");
  const panel = document.querySelector("[data-camp-panel]");
  const detailEl = document.querySelector("[data-camp-detail]");
  const panelImg = document.querySelector("[data-camp-img]");
  const inline = window.matchMedia("(max-width: 860px)");
  const campsAll = C ? events.filter(e => e.type === "bts-camp" && !e.placeholder && D[e.id]).sort((a, b) => C.parse(a.start) - C.parse(b.start)) : [];
  const isDone = e => C.parse(e.end) < C.today;
  const countdown = e => {
    const days = Math.round((C.parse(e.start) - C.today) / 864e5);
    if (days <= 0) return "On the water now";
    if (days === 1) return "Starts tomorrow";
    return days < 14 ? `Starts in ${days} days` : `Starts in ${Math.round(days / 7)} weeks`;
  };
  const venueShort = v => (v === "Poole Yacht Club" ? "Poole YC" : v);
  /* Online booking open for this camp (booking sheet open = Y) → /beta/book/; otherwise the Google Form. */
  const bookLink = e => (online[e.id] ? { href: `book/?camp=${encodeURIComponent(e.id)}`, ext: false } : { href: FORM, ext: true });
  const detailHTML = (e, withTitle) => {
    const d = D[e.id], b = bookLink(e), p = places(e.id);
    return `<div class="camp-topline"><span>${C.esc(d.date)}</span><strong>${C.esc(d.price || "New date")}</strong></div>
      ${withTitle ? `<h3>${C.esc(d.title)}</h3>` : ""}
      <p class="camp-venue">${C.esc(e.venue)}${p ? ` · <span class="${p.low ? "is-low" : ""}">${C.esc(p.label)}</span>` : ""}</p>
      <p>${C.esc(d.intro)}</p>
      <h4>Main focus</h4><p>${C.esc(d.detailFocus)}</p>
      <ul>${d.expect.map(x => `<li>${C.esc(x)}</li>`).join("")}</ul>
      <p class="camp-suitable"><strong>Suitable for:</strong> ILCA 4 and 6 sailors, primarily those racing nationally with international aspirations.</p>
      <p class="camp-deadline">${C.esc(d.deadline)}</p>
      <a class="btn btn-accent camp-book" href="${b.href}"${b.ext ? ' target="_blank" rel="noopener noreferrer"' : ""} data-splash>Book this camp ${b.ext ? '<span aria-hidden="true">↗</span>' : ''}</a>
      ${b.ext ? "" : `<a class="camp-alt" href="${FORM}" target="_blank" rel="noopener noreferrer">Prefer the booking form?</a>`}
      ${d.slug ? `<a class="camp-alt" href="camps/${encodeURIComponent(d.slug)}/">Full camp details →</a>` : ""}`;
  };
  let cards = [];
  const setSelected = card => {
    const e = card && campsAll.find(x => x.id === card.dataset.event);
    cards.forEach(c => {
      const on = c === card;
      c.classList.toggle("is-selected", on);
      c.querySelector(".event-trigger").setAttribute("aria-expanded", String(on));
      c.querySelector(".mobile-event-detail").innerHTML = on && inline.matches ? detailHTML(e, false) : "";
    });
    if (e && detailEl) {
      detailEl.innerHTML = detailHTML(e, true);
      const ph = D[e.id].photo || "fleet";
      if (panelImg) {
        panelImg.srcset = `img/camps/${ph}-700.webp 700w, img/camps/${ph}-1200.webp 1200w`;
        panelImg.sizes = "(max-width: 1100px) 40vw, 460px";
        panelImg.src = `img/camps/${ph}-700.webp`;
        panelImg.alt = `ILCA sailors training with Beyond the Shift`;
      }
    }
  };
  const ensureSel = () => { if (!inline.matches && cards[0] && !cards.some(c => c.classList.contains("is-selected"))) setSelected(cards[0]); };
  const selectCard = card => {
    const open = card.classList.contains("is-selected");
    if (!inline.matches) {
      if (open) return;
      setSelected(card);
      if (!reduce && panel && panel.animate) panel.animate([{ opacity: 0, transform: "translateX(14px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" });
      return;
    }
    // Phones: accordion. Keep the tapped card where it was when one above closes.
    const before = card.getBoundingClientRect().top;
    setSelected(open ? null : card);
    const shift = card.getBoundingClientRect().top - before;
    if (shift) window.scrollBy(0, shift);
    const md = card.querySelector(".mobile-event-detail");
    if (!open && !reduce && md.animate) md.animate([{ height: "0px", opacity: 0 }, { height: `${md.scrollHeight}px`, opacity: 1 }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
  };
  const renderDates = () => {
    if (!evList || !C) return;
    const up = campsAll.filter(e => !isDone(e)), done = campsAll.filter(isDone);
    const keepId = (evList.querySelector(".event-card.is-selected") || { dataset: {} }).dataset.event;
    const parts = [];
    let season = up[0] && D[up[0].id].season;
    up.forEach((e, i) => {
      const d = D[e.id], p = places(e.id), isNext = i === 0;
      if (d.season !== season && d.season === "winter") parts.push(`<div class="winter-divider" role="presentation"><span>Winter 2026/27</span><strong>Booking now open</strong></div>`);
      season = d.season;
      parts.push(`<article class="event-card${isNext ? " is-next" : ""}" role="listitem" data-event="${C.esc(e.id)}">
        <button class="event-trigger" type="button" aria-expanded="false" aria-controls="detail-${C.esc(e.id)}">
          <span class="event-date"><small>${C.esc(d.month)}</small>${C.esc(d.days)}</span>
          <span class="event-main"><strong>${C.esc(d.short)}</strong><small>${C.esc(e.venue)} · ${C.esc(d.focus)}</small>${isNext ? `<span class="next-label">Next up · ${countdown(e)}</span>` : ""}${p ? `<span class="event-places${p.low ? " is-low" : ""}">${C.esc(p.label)}</span>` : ""}</span>
          <span class="event-price">${C.esc(d.price || "New")}</span><span class="event-arrow" aria-hidden="true">→</span>
        </button>
        <div class="mobile-event-detail" id="detail-${C.esc(e.id)}"></div>
      </article>`);
    });
    if (!up.length) parts.push(`<p class="lede">New dates coming soon. Join the WhatsApp group to hear first.</p>`);
    if (done.length) parts.push(`<div class="completed-strip" role="listitem"><p class="completed-strip-label"><span aria-hidden="true">✓</span> ${done.length} ${done.length === 1 ? "camp" : "camps"} completed</p>
      <ul aria-label="Completed camps">${done.map(e => `<li><span class="done-date">${C.esc(D[e.id].month)} ${C.esc(D[e.id].days)}</span><span class="done-name">${C.esc(D[e.id].short)}</span><span class="done-venue">${C.esc(venueShort(e.venue))}</span></li>`).join("")}</ul></div>`);
    evList.innerHTML = parts.join("");
    cards = [...evList.querySelectorAll(".event-card")];
    cards.forEach(card => card.querySelector(".event-trigger").addEventListener("click", () => selectCard(card)));
    const keep = keepId && cards.find(c => c.dataset.event === keepId);
    if (keep) setSelected(keep); else ensureSel();
  };
  renderDates();
  document.addEventListener("bts:places", renderDates);
  if (inline.addEventListener) inline.addEventListener("change", () => { const c = cards.find(x => x.classList.contains("is-selected")); if (c) setSelected(c); else ensureSel(); });

  /* Links with data-select (hero "Next camps", "Next trainings") scroll to #dates and open that camp. */
  document.addEventListener("click", ev => {
    const a = ev.target.closest("[data-select]");
    const card = a && cards.find(c => c.dataset.event === a.dataset.select);
    if (!card) return;
    ev.preventDefault();
    if (!card.classList.contains("is-selected")) setSelected(card);
    if (window.__btsLenis) window.__btsLenis.scrollTo(card, { offset: -84 });
    else card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", "#dates");
    card.classList.remove("is-pinged"); void card.offsetWidth; card.classList.add("is-pinged");
  });

  /* ---------- Next 3 trainings ---------- */
  const list = document.querySelector("[data-next-trainings]");
  if (list && C) {
    const next = events.filter(e => e.type === "bts-camp" && !e.placeholder && C.parse(e.end) >= C.today).sort((a, b) => C.parse(a.start) - C.parse(b.start)).slice(0, 3);
    list.innerHTML = next.length ? next.map(e => `
      <li class="reveal"><a class="training" href="#dates" data-select="${C.esc(e.id)}">
        <span class="training-date">${C.esc(C.range(e).replace(/ \d{4}/g, ""))}</span>
        <span><span class="training-name">${C.esc(e.name)}</span><br><span class="training-venue">${C.esc(e.venue)} · ${C.esc(C.rigText(e))}</span></span>
        <span class="arrow" aria-hidden="true"></span>
      </a></li>`).join("") : `<li class="training">New dates coming soon.</li>`;
    /* Places left (live rule, or the booking sheet once online booking answers). Tapping opens the camp in #dates. */
    const showPlaces = () => next.forEach((e, i) => {
      const a = list.querySelectorAll("a.training")[i], p = places(e.id);
      if (!a || !p) return;
      a.querySelector(".arrow").innerHTML = `<span class="places${p.low ? " is-full" : ""}">${C.esc(p.label)}</span>`;
    });
    showPlaces();
    document.addEventListener("bts:places", showPlaces);
  }

  /* ---------- Hero "Next camps" strip (live .next-camps), from events.js ---------- */
  const nextWrap = document.querySelector("[data-next-camps]"), nextRow = document.querySelector("[data-next-camps-row]");
  if (nextWrap && nextRow && C) {
    const up = events.filter(e => e.type === "bts-camp" && !e.placeholder && C.parse(e.end) >= C.today).sort((a, b) => C.parse(a.start) - C.parse(b.start)).slice(0, 3);
    const when = e => {
      const s = C.parse(e.start), days = Math.round((s - C.today) / 864e5);
      if (days <= 0) return "On the water now";
      if (days === 1) return "Starts tomorrow";
      return days < 14 ? `Starts in ${days} days` : `Starts in ${Math.round(days / 7)} weeks`;
    };
    if (up.length) {
      nextRow.innerHTML = up.map(e => {
        const s = C.parse(e.start), en = C.parse(e.end);
        const dd = +s === +en ? `${s.getDate()}` : `${s.getDate()}–${en.getDate()}`;
        return `<a class="next-camp" href="#dates" data-select="${C.esc(e.id)}"><span class="next-camp-date">${C.MONTHS_LONG[s.getMonth()].slice(0, 3)}<b>${dd}</b></span><span class="next-camp-body"><strong>${C.esc(e.name)}</strong><small>${C.esc(e.venue)} · ${when(e)}</small></span></a>`;
      }).join("");
      nextWrap.hidden = false;
    }
  }

  /* ---------- Calendar teaser: 8-week strip from this Monday ---------- */
  const strip = document.querySelector("[data-teaser-scroll]");
  if (strip && C) {
    const start = C.addDays(C.today, -C.wd(C.today));
    const n = 56, end = C.addDays(start, n - 1);
    const inRange = events.filter(e => C.parse(e.end) >= start && C.parse(e.start) <= end);
    let head = "", i = 0;
    while (i < n) {
      const d = C.addDays(start, i);
      const left = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate() + 1;
      const span = Math.min(left, n - i);
      head += `<div class="teaser-month" style="--span:${span}">${span >= 3 ? C.MONTHS_LONG[d.getMonth()] : ""}</div>`;
      i += span;
    }
    strip.innerHTML = `<div class="teaser-head">${head}</div>` + C.row({ start, n, events: inRange, minLanes: 2, cls: reduce ? "" : "animate" });
    strip.addEventListener("click", ev => {
      const bar = ev.target.closest(".cal-bar");
      if (bar) window.location.href = `calendar/#event=${encodeURIComponent(bar.dataset.id)}`;
    });
  }

  /* ---------- Reveals ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".reveal").forEach((el, idx) => { el.style.transitionDelay = `${(idx % 5) * 70}ms`; io.observe(el); });

  /* ---------- Motion (GSAP) ---------- */
  if (reduce || !window.gsap) return;
  const gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  if (window.Lenis && !small) {
    const lenis = new window.Lenis({ lerp: 0.12 });
    window.__btsLenis = lenis;
    lenis.on("scroll", () => window.ScrollTrigger && window.ScrollTrigger.update());
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]:not([data-select])').forEach(a => a.addEventListener("click", ev => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) { ev.preventDefault(); lenis.scrollTo(target, { offset: -68 }); }
    }));
  }

  // Hero: CSS-only entrance copied from the live site (beta.css "Hero"). No pin or scrub: pinning added
  // 120% of spacer after load, which made anchor links from other pages land, then jump.

  // Philosophy: words light up as you scroll
  const q = document.querySelector("[data-split-words]");
  if (q) {
    const wrapWords = node => Array.from(node.childNodes).forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
        });
        ch.replaceWith(frag);
      } else wrapWords(ch);
    });
    wrapWords(q);
    gsap.to(q.querySelectorAll(".w"), { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: q, start: "top 80%", end: "bottom 45%", scrub: true } });
  }
})();
