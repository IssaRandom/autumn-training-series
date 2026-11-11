/* /beta/calendar — Year plan (weekday-aligned month rows, zoomable) + Months (7-col grids + list). */
(() => {
  "use strict";
  const C = window.BTSCal;
  const ALL = (window.BTS_EVENTS || []).slice().sort((a, b) => C.parse(a.start) - C.parse(b.start) || C.parse(b.end) - C.parse(a.end));
  const TYPES = window.BTS_TYPES;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mq = window.matchMedia("(max-width: 700px)");
  const touch = window.matchMedia("(hover: none)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- state (remembered per viewer) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("btscal." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("btscal." + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  const state = {
    view: store.get("view", mq.matches ? "month" : "year"),
    rig: store.get("rig", "all"),
    types: store.get("types", Object.keys(TYPES)),
    optional: store.get("optional", false),
    dayW: null
  };

  /* ---------- month range: first → last event month ---------- */
  const first = C.parse(ALL[0].start), last = C.parse(ALL.reduce((m, e) => (e.end > m ? e.end : m), ALL[0].end));
  const months = [];
  for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d <= last; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) months.push(d);
  const isNow = m => m.getFullYear() === C.today.getFullYear() && m.getMonth() === C.today.getMonth();
  const monthEnd = m => new Date(m.getFullYear(), m.getMonth() + 1, 0);

  const visible = () => ALL.filter(e =>
    state.types.includes(e.type) &&
    (!e.optional || state.optional) &&
    (state.rig === "all" || !e.rigs.length || e.rigs.includes(Number(state.rig))));

  /* ---------- toolbar ---------- */
  const chipsEl = $("[data-type-chips]");
  function renderChips() {
    const counts = {};
    ALL.forEach(e => { if (!e.optional || state.optional) counts[e.type] = (counts[e.type] || 0) + 1; });
    chipsEl.innerHTML = Object.entries(TYPES).map(([k, t]) =>
      `<button type="button" class="chip t-${k}" data-type="${k}" aria-pressed="${state.types.includes(k)}">${t.label} <span class="count">${counts[k] || 0}</span></button>`).join("") +
      `<button type="button" class="chip t-optional" data-optional aria-pressed="${state.optional}">Masters &amp; women’s</button>`;
  }
  chipsEl.addEventListener("click", ev => {
    const chip = ev.target.closest(".chip");
    if (!chip) return;
    if (chip.hasAttribute("data-optional")) state.optional = !state.optional;
    else {
      const k = chip.dataset.type;
      state.types = state.types.includes(k) ? state.types.filter(t => t !== k) : state.types.concat(k);
    }
    store.set("types", state.types); store.set("optional", state.optional);
    renderChips(); render({ fx: true });
  });
  // double-click a chip to show only that type
  chipsEl.addEventListener("dblclick", ev => {
    const chip = ev.target.closest(".chip[data-type]");
    if (!chip) return;
    state.types = [chip.dataset.type]; store.set("types", state.types); renderChips(); render({ fx: true });
  });

  $$("[data-rig]").forEach(b => b.addEventListener("click", () => {
    if (state.rig === b.dataset.rig) return;
    state.rig = b.dataset.rig; store.set("rig", state.rig); syncPressed(); render({ fx: true });
  }));
  $$("[data-view]").forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));
  function syncPressed() {
    $$("[data-rig]").forEach(b => b.setAttribute("aria-pressed", b.dataset.rig === String(state.rig)));
    $$("[data-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === state.view));
    $("[data-zoom-ui]").hidden = state.view !== "year";
    $("[data-month-jump]").hidden = state.view !== "month";
  }

  /* ---------- layout sizing: year plan fills the viewport below the toolbar ---------- */
  const yp = $("[data-year-view]"), mv = $("[data-month-view]"), toolbar = $("[data-toolbar]");
  function size() {
    const tb = toolbar.getBoundingClientRect();
    document.documentElement.style.setProperty("--tb-h", `${tb.bottom}px`);
    const hint = $("[data-hint]").offsetHeight;
    yp.style.setProperty("--yp-h", `${Math.max(320, window.innerHeight - tb.bottom - hint - 16)}px`);
  }

  /* ============================================================
     YEAR PLAN
     ============================================================ */
  const labW = () => parseFloat(getComputedStyle(yp).getPropertyValue("--lab")) || 64;
  const fitW = () => Math.max(6, (yp.clientWidth - labW() - 2) / 37);
  const MAXW = 160;
  const minW = () => Math.min(fitW(), 22);
  // slider 0..100 ↔ day width on a log scale between "fit" and MAXW
  const toSlider = w => Math.round(100 * Math.log(w / minW()) / Math.log(MAXW / minW()));
  const fromSlider = v => minW() * Math.pow(MAXW / minW(), v / 100);
  const range = $("[data-zoom-range]");

  function tier(w) { return w < 16 ? "z-xs" : w < 26 ? "z-s" : w >= 56 ? "z-l" : "z-m"; }
  function setZoom(w, anchorX) {
    w = Math.max(minW(), Math.min(MAXW, w));
    const old = state.dayW || w, lab = labW();
    const x = anchorX == null ? (yp.clientWidth - lab) / 2 : Math.max(0, anchorX - lab);
    const contentX = yp.scrollLeft + x;
    state.dayW = w;
    yp.style.setProperty("--day-w", `${w}px`);
    yp.classList.remove("z-xs", "z-s", "z-m", "z-l");
    yp.classList.add(tier(w));
    yp.scrollLeft = contentX * (w / old) - x;
    range.value = toSlider(w);
  }

  function renderYear(evts, intro) {
    const wd = Array.from({ length: 37 }, (_, i) => `<span class="${i % 7 > 4 ? "we" : ""}">${C.WD[i % 7]}</span>`).join("");
    let html = `<div class="yp-grid${intro ? " animate" : ""}"><div class="yp-head"><div class="yp-corner"></div><div class="yp-wd">${wd}</div></div>`;
    months.forEach((m, idx) => {
      if (idx === 0 || m.getMonth() === 0) html += `<div class="yp-year">${m.getFullYear()}</div>`;
      const off = C.wd(m), end = monthEnd(m);
      const evs = evts.filter(e => C.parse(e.end) >= m && C.parse(e.start) <= end);
      const label = `<button type="button" class="yp-label" data-open-month="${idx}" title="Open ${C.MONTHS_LONG[m.getMonth()]} in Months view">${C.MONTHS[m.getMonth()]}</button>`;
      html += `<div class="yp-month${isNow(m) ? " is-now" : ""}" data-m="${idx}">` +
        C.row({ start: C.addDays(m, -off), n: 37, visStart: m, visEnd: end, events: evs, minLanes: 1, label }) + `</div>`;
    });
    yp.innerHTML = html + "</div>";
  }

  function scrollYearToToday(smooth) {
    const nowRow = $(".yp-month.is-now", yp) || $(".yp-month", yp);
    if (!nowRow) return;
    const head = $(".yp-head", yp).offsetHeight;
    const top = nowRow.offsetTop - head - 30;
    const cell = $(".cal-cell.is-today", yp);
    const left = cell ? cell.offsetLeft + cell.parentElement.offsetLeft - yp.clientWidth / 2 : 0;
    yp.scrollTo({ top: Math.max(0, top), left: Math.max(0, left), behavior: smooth && !reduce ? "smooth" : "auto" });
  }

  yp.addEventListener("click", ev => {
    const lab = ev.target.closest("[data-open-month]");
    if (lab) { setView("month", Number(lab.dataset.openMonth)); return; }
  });

  // Ctrl/⌘ + wheel (also trackpad pinch on desktop) zooms around the pointer
  yp.addEventListener("wheel", ev => {
    if (!(ev.ctrlKey || ev.metaKey)) return;
    ev.preventDefault();
    const r = yp.getBoundingClientRect();
    setZoom(state.dayW * Math.exp(-ev.deltaY * 0.0025), ev.clientX - r.left);
  }, { passive: false });

  // Click-and-drag to pan with a mouse (a drag never opens an event)
  let drag = null, swallow = false;
  yp.addEventListener("pointerdown", ev => {
    if (ev.pointerType !== "mouse" || ev.button !== 0 || ev.target.closest(".yp-label")) return;
    drag = { x: ev.clientX, y: ev.clientY, l: yp.scrollLeft, t: yp.scrollTop, moved: false };
  });
  window.addEventListener("pointermove", ev => {
    if (!drag) return;
    const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) { drag.moved = true; yp.classList.add("is-dragging"); $("[data-tip]").hidden = true; }
    yp.scrollLeft = drag.l - dx; yp.scrollTop = drag.t - dy;
  });
  window.addEventListener("pointerup", () => {
    if (drag && drag.moved) { swallow = true; setTimeout(() => { swallow = false; }, 0); }
    yp.classList.remove("is-dragging"); drag = null;
  });
  yp.addEventListener("click", ev => { if (swallow) { ev.stopPropagation(); ev.preventDefault(); } }, true);

  // Two-finger pinch on touch screens
  let pinch = null;
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  yp.addEventListener("touchstart", ev => {
    if (ev.touches.length === 2) {
      const r = yp.getBoundingClientRect();
      pinch = { d: dist(ev.touches), w: state.dayW, x: (ev.touches[0].clientX + ev.touches[1].clientX) / 2 - r.left };
    }
  }, { passive: true });
  yp.addEventListener("touchmove", ev => {
    if (!pinch || ev.touches.length !== 2) return;
    ev.preventDefault();
    setZoom(pinch.w * dist(ev.touches) / pinch.d, pinch.x);
  }, { passive: false });
  yp.addEventListener("touchend", ev => { if (ev.touches.length < 2) pinch = null; });

  // Keyboard: + / - zoom, 0 fit
  yp.addEventListener("keydown", ev => {
    if (ev.key === "+" || ev.key === "=") { setZoom(state.dayW * 1.25); ev.preventDefault(); }
    else if (ev.key === "-" || ev.key === "_") { setZoom(state.dayW / 1.25); ev.preventDefault(); }
    else if (ev.key === "0") { setZoom(fitW()); ev.preventDefault(); }
  });
  range.addEventListener("input", () => setZoom(fromSlider(Number(range.value))));
  $$("[data-zoom]").forEach(b => b.addEventListener("click", () => {
    const z = b.dataset.zoom;
    setZoom(z === "fit" ? fitW() : z === "in" ? state.dayW * 1.4 : state.dayW / 1.4);
  }));

  /* ============================================================
     MONTHS
     ============================================================ */
  const jump = $("[data-month-jump]");
  function renderMonths(evts, intro) {
    const wdHead = C.WD.map(d => `<span>${d}</span>`).join("");
    mv.innerHTML = months.map((m, idx) => {
      const end = monthEnd(m), off = C.wd(m);
      const evs = evts.filter(e => C.parse(e.end) >= m && C.parse(e.start) <= end);
      let rows = "";
      for (let ws = C.addDays(m, -off); ws <= end; ws = C.addDays(ws, 7)) {
        const weekEvs = evs.filter(e => C.parse(e.end) >= ws && C.parse(e.start) <= C.addDays(ws, 6));
        rows += C.row({ start: ws, n: 7, visStart: m, visEnd: end, events: weekEvs, minLanes: 1 });
      }
      const list = evs.map(e => {
        const s = C.parse(e.start), t = C.parse(e.end);
        const d = +s === +t ? `${s.getDate()} ${C.MONTHS[s.getMonth()]}` : `${s.getDate()}${s.getMonth() !== t.getMonth() ? " " + C.MONTHS[s.getMonth()] : ""}–${t.getDate()} ${C.MONTHS[t.getMonth()]}`;
        return `<li><button type="button" class="t-${e.type}${t < C.today ? " is-past" : ""}" data-id="${C.esc(e.id)}">
          <span class="sw"></span><span class="d">${d}</span>
          <span class="n">${C.esc(e.name)}${e.status === "provisional" ? '<span class="prov">Prov.</span>' : ""}</span>
          <span class="v">${C.esc([e.venue, C.rigText(e)].filter(Boolean).join(" · "))}</span></button></li>`;
      }).join("");
      return `<article class="mcard${isNow(m) ? " is-now" : ""}${intro ? " animate" : ""}" id="m-${idx}" data-m="${idx}">
        <div class="mcard-head"><h2>${C.MONTHS_LONG[m.getMonth()]} ${m.getFullYear()}</h2><span>${evs.length ? evs.length + (evs.length === 1 ? " event" : " events") : ""}</span></div>
        <div class="mcard-wd">${wdHead}</div>${rows}
        ${evs.length ? `<ul class="mlist">${list}</ul>` : `<p class="mempty">Nothing listed with these filters.</p>`}
      </article>`;
    }).join("");
    jump.innerHTML = months.map((m, idx) =>
      `<a href="#m-${idx}" data-jump="${idx}" class="${isNow(m) ? "is-now" : ""}">${C.MONTHS[m.getMonth()]}${idx === 0 || m.getMonth() === 0 ? `<small>${m.getFullYear()}</small>` : "<small>&nbsp;</small>"}</a>`).join("");
    observeMonths();
  }
  function scrollToMonth(idx, smooth) {
    const card = $(`#m-${idx}`);
    if (card) card.scrollIntoView({ behavior: smooth && !reduce ? "smooth" : "auto", block: "start" });
  }
  jump.addEventListener("click", ev => {
    const a = ev.target.closest("[data-jump]");
    if (!a) return;
    ev.preventDefault();
    scrollToMonth(a.dataset.jump, true);
  });
  // highlight the month under the toolbar in the jump strip
  let lastIdx = null, ticking = false;
  function trackMonth() {
    ticking = false;
    if (state.view !== "month") return;
    const line = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tb-h")) || 200) + 24;
    let idx = "0";
    $$(".mcard", mv).forEach(c => { if (c.getBoundingClientRect().top <= line) idx = c.dataset.m; });
    if (idx === lastIdx) return;
    lastIdx = idx;
    $$("[data-jump]", jump).forEach(a => a.classList.toggle("is-current", a.dataset.jump === idx));
    const cur = $(`[data-jump="${idx}"]`, jump);
    if (cur) jump.scrollTo({ left: cur.offsetLeft - jump.clientWidth / 2 + cur.offsetWidth / 2, behavior: reduce ? "auto" : "smooth" });
  }
  function observeMonths() { lastIdx = null; requestAnimationFrame(trackMonth); }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(trackMonth); } }, { passive: true });

  /* ============================================================
     VIEW + RENDER
     ============================================================ */
  /* Filter / rig changes: events that stay keep their place (or glide to their new lane),
     removed ones fade out as grey ghosts, added ones pop in with a ring, and a short
     summary says what changed. Only bars on screen are animated. */
  const EASE = "cubic-bezier(.16,1,.3,1)";
  let shownIds = new Set();
  function viewBox() {
    if (state.view === "year") {
      const r = yp.getBoundingClientRect(), head = ($(".yp-head", yp) || {}).offsetHeight || 0;
      return { top: r.top + head, bottom: r.bottom, left: r.left + labW(), right: r.right };
    }
    const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tb-h")) || 0;
    return { top, bottom: window.innerHeight, left: 0, right: window.innerWidth };
  }
  const onScreen = (r, vb) => r.bottom > vb.top && r.top < vb.bottom && r.right > vb.left && r.left < vb.right;
  function snapshot(root) {
    const vb = viewBox(), bars = new Map(), items = new Set();
    $$(".cal-row", root).forEach((row, ri) => $$(".cal-bar", row).forEach(b => {
      const r = b.getBoundingClientRect();
      bars.set(`${b.dataset.id}|${ri}`, { el: b, r, on: onScreen(r, vb) });
    }));
    $$(".mlist button[data-id]", root).forEach(b => items.add(`${b.closest("[data-m]").dataset.m}|${b.dataset.id}`));
    return { bars, items };
  }
  // keep the month you are looking at in the same place while rows grow or shrink
  function anchor(root) {
    const sel = state.view === "year" ? ".yp-month" : ".mcard", vb = viewBox();
    const el = $$(sel, root).find(x => x.getBoundingClientRect().bottom > vb.top);
    return el && { sel, m: el.dataset.m, top: el.getBoundingClientRect().top, left: yp.scrollLeft };
  }
  function reanchor(root, a) {
    if (!a) return;
    const el = $(`${a.sel}[data-m="${a.m}"]`, root);
    if (!el) return;
    const d = el.getBoundingClientRect().top - a.top;
    if (state.view === "year") { yp.scrollTop += d; yp.scrollLeft = a.left; } else window.scrollBy(0, d);
  }
  let fxLayer = null;
  function ghostLayer(vb) {
    if (!fxLayer) { fxLayer = document.createElement("div"); fxLayer.className = "fx-layer"; fxLayer.setAttribute("aria-hidden", "true"); document.body.appendChild(fxLayer); }
    Object.assign(fxLayer.style, { left: `${vb.left}px`, top: `${vb.top}px`, width: `${vb.right - vb.left}px`, height: `${vb.bottom - vb.top}px` });
    return fxLayer;
  }
  function play(root, before) {
    const vb = viewBox(), seen = new Set();
    $$(".cal-row", root).forEach((row, ri) => $$(".cal-bar", row).forEach(b => {
      const k = `${b.dataset.id}|${ri}`, old = before.bars.get(k);
      seen.add(k);
      const r = b.getBoundingClientRect();
      if (!onScreen(r, vb) && !(old && old.on)) return;
      if (old) {
        const dx = old.r.left - r.left, dy = old.r.top - r.top;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5)
          b.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 520, delay: 160, easing: EASE, fill: "backwards" });
      } else {
        b.classList.add("is-new");
        b.animate([{ opacity: 0, transform: "scale(.35)" }, { opacity: 1, transform: "none" }], { duration: 460, delay: 300, easing: EASE, fill: "backwards" });
        setTimeout(() => b.classList.toggle("is-new", false), 2600);
      }
    }));
    const layer = ghostLayer(vb);
    before.bars.forEach((o, k) => {
      if (seen.has(k) || !o.on) return;
      const g = o.el.cloneNode(true);
      g.removeAttribute("data-id"); g.removeAttribute("title"); g.tabIndex = -1;
      g.classList.add("is-ghost");
      if (o.r.height < 14) g.textContent = "";
      Object.assign(g.style, { left: `${o.r.left - vb.left}px`, top: `${o.r.top - vb.top}px`, width: `${o.r.width}px`, height: `${o.r.height}px` });
      layer.appendChild(g);
      const done = () => layer.contains(g) && layer.removeChild(g);
      g.animate([
        { opacity: 1, transform: "none", filter: "saturate(1)" },
        { opacity: .8, transform: "none", filter: "saturate(0) brightness(1.5)", offset: .35 },
        { opacity: 0, transform: "scale(.9, .3)", filter: "saturate(0) brightness(1.5)" }
      ], { duration: 560, easing: "ease-in", fill: "forwards" }).finished.then(done, done);
    });
    $$(".mlist button[data-id]", root).forEach(b => {
      if (!before.items.has(`${b.closest("[data-m]").dataset.m}|${b.dataset.id}`)) b.classList.add("is-new");
    });
  }
  const delta = $("[data-delta]");
  let deltaT;
  function announce(prev, next) {
    let added = 0, removed = 0;
    next.forEach(id => { if (!prev.has(id)) added++; });
    prev.forEach(id => { if (!next.has(id)) removed++; });
    const parts = [];
    if (added) parts.push(`<b class="plus">+${added}</b> shown`);
    if (removed) parts.push(`<b class="minus">−${removed}</b> hidden`);
    delta.innerHTML = (parts.length ? parts.join(" · ") : "No change") + ` <span>· ${next.size} events</span>`;
    delta.classList.add("is-on");
    clearTimeout(deltaT);
    deltaT = setTimeout(() => delta.classList.toggle("is-on", false), 2600);
  }
  function render(opts = {}) {
    const evts = visible(), ids = new Set(evts.map(e => e.id));
    const root = state.view === "year" ? yp : mv;
    const before = opts.fx && !reduce ? snapshot(root) : null;
    const a = opts.fx ? anchor(root) : null;
    if (state.view === "year") renderYear(evts, opts.intro && !reduce); else renderMonths(evts, opts.intro && !reduce);
    reanchor(root, a);
    if (before) play(root, before);
    if (opts.fx) announce(shownIds, ids);
    shownIds = ids;
  }
  function setView(v, monthIdx) {
    state.view = v; store.set("view", v);
    yp.hidden = v !== "year"; mv.hidden = v !== "month";
    document.documentElement.classList.toggle("cal-lock", v === "year");
    syncPressed(); size(); render({ intro: true });
    if (v === "year") {
      window.scrollTo(0, 0);
      if (!state.dayW) setZoom(defaultZoom());
      else setZoom(state.dayW);
      if (monthIdx == null) scrollYearToToday(false);
    } else {
      window.scrollTo(0, 0);
      const nowIdx = months.findIndex(isNow);
      scrollToMonth(monthIdx != null ? monthIdx : Math.max(0, nowIdx), false);
    }
  }
  const defaultZoom = () => (mq.matches ? 30 : Math.max(fitW(), 28));
  $("[data-today]").addEventListener("click", () => {
    if (state.view === "year") scrollYearToToday(true);
    else scrollToMonth(Math.max(0, months.findIndex(isNow)), true);
  });

  /* ============================================================
     TOOLTIP (pointer devices) + DETAIL SHEET
     ============================================================ */
  const byId = Object.fromEntries(ALL.map(e => [e.id, e]));
  const tip = $("[data-tip]");
  if (!touch) {
    document.addEventListener("mouseover", ev => {
      const bar = ev.target.closest(".cal-bar");
      if (!bar) { tip.hidden = true; return; }
      const e = byId[bar.dataset.id];
      bar.removeAttribute("title");
      tip.innerHTML = `<b>${C.esc(e.name)}</b>${C.esc(C.range(e))}<br><span>${C.esc([e.venue, C.rigText(e)].filter(Boolean).join(" · "))}</span>`;
      tip.hidden = false;
      const r = bar.getBoundingClientRect(), tr = tip.getBoundingClientRect();
      let x = r.left + r.width / 2 - tr.width / 2, y = r.top - tr.height - 8;
      if (y < 130) y = r.bottom + 8;
      tip.style.left = `${Math.max(8, Math.min(window.innerWidth - tr.width - 8, x))}px`;
      tip.style.top = `${y}px`;
    });
    document.addEventListener("scroll", () => { tip.hidden = true; }, true);
  }

  const sheet = $("[data-sheet]");
  let current = null;
  function relative(e) {
    const s = C.parse(e.start), t = C.parse(e.end);
    if (t < C.today) return "Finished";
    if (s <= C.today) return "On now";
    const d = C.diff(s, C.today);
    return d === 1 ? "Tomorrow" : d < 14 ? `In ${d} days` : d < 60 ? `In ${Math.round(d / 7)} weeks` : `In ${Math.round(d / 30.4)} months`;
  }
  function openSheet(id) {
    const e = byId[id];
    if (!e) return;
    current = id;
    tip.hidden = true;
    const days = C.diff(C.parse(e.end), C.parse(e.start)) + 1;
    sheet.className = `sheet t-${e.type}`;
    const typePill = $("[data-sheet-type]");
    typePill.className = `pill t-${e.type}`;
    typePill.textContent = TYPES[e.type].label.replace(/s$/, "");
    $("[data-sheet-title]").textContent = e.name;
    $("[data-sheet-when]").innerHTML = `${C.esc(C.range(e))} <span>· ${days === 1 ? "1 day" : days + " days"} · ${relative(e)}</span>`;
    const facts = [];
    if (e.venue) facts.push(["Venue", C.esc(e.venue)]);
    facts.push(["Rigs", C.esc(C.rigText(e)) + (e.type === "ilca-uk-training" && !e.rigs.length ? " (places by ranking/entry)" : "")]);
    if (e.note) facts.push(["Notes", C.esc(e.note)]);
    if (e.checkNor) facts.push(["Check", `<span class="warn">Rigs vary by event — check the NOR</span>`]);
    if (e.status === "provisional") facts.push(["Status", `<span class="warn">Provisional — dates or venue may change</span>`]);
    $("[data-sheet-facts]").innerHTML = facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
    const actions = [];
    if (e.type === "bts-camp") actions.push(`<a class="btn btn-accent arrow" href="/">Book with BTS</a>`);
    else if (e.url) actions.push(`<a class="btn btn-accent" href="${C.esc(e.url)}" target="_blank" rel="noopener">Event page ↗</a>`);
    $("[data-sheet-actions]").innerHTML = actions.join("") +
      `<div class="add-cal"><span class="add-cal-label">Add to calendar</span>` +
      `<a class="btn btn-line" href="${C.esc(C.gcal(e))}" target="_blank" rel="noopener">Google</a>` +
      `<button type="button" class="btn btn-line" data-ics>Apple / Outlook</button></div>`;
    // Event documents (NoR / SI). Later: hosted copies + parsed key info (registration, first start, format).
    const docs = [["nor", "Notice of Race"], ["si", "Sailing Instructions"]].filter(([k]) => e[k]);
    $("[data-sheet-docs]").innerHTML = docs.length
      ? `<p class="docs-title">Event documents</p>` + docs.map(([k, label]) => `<a class="doc" href="${C.esc(e[k])}" target="_blank" rel="noopener"><span class="doc-ic" aria-hidden="true">PDF</span><span>${label}</span><span class="doc-go" aria-hidden="true">↗</span></a>`).join("")
      : `<p class="docs-none">Notice of Race and Sailing Instructions will appear here once published.</p>`;
    if (!sheet.open) sheet.showModal();
    history.replaceState(null, "", `#event=${encodeURIComponent(id)}`);
  }
  function closeSheet() { sheet.close(); }
  sheet.addEventListener("close", () => { current = null; history.replaceState(null, "", location.pathname + location.search); });
  sheet.addEventListener("click", ev => {
    if (ev.target === sheet) { closeSheet(); return; } // backdrop
    if (ev.target.closest("[data-sheet-close]")) closeSheet();
    const step = ev.target.closest("[data-sheet-step]");
    if (step) {
      const list = visible();
      const i = list.findIndex(e => e.id === current);
      const next = list[(i + Number(step.dataset.sheetStep) + list.length) % list.length];
      if (next) openSheet(next.id);
    }
    if (ev.target.closest("[data-ics]")) {
      const e = byId[current];
      const blob = new Blob([C.ics(e)], { type: "text/calendar" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${e.id}.ics`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
  });
  // swipe down to close on mobile
  let sy = null;
  sheet.addEventListener("touchstart", ev => { sy = sheet.scrollTop <= 0 ? ev.touches[0].clientY : null; }, { passive: true });
  sheet.addEventListener("touchend", ev => { if (sy != null && ev.changedTouches[0].clientY - sy > 80) closeSheet(); sy = null; });
  sheet.addEventListener("keydown", ev => {
    if (ev.key === "ArrowRight") $('[data-sheet-step="1"]').click();
    if (ev.key === "ArrowLeft") $('[data-sheet-step="-1"]').click();
  });

  document.addEventListener("click", ev => {
    const hit = ev.target.closest(".cal-bar[data-id], .mlist button[data-id]");
    if (hit) openSheet(hit.dataset.id);
  });

  /* ---------- nav (shared look, minimal JS) ---------- */
  const nav = $("[data-nav]"), toggle = $("[data-nav-toggle]");
  toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));

  /* ---------- boot ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  renderChips();
  syncPressed();
  setView(state.view);
  let rz;
  window.addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => { size(); if (state.view === "year") setZoom(Math.max(state.dayW, minW())); }, 120);
  });
  // re-anchor once web fonts have settled the layout
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
    size();
    if (state.view === "year") { setZoom(state.dayW); scrollYearToToday(false); }
    else scrollToMonth(Math.max(0, months.findIndex(isNow)), false);
  });
  const m = location.hash.match(/event=([^&]+)/);
  if (m) openSheet(decodeURIComponent(m[1]));
})();
