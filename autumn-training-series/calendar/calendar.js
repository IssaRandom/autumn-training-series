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
  /* First visit shows the events most sailors plan around; the rest are one tap away in Filter.
     (".v2" so viewers who had every type stored from earlier betas get the new default once.) */
  const RECOMMENDED = ["bts-camp", "national-open", "championship", "deadline"];
  const DESC = {
    "bts-camp": "Our camps. Objectively the best bit.",
    "national-open": "Ranking events. Where the points live.",
    "championship": "Nationals, Youth Nats, Inlands. The big ones.",
    "ilca-uk-training": "National and regional squad training",
    "international": "Euros, Worlds, Europa Cups. Passport required.",
    "deadline": "Entries, rankings, selection. Don't miss these."
  };
  const state = {
    view: store.get("view", mq.matches ? "month" : "year"),
    rig: store.get("rig", "all"),
    types: store.get("types.v2", RECOMMENDED),
    optional: store.get("optional", false),
    dayW: null
  };
  /* The address bar always holds the current view, so it can be copied and shared:
     ?view=year|month&rig=all|4|6|7&show=<type>,<type>|none&extra=1 (extra = the optional events switch).
     A link's choices are remembered like a normal tap. */
  const qs = new URLSearchParams(location.search);
  if (/^(year|month)$/.test(qs.get("view") || "")) { state.view = qs.get("view"); store.set("view", state.view); }
  if (/^(all|4|6|7)$/.test(qs.get("rig") || "")) { state.rig = qs.get("rig"); store.set("rig", state.rig); }
  if (qs.has("show")) {
    const s = qs.get("show") === "none" ? [] : qs.get("show").split(",").filter(k => k in TYPES);
    if (s.length || qs.get("show") === "none") { state.types = s; store.set("types.v2", s); }
  }
  if (qs.has("extra")) { state.optional = qs.get("extra") === "1"; store.set("optional", state.optional); }
  function syncUrl() {
    const p = new URLSearchParams();
    p.set("view", state.view); p.set("rig", state.rig);
    p.set("show", state.types.length ? Object.keys(TYPES).filter(k => state.types.includes(k)).join(",") : "none");
    if (state.optional) p.set("extra", "1");
    history.replaceState(null, "", `${location.pathname}?${p.toString().replace(/%2C/g, ",")}${location.hash}`);
  }
  let booted = false; // true once the first paint and scroll-to-today are done (so those don't count as "the viewer scrolled")
  const rigOk = e => state.rig === "all" || !e.rigs.length || e.rigs.includes(Number(state.rig));

  /* ---------- month range: first → last event month ---------- */
  const first = C.parse(ALL[0].start), last = C.parse(ALL.reduce((m, e) => (e.end > m ? e.end : m), ALL[0].end));
  const months = [];
  for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d <= last; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) months.push(d);
  const isNow = m => m.getFullYear() === C.today.getFullYear() && m.getMonth() === C.today.getMonth();
  const monthEnd = m => new Date(m.getFullYear(), m.getMonth() + 1, 0);

  const visibleWith = (types, optional) => ALL.filter(e => types.includes(e.type) && (!e.optional || optional) && rigOk(e));
  const visible = () => visibleWith(state.types, state.optional);
  // counts per type for the current rig (so "BTS training 0" explains an empty ILCA 7 view)
  function counts(optional) {
    const c = {};
    ALL.forEach(e => { if ((!e.optional || optional) && rigOk(e)) c[e.type] = (c[e.type] || 0) + 1; });
    return c;
  }
  function saveFilters() { store.set("types.v2", state.types); store.set("optional", state.optional); syncUrl(); }

  /* ---------- toolbar: Filter button carries a dot per type that is on (a mini colour key) ---------- */
  function renderChips() {
    $("[data-filter-dots]").innerHTML = Object.keys(TYPES).filter(k => state.types.includes(k)).map(k => `<i class="t-${k}"></i>`).join("");
    $("[data-filter-count]").textContent = `${state.types.length}/${Object.keys(TYPES).length}`;
    const off = Object.keys(TYPES).length - state.types.length;
    $("[data-filter-open]").setAttribute("aria-label", `Filter events: ${state.types.length} of ${Object.keys(TYPES).length} types shown${off ? "" : ", all on"}`);
  }

  $$("[data-rig]").forEach(b => b.addEventListener("click", () => {
    if (state.rig === b.dataset.rig) return;
    state.rig = b.dataset.rig; store.set("rig", state.rig); syncUrl(); syncPressed(); renderChips(); render({ fx: true });
    if (fsheet.open) renderFilter();
  }));

  /* ---------- Filter: a dropdown under the button on tablet/desktop, a bottom sheet on phones.
     Every tap applies straight away, so the calendar changes behind it as you go. ---------- */
  const fsheet = $("[data-fsheet]"), fList = $("[data-f-list]"), fApply = $("[data-f-apply]"), fBtn = $("[data-filter-open]");
  const PRESETS = [["recommended", "Recommended", RECOMMENDED], ["all", "Everything", Object.keys(TYPES)], ["bts", "BTS only", ["bts-camp"]]];
  const phone = matchMedia("(max-width: 700px)");
  const isDrop = () => fsheet.classList.contains("is-drop");
  function renderFilter() {
    const n = counts(state.optional);
    const same = (a, b) => a.length === b.length && a.every(x => b.includes(x));
    $("[data-f-presets]").innerHTML = PRESETS.map(([id, label, types]) =>
      `<button type="button" data-preset="${id}" aria-pressed="${same(types, state.types)}">${label}</button>`).join("");
    fList.innerHTML = Object.entries(TYPES).map(([k, t]) => `
      <label class="frow t-${k}${n[k] ? "" : " is-empty"}">
        <input type="checkbox" data-ftype="${k}"${state.types.includes(k) ? " checked" : ""}>
        <span class="frow-sw" aria-hidden="true"></span>
        <span class="frow-t"><b>${t.label}</b><small>${n[k] ? DESC[k] : `None for ILCA ${state.rig}`}</small></span>
        <span class="frow-n">${n[k] || 0}</span>
        <span class="switch" aria-hidden="true"></span>
      </label>`).join("") + `
      <label class="frow t-optional frow-opt">
        <input type="checkbox" data-fopt${state.optional ? " checked" : ""}>
        <span class="frow-sw" aria-hidden="true"></span>
        <span class="frow-t"><b>Masters &amp; women’s</b><small>Adds these to the types above. Respect your elders.</small></span>
        <span class="frow-n"></span>
        <span class="switch" aria-hidden="true"></span>
      </label>`;
    const total = visible().length;
    fApply.textContent = total ? `Done · ${total} event${total === 1 ? "" : "s"}` : "Done · nothing showing (bold choice)";
  }
  /* Share: the phone's share sheet where there is one, otherwise copy the link. The link is the address bar
     (view, rig and filters), without any open event. */
  function shareView(btn) {
    syncUrl();
    const url = location.origin + location.pathname + location.search;
    const label = $("span", btn), was = "Share this calendar";
    const said = t => { label.textContent = t; setTimeout(() => { label.textContent = was; }, 2200); };
    const rig = state.rig === "all" ? "" : ` (ILCA ${state.rig})`;
    if (navigator.share && phone.matches) {
      navigator.share({ title: `ILCA season calendar${rig}`, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => said("Link copied"), () => said("Copy the address bar"));
    } else said("Copy the address bar");
  }
  function applyFilter() { saveFilters(); hintDone("filter"); renderChips(); render({ fx: true }); renderFilter(); }
  // the dropdown hangs from the button, kept inside the window
  function placeDrop() {
    const r = fBtn.getBoundingClientRect(), w = fsheet.offsetWidth;
    const left = Math.max(12, Math.min(r.right - w, window.innerWidth - w - 12));
    fsheet.style.top = `${r.bottom + 8}px`;
    fsheet.style.left = `${left}px`;
    fsheet.style.setProperty("--fo", `${Math.min(w - 20, Math.max(20, r.left + r.width / 2 - left))}px`);
  }
  function openFilter() {
    renderFilter(); hintDone("filter");
    clearTimeout(closing); fsheet.classList.remove("is-closing", "is-settled");
    setTimeout(() => fsheet.classList.add("is-settled"), 450);
    if (fsheet.open) fsheet.close();
    if (phone.matches) { fsheet.classList.remove("is-drop"); fsheet.showModal(); }
    else { fsheet.classList.add("is-drop"); fsheet.show(); placeDrop(); }
    fBtn.setAttribute("aria-expanded", "true");
  }
  let closing = 0;
  function closeFilter(refocus) {
    if (!fsheet.open || fsheet.classList.contains("is-closing")) return;
    const done = () => { fsheet.classList.remove("is-closing"); fsheet.close(); };
    if (isDrop() && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fsheet.classList.add("is-closing"); closing = setTimeout(done, 170);
    } else done();
    fBtn.setAttribute("aria-expanded", "false");
    if (refocus) fBtn.focus({ preventScroll: true });
  }
  fBtn.addEventListener("click", () => (fsheet.open && !fsheet.classList.contains("is-closing") ? closeFilter() : openFilter()));
  fsheet.addEventListener("change", ev => {
    const t = ev.target;
    if (t.matches("[data-ftype]")) state.types = t.checked ? state.types.concat(t.dataset.ftype) : state.types.filter(x => x !== t.dataset.ftype);
    else if (t.matches("[data-fopt]")) state.optional = t.checked;
    else return;
    applyFilter();
    const again = $(`[data-ftype="${t.dataset.ftype}"]`, fsheet) || $("[data-fopt]", fsheet);
    if (again) again.focus({ preventScroll: true });
  });
  fsheet.addEventListener("click", ev => {
    if (ev.target === fsheet && !isDrop()) { closeFilter(); return; } // tap on the backdrop
    if (ev.target.closest("[data-fsheet-close], [data-f-apply]")) { closeFilter(true); return; }
    const sh = ev.target.closest("[data-f-share]");
    if (sh) { shareView(sh); return; }
    const p = ev.target.closest("[data-preset]");
    if (p) { state.types = PRESETS.find(x => x[0] === p.dataset.preset)[2].slice(); applyFilter(); }
  });
  fsheet.addEventListener("close", () => fBtn.setAttribute("aria-expanded", "false"));
  // dropdown: click anywhere else or press Escape to close; follow the button if the window changes size
  document.addEventListener("pointerdown", ev => {
    if (fsheet.open && isDrop() && !fsheet.contains(ev.target) && !fBtn.contains(ev.target)) closeFilter();
  });
  document.addEventListener("keydown", ev => { if (ev.key === "Escape" && fsheet.open && isDrop()) closeFilter(true); });
  window.addEventListener("resize", () => { if (fsheet.open && isDrop()) { if (phone.matches) closeFilter(); else placeDrop(); } });
  swipeToClose(fsheet, () => closeFilter());
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
    // too narrow for every date to fit: number only the Monday of each week
    yp.classList.toggle("z-thin", w < 22);
    if (old !== w && booted) hintDone("zoom");
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

  /* No touch pinch (James, 11 Nov: it only stretched sideways and juddered). Phones use the − / + / Fit
     buttons; touch-action on .yp stops the browser zooming the whole page instead. */
  yp.addEventListener("scroll", () => { if (booted) hintDone("swipe"); updateToday(); }, { passive: true });

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
  const EMPTY = ["Nothing on with these filters. Gym month?", "Quiet one. Perfect time to fix that bent top section.",
    "Nothing here. The boat could do with a polish.", "Empty. Go and do your homework (actual homework).", "Nothing listed. Watch some racing videos instead."];
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
        ${evs.length ? `<ul class="mlist">${list}</ul>` : `<p class="mempty">${EMPTY[idx % EMPTY.length]}</p>`}
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
    // the month that fills most of the screen below the toolbar (a month whose last row is
    // still peeking out under the toolbar no longer counts)
    const top = Math.max(0, toolbar.getBoundingClientRect().bottom), bottom = window.innerHeight;
    let idx = "0", best = -1;
    $$(".mcard", mv).forEach(c => {
      const r = c.getBoundingClientRect(), seen = Math.min(r.bottom, bottom) - Math.max(r.top, top);
      if (seen > best + 1) { best = seen; idx = c.dataset.m; }
    });
    if (idx === lastIdx) return;
    lastIdx = idx;
    $$("[data-jump]", jump).forEach(a => a.classList.toggle("is-current", a.dataset.jump === idx));
    const cur = $(`[data-jump="${idx}"]`, jump);
    if (cur) jump.scrollTo({ left: cur.offsetLeft - jump.clientWidth / 2 + cur.offsetWidth / 2, behavior: reduce ? "auto" : "smooth" });
  }
  function observeMonths() { lastIdx = null; requestAnimationFrame(trackMonth); }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { trackMonth(); updateToday(); }); }
    if (state.view === "month" && booted) hintDone("swipe");
  }, { passive: true });

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
  const mOf = el => { const m = el.closest("[data-m]"); return m ? +m.dataset.m : -1; };
  function snapshot(root) {
    const vb = viewBox(), bars = new Map(), items = new Map();
    $$(".cal-row", root).forEach((row, ri) => $$(".cal-bar", row).forEach(b => {
      const r = b.getBoundingClientRect();
      bars.set(`${b.dataset.id}|${ri}`, { el: b, r, on: onScreen(r, vb), m: mOf(b) });
    }));
    // list rows keep their element and place too, so removed ones can be floated off by the wave
    $$(".mlist button[data-id]", root).forEach(b => {
      const r = b.getBoundingClientRect();
      items.set(`${b.closest("[data-m]").dataset.m}|${b.dataset.id}`, { el: b, r, on: onScreen(r, vb), m: mOf(b) });
    });
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
  /* POLISH-AUDIT #47 (v6, James 13 Nov): how big the animation is follows how big the change is.
     - nothing changed on screen: no animation, just the count
     - 1 to BIG - 1 changes: a quick splash. New bars drop in with a little spray, gone ones sink with one (~0.5 s)
     - BIG or more: the wave (../swash.js) SWEEPS in from the side in one pass at a slight angle and fades as it
       leaves, alternating sides each time (first from the left, then the right, ...). New bars ride in on the foam and
       are dropped in their slot with a spray as the front passes; removed bars are picked up and swept off the far
       edge. Bars that were already there don't move. ~1.1 s. The "+n shown" count pops up as the wave passes.
     - change again mid-wash: the old wave fades out fast, bars it was carrying in are set down, and bars it was
       sweeping away are handed on to the next wave or splash from where they are, so quick clicking stays fluid. */
  const SWEEP = 900, FADE = 420, TOTAL = SWEEP + FADE * .5, BIG = 4;
  let sweepDir = 1;   // 1 = from the left; flips every wave
  const clamp01 = f => Math.min(1, Math.max(0, f));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const spray = (x, y, o) => window.BTSfx && window.BTSfx.spray && window.BTSfx.spray(x, y, o);
  let floatRun = null;   // the wave in flight: { cancel(), handoff() }
  function floater(src, cls, x, y, w, h) {
    const g = src.cloneNode(true);
    g.removeAttribute("data-id"); g.removeAttribute("title"); g.tabIndex = -1;
    g.classList.remove("is-new");
    g.classList.add(cls);
    if (h < 14) g.textContent = "";
    // the clone leaves .yp, so carry over the zoom level's type and padding or its label renders at the wrong size
    const cs = getComputedStyle(src);
    Object.assign(g.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`,
      fontSize: cs.fontSize, padding: cs.padding, justifyContent: cs.justifyContent, borderRadius: cs.borderRadius });
    return g;
  }
  // a month-list row afloat: the button only looks right inside .mlist, so wrap the clone in a bare one
  function floaterRow(src, cls, x, y, w, h) {
    const wrap = document.createElement("div"), g = src.cloneNode(true);
    wrap.className = `mlist fx-item ${cls}`;
    g.removeAttribute("data-id"); g.tabIndex = -1;
    g.classList.remove("is-new");
    wrap.appendChild(g);
    Object.assign(wrap.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    return wrap;
  }
  // what changed: on screen, new bars / list rows to bring in and gone ones to take away; off screen, offs for the pointers
  function changes(root, before, vb) {
    const adds = [], outs = [], offs = [], seen = new Set(), seenItems = new Set();
    $$(".cal-row", root).forEach((row, ri) => $$(".cal-bar", row).forEach(b => {
      const k = `${b.dataset.id}|${ri}`;
      seen.add(k);
      if (before.bars.has(k)) return;   // bars that were already there stay still
      const r = b.getBoundingClientRect();
      if (onScreen(r, vb)) adds.push({ real: b, r, make: floater });
      else offs.push({ kind: "add", el: b, r, m: mOf(b) });
    }));
    before.bars.forEach((o, k) => {
      if (seen.has(k)) return;
      if (o.on) outs.push({ src: o.el, r: o.r, make: floater }); else offs.push({ kind: "out", r: o.r, m: o.m });
    });
    $$(".mlist button[data-id]", root).forEach(b => {
      const k = `${b.closest("[data-m]").dataset.m}|${b.dataset.id}`;
      seenItems.add(k);
      if (before.items.has(k)) return;
      const r = b.getBoundingClientRect();
      if (onScreen(r, vb)) adds.push({ real: b, r, make: floaterRow });
      else offs.push({ kind: "add", el: b, r, m: mOf(b) });
    });
    before.items.forEach((o, k) => {
      if (seenItems.has(k)) return;
      if (o.on) outs.push({ src: o.el, r: o.r, make: floaterRow }); else offs.push({ kind: "out", r: o.r, m: o.m });
    });
    return { adds, outs, offs };
  }
  // returns how long to hold the "+n shown" count back (ms), so it pops up as the wave passes
  function play(root, ch) {
    const vb = viewBox(), layer = ghostLayer(vb);
    const carried = floatRun ? floatRun.handoff() : [];   // bars the last wave was still sweeping away
    const { adds, outs } = ch;
    if (adds.length + outs.length >= BIG) {
      const d = wave(layer, vb, adds, outs, carried);
      if (d != null) return d;
    }
    splashes(vb, layer, adds, outs, carried);
    return 0;
  }

  // small changes: drop in / sink out with a splash
  function sink(el, delay, cx, cy) {
    setTimeout(() => spray(cx, cy, { n: 7, size: .7, power: .55 }), delay);
    el.animate([
      { transform: el.style.transform || "none", opacity: el.style.opacity || 1 },
      { transform: "translateY(-3px) scale(1.05)", opacity: 1, offset: .25 },
      { transform: "translateY(9px) scale(.8, .35)", opacity: 0 }
    ], { duration: 420, delay, easing: "cubic-bezier(.5,0,.75,0)", fill: "both" }).finished.then(() => el.remove(), () => el.remove());
    setTimeout(() => el.remove(), delay + 700);   // backstop: a backgrounded tab can freeze animations, so finished never fires
  }
  function splashes(vb, layer, adds, outs, carried) {
    adds.forEach((a, i) => {
      const b = a.real, r = a.r, delay = i * 70;
      b.classList.add("is-new");
      setTimeout(() => b.classList.toggle("is-new", false), 3200);
      b.animate([
        { transform: "translateY(-18px) scale(.5)", opacity: 0 },
        { transform: "translateY(2px) scale(1.08, .9)", opacity: 1, offset: .55 },
        { transform: "translateY(-1px) scale(.98, 1.03)", offset: .8 },
        { transform: "none", opacity: 1 }
      ], { duration: 460, delay, easing: "cubic-bezier(.3,.7,.4,1)", fill: "backwards" });
      setTimeout(() => spray(r.left + r.width / 2, r.top + r.height / 2, { n: 9, size: .8, power: .7 }), delay + 250);
    });
    outs.forEach((o, i) => {
      const r = o.r, g = o.make(o.src, "is-ghost", r.left - vb.left, r.top - vb.top, r.width, r.height);
      layer.appendChild(g);
      sink(g, (adds.length + i) * 70, r.left + r.width / 2, r.top + r.height / 2);
    });
    carried.forEach(c => sink(c.el, 0, vb.left + c.x + c.w / 2, vb.top + c.top + c.h / 2));
  }

  // big changes: the wave. Returns null if it can't draw (no canvas / zero size) so play() falls back to splashes
  function wave(layer, vb, adds, outs, carried) {
    const dir = sweepDir, vw = Math.max(1, vb.right - vb.left);
    const sw = window.BTSswash && window.BTSswash(layer, { dir, sweep: SWEEP, fade: FADE });
    if (!sw) return null;
    sweepDir = -sweepDir;
    const F = sw.foam, floats = [];
    // u = distance along the way the wave travels; ut = where the bar's near edge sits on that axis
    const afloat = (el, kind, x, top, w, h, real) => floats.push({
      // new bars ride right on the bright lip so they read clearly; leaving bars sit a little deeper in the foam
      el, kind, x, top, w, h, real, cy: top + h / 2, ut: dir > 0 ? x : vw - x - w, op: 1,
      off: kind === "in" ? rnd(.02, .22) * F : rnd(.1, .5) * F,
      // wide things (phone list rows) roll and grow less, or their ends swing a long way
      wide: Math.min(1, 140 / Math.max(1, w)),
      ph: rnd(0, 6.3), ph2: rnd(0, 6.3), bw: rnd(.0045, .0075), rw: rnd(.003, .005), tilt: rnd(3, 6) * (Math.random() < .5 ? -1 : 1)
    });
    adds.forEach(a => {
      const r = a.r, x = r.left - vb.left, top = r.top - vb.top;
      a.real.style.visibility = "hidden";   // the real bar stays hidden until it's set down
      const g = a.make(a.real, "is-float", x, top, r.width, r.height);
      layer.appendChild(g);
      afloat(g, "in", x, top, r.width, r.height, a.real);
    });
    outs.forEach(o => {
      const r = o.r, x = r.left - vb.left, top = r.top - vb.top;
      const g = o.make(o.src, "is-ghost", x, top, r.width, r.height);
      layer.appendChild(g);
      afloat(g, "out", x, top, r.width, r.height);
    });
    carried.forEach(c => {
      Object.assign(c.el.style, { left: `${c.x}px`, top: `${c.top}px`, transform: "" });
      afloat(c.el, "out", c.x, c.top, c.w, c.h);
    });
    floats.forEach(f => { f.u = f.ut; });
    let raf = 0, sprays = 0;
    // set the real bar down where the floater is, with a little settle and a spray
    const land = (f, quiet) => {
      f.landed = true;
      f.el.remove();
      f.real.style.visibility = "";
      if (quiet || !f.real.isConnected) return;
      f.real.classList.add("is-new");
      f.real.animate([
        { transform: "translateY(-3px) rotate(1.5deg) scale(1.03, .96)" },
        { transform: "translateY(1px) rotate(-.5deg) scale(.99, 1.02)", offset: .5 },
        { transform: "none" }
      ], { duration: 420, easing: EASE });
      setTimeout(() => f.real.classList.toggle("is-new", false), 3200);
      if (sprays++ < 14) spray(vb.left + f.x + f.w / 2, vb.top + f.top + f.h / 2, { n: 7, size: .7, power: .6 });
    };
    const finish = () => {
      cancelAnimationFrame(raf);
      floats.forEach(f => { if (f.kind === "in" && !f.landed) land(f); else f.el.remove(); });
      floatRun = null;
    };
    // a newer change has come in: set down what we're carrying in, pass on what we're still sweeping away
    const handoff = () => {
      cancelAnimationFrame(raf);
      floatRun = null;
      const keep = [];
      floats.forEach(f => {
        if (f.kind === "in") { if (!f.landed) land(f, true); return; }
        const x = f.x + dir * (f.u - f.ut);
        if (f.el.isConnected && f.op > .15 && x + f.w > 0 && x < vw) keep.push({ el: f.el, x, top: f.top, w: f.w, h: f.h });
        else f.el.remove();
      });
      return keep;
    };
    const tick = () => {
      const t = sw.time();
      if (t >= TOTAL + 40) return finish();
      const gone = clamp01((t - sw.fadeAt) / FADE);   // the water fading out as it leaves
      for (const f of floats) {
        if (f.landed) continue;
        const ride = sw.front(f.cy, t) - f.off - f.w;   // bar's near edge, sitting in the foam just behind the front
        let lift;
        if (f.kind === "in") {
          // carried in from the edge and dropped off in its slot as the front passes it
          if (ride >= f.ut) { land(f); continue; }
          f.u = ride;
          lift = clamp01((f.ut - f.u) / 24);
        } else {
          // left where it is until the foam catches it, then swept on and off the far edge
          f.u = Math.max(f.ut, ride);
          lift = clamp01((f.u - f.ut) / 14);
          f.op = 1 - gone;
          f.el.style.opacity = f.op.toFixed(2);
        }
        const bob = Math.sin(t * f.bw + f.ph) * 3 * lift;
        const rot = (Math.sin(t * f.rw + f.ph2) * f.tilt + dir * 2) * lift * f.wide;
        const sc = f.kind === "in" ? 1 + .07 * lift * f.wide : 1;   // a touch bigger while afloat, easing back to size as it lands
        f.el.style.transform = `translate(${(dir * (f.u - f.ut)).toFixed(1)}px, ${bob.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      }
      raf = requestAnimationFrame(tick);
    };
    floatRun = { cancel: finish, handoff };
    tick();
    return SWEEP * .45;
  }
  /* Off-screen changes (James 13 Nov): "it doesn't look like anything happens" when what changed is scrolled out of
     view. So each edge with hidden changes gets a pointer pill ("v 2 new in Mar"), arrow bobbing the way to go.
     Tap it to scroll there; when the changes come into view (tapped or scrolled by hand) the bars flash with a little
     spray, the month gets an outline, and the pointer goes. Also cleared by the next change or after 12 s.
     Shown under reduced motion too (no bob, no spray). */
  let points = [], pointT = 0, pointRaf = 0;
  // short month name, with the year when the season has that month twice (Sep-Nov 2026 and 2027)
  const MON = i => {
    const d = months[i];
    if (!d) return "";
    const twice = months.filter(x => x.getMonth() === d.getMonth()).length > 1;
    return d.toLocaleString("en-GB", { month: "short" }) + (twice ? ` ’${String(d.getFullYear()).slice(2)}` : "");
  };
  const ARROW = '<i aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M6 2v8M2.5 6.5 6 10l3.5-3.5"/></svg></i>';
  const monthEl = (root, m) => $(`${state.view === "year" ? ".yp-month" : ".mcard"}[data-m="${m}"]`, root);
  function dropPoint(p) {
    if (p.done) return;
    p.done = true;
    p.el.classList.add("is-gone");
    setTimeout(() => p.el.remove(), 300);
    points = points.filter(x => x !== p);
  }
  function clearPoints() { clearTimeout(pointT); points.slice().forEach(dropPoint); }
  // where a change is now: new ones are real elements; gone ones are placed by their month (and old x in the year plan)
  function targetRect(o, root) {
    if (o.kind === "add") return o.el.getBoundingClientRect();
    const me = monthEl(root, o.m);
    if (!me) return o.r;
    const mr = me.getBoundingClientRect();
    if (state.view === "year") { const dx = yp.scrollLeft - o.sl; return { top: mr.top, bottom: mr.bottom, left: o.r.left - dx, right: o.r.right - dx }; }
    return { top: mr.top, bottom: Math.min(mr.bottom, mr.top + 160), left: mr.left, right: mr.right };
  }
  function reveal(p, root) {
    if (p.done) return;
    dropPoint(p);
    const ms = new Set();
    p.list.forEach(o => {
      ms.add(o.m);
      if (o.kind !== "add" || !o.el.isConnected) return;
      o.el.classList.remove("is-new"); void o.el.offsetWidth; o.el.classList.add("is-new");
      setTimeout(() => o.el.classList.toggle("is-new", false), 3200);
      const r = o.el.getBoundingClientRect();
      if (!reduce) spray(r.left + r.width / 2, r.top + r.height / 2, { n: 6, size: .7, power: .55 });
    });
    ms.forEach(m => {
      const me = monthEl(root, m);
      if (!me) return;
      me.classList.remove("is-here"); void me.offsetWidth; me.classList.add("is-here");
      setTimeout(() => me.classList.toggle("is-here", false), 1900);
    });
  }
  function go(p, root) {
    const vb = viewBox(), r = targetRect(p.near, root), vh = vb.bottom - vb.top;
    const inY = r.bottom > vb.top && r.top < vb.bottom, inX = r.right > vb.left && r.left < vb.right;
    // tall things (a whole month card) scroll to their top; anything else to the middle
    const dy = inY ? 0 : r.bottom - r.top > vh - 24 ? r.top - vb.top - 12 : (r.top + r.bottom) / 2 - (vb.top + vb.bottom) / 2;
    const dx = inX ? 0 : (r.left + r.right) / 2 - (vb.left + vb.right) / 2;
    const behavior = reduce ? "auto" : "smooth";
    if (state.view === "year") yp.scrollBy({ top: dy, left: dx, behavior }); else window.scrollBy({ top: dy, behavior });
    setTimeout(() => reveal(p, root), reduce ? 60 : 650);   // in case the scroll check doesn't catch it (already in view)
  }
  function pointTo(root, offs) {
    if (!offs.length) return;
    const vb = viewBox(), groups = {}, cx = (vb.left + vb.right) / 2, cy = (vb.top + vb.bottom) / 2;
    offs.forEach(o => {
      o.sl = yp.scrollLeft;
      const r = o.r, d = r.bottom <= vb.top ? "up" : r.top >= vb.bottom ? "down" : r.right <= vb.left ? "left" : "right";
      (groups[d] = groups[d] || []).push(o);
    });
    const dist = r => Math.hypot((r.left + r.right) / 2 - cx, (r.top + r.bottom) / 2 - cy);
    const lift = (window.innerHeight - vb.bottom) + (window.matchMedia("(max-width: 700px)").matches ? 104 : 70);   // clear of the count toast
    Object.entries(groups).forEach(([d, list]) => {
      const add = list.filter(o => o.kind === "add").length, out = list.length - add;
      const ms = [...new Set(list.map(o => o.m))].filter(m => m >= 0).sort((a, b) => a - b);
      const where = ms.length === 1 ? ` in ${MON(ms[0])}` : ms.length === 2 ? ` in ${MON(ms[0])} & ${MON(ms[1])}` : "";
      const parts = [];
      if (add) parts.push(`${add} new`);
      if (out) parts.push(`${out} hidden`);
      const el = document.createElement("button");
      el.type = "button";
      el.className = `cal-point is-${d}`;
      el.innerHTML = `${ARROW}<span>${parts.join(" · ")}${where}</span>`;
      el.setAttribute("aria-label", `${parts.join(", ")}${where}, out of view. Show me.`);
      const pos = d === "up" ? { left: `${cx}px`, top: `${vb.top + 10}px` }
        : d === "down" ? { left: `${cx}px`, bottom: `${lift}px` }
        : d === "left" ? { left: `${vb.left + 8}px`, top: `${cy}px` }
        : { right: `${window.innerWidth - vb.right + 8}px`, top: `${cy}px` };
      Object.assign(el.style, pos);
      const p = { el, d, list, born: performance.now(), near: list.reduce((a, o) => (dist(o.r) < dist(a.r) ? o : a)) };
      el.addEventListener("click", () => go(p, root));
      document.body.appendChild(el);
      points.push(p);
    });
    pointT = setTimeout(clearPoints, 12000);
  }
  // scrolled there by hand: show them and drop the pointer
  function checkPoints() {
    if (!points.length || pointRaf) return;
    pointRaf = requestAnimationFrame(() => {
      pointRaf = 0;
      const vb = viewBox(), root = state.view === "year" ? yp : mv;
      points.slice().forEach(p => { if (performance.now() - p.born > 400 && p.list.some(o => onScreen(targetRect(o, root), vb))) reveal(p, root); });
    });
  }
  yp.addEventListener("scroll", checkPoints, { passive: true });
  window.addEventListener("scroll", checkPoints, { passive: true });
  const delta = $("[data-delta]");
  let deltaT;
  function announce(prev, next, delay = 0) {
    let added = 0, removed = 0;
    next.forEach(id => { if (!prev.has(id)) added++; });
    prev.forEach(id => { if (!next.has(id)) removed++; });
    const parts = [];
    if (added) parts.push(`<b class="plus">+${added}</b> shown`);
    if (removed) parts.push(`<b class="minus">−${removed}</b> hidden`);
    const html = (parts.length ? parts.join(" · ") : "Nothing changed. Bold move.") + ` <span>· ${next.size} events</span>`;
    clearTimeout(deltaT);
    const show = () => {
      delta.innerHTML = html;
      delta.classList.add("is-on");
      // held back for the wave: pop up with a little spray as it passes
      if (delay) { const r = delta.getBoundingClientRect(); spray(r.left + r.width / 2, r.top + 4, { n: 8, size: .7, power: .6 }); }
      deltaT = setTimeout(() => delta.classList.toggle("is-on", false), 2600);
    };
    if (delay) deltaT = setTimeout(show, delay); else show();
  }
  function render(opts = {}) {
    const evts = visible(), ids = new Set(evts.map(e => e.id));
    const root = state.view === "year" ? yp : mv;
    clearPoints();
    // snapshot even under reduced motion: the off-screen pointers are information, not decoration
    const before = opts.fx ? snapshot(root) : null;
    const a = opts.fx ? anchor(root) : null;
    if (state.view === "year") renderYear(evts, opts.intro && !reduce); else renderMonths(evts, opts.intro && !reduce);
    reanchor(root, a);
    let hold = 0;
    if (before) {
      const ch = changes(root, before, viewBox());
      if (!reduce) hold = play(root, ch);
      pointTo(root, ch.offs);
    }
    if (opts.fx) announce(shownIds, ids, hold);
    shownIds = ids;
  }
  function setView(v, monthIdx) {
    state.view = v; store.set("view", v); syncUrl();
    yp.hidden = v !== "year"; mv.hidden = v !== "month";
    document.documentElement.classList.toggle("cal-lock", v === "year");
    syncPressed(); renderHints(); size(); render({ intro: true });
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

  /* "Today" only appears once today has scrolled out of sight. */
  const todayBtn = $("[data-today]");
  todayBtn.addEventListener("click", () => {
    if (state.view === "year") scrollYearToToday(true);
    else scrollToMonth(Math.max(0, months.findIndex(isNow)), true);
  });
  function updateToday() {
    if (!booted) return;
    const el = state.view === "year" ? $(".cal-cell.is-today", yp) : $(".mcard.is-now", mv);
    const away = !!el && !onScreen(el.getBoundingClientRect(), viewBox());
    if (todayBtn.hidden === away) todayBtn.hidden = !away;
  }

  /* ---------- Tips: each disappears once it has been done, and never comes back ---------- */
  const hintEl = $("[data-hint]");
  const HINTS = touch
    ? [["tap", "Tap any event for the juicy details"], ["swipe", "Swipe around: it's a big year"], ["filter", "More events are hiding under Filter"]]
    : [["tap", "Click any event for the juicy details"], ["swipe", "Drag or scroll to move around"], ["zoom", "Ctrl + scroll to zoom"], ["filter", "More events are hiding under Filter"]];
  const done = new Set(store.get("hints", []));
  let touring = false;
  function renderHints() {
    const left = touring ? [] : HINTS.filter(([k]) => !done.has(k) && !(k === "zoom" && state.view !== "year"));
    hintEl.hidden = !left.length;
    // phones: one tip at a time (the next appears when this one is done)
    hintEl.innerHTML = `<b class="hint-k" aria-hidden="true">Tip</b>` + (mq.matches ? left.slice(0, 1) : left).map(([k, t]) => `<span data-h="${k}">${t}</span>`).join("") +
      (left.length ? `<button type="button" class="hint-x" data-hint-close aria-label="Hide tips"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>` : "");
  }
  function hintDone(k) {
    if (done.has(k)) return;
    done.add(k); store.set("hints", [...done]);
    const el = $(`[data-h="${k}"]`, hintEl);
    if (!el) return;
    const finish = () => { renderHints(); size(); };
    if (reduce) finish();
    else el.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-4px)" }], { duration: 300, easing: "ease-in" }).finished.then(finish, finish);
  }
  hintEl.addEventListener("click", ev => {
    if (!ev.target.closest("[data-hint-close]")) return;
    HINTS.forEach(([k]) => done.add(k)); store.set("hints", [...done]); renderHints(); size();
  });

  /* ---------- First-visit tour: a spotlight walks through the toolbar, then an event ----------
     Shown once (btscal.tour); "Show me around again" in the Filter sheet replays it. Tips take over afterwards. */
  const tourEl = $("[data-tour]"), spot = $("[data-tour-spot]"), card = $("[data-tour-card]");
  const TOUR = [
    { h: "Welcome aboard", p: "Your whole ILCA season on one screen. Quick tour? It's shorter than a general recall." },
    { t: ".seg-rig", h: "Pick your rig", p: "4, 6 or 7 and we'll hide what isn't for you. “All” is for nosy parents and coaches." },
    { t: "[data-filter-open]", h: "Choose what shows", p: "You're starting on the essentials: our training, National Opens, championships and deadlines. Internationals and the rest are hiding in here." },
    { t: ".seg-view", h: "Year or months", p: "Year plan for the big picture, Months for a list you can actually read. Swap whenever." },
    { t: "BAR", h: "Tap any event", p: "Dates, when entries close, a reminder so you don't miss them, and our venue guide where we have one." },
    { h: "That's it!", p: "Lost somewhere in 2027? The Today button brings you home. Off you go.", last: true }
  ];
  let tStep = 0;
  function tourTarget(step) {
    if (!step.t) return null;
    if (step.t !== "BAR") { const el = $(step.t); return el && el.offsetParent ? el : null; }
    const vb = viewBox();
    const bars = $$(".cal-bar[data-id], .mlist button[data-id]", state.view === "year" ? yp : mv).filter(b => onScreen(b.getBoundingClientRect(), vb));
    return bars.find(b => b.matches(".t-bts-camp:not(.is-past)")) || bars.find(b => !b.matches(".is-past")) || bars[0] || null;
  }
  function placeTour() {
    const step = TOUR[tStep], el = tourTarget(step);
    $("[data-tour-step]").textContent = `${tStep + 1} of ${TOUR.length}`;
    $("[data-tour-h]").textContent = step.h;
    $("[data-tour-p]").textContent = step.p;
    $("[data-tour-next]").textContent = step.last ? "Let's go" : tStep === 0 ? "Show me" : "Next";
    $("[data-tour-skip]").hidden = !!step.last;
    tourEl.classList.toggle("is-centred", !el);
    const cw = Math.min(340, window.innerWidth - 32);
    card.style.width = `${cw}px`;
    if (!el) { spot.style.cssText = ""; card.style.left = `${(window.innerWidth - cw) / 2}px`; card.style.top = `${Math.max(16, window.innerHeight / 2 - card.offsetHeight / 2)}px`; return; }
    const r = el.getBoundingClientRect(), pad = 6;
    Object.assign(spot.style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    const below = r.bottom + 14, ch = card.offsetHeight;
    const top = below + ch < window.innerHeight - 12 ? below : Math.max(12, r.top - ch - 14);
    card.style.top = `${top}px`;
    card.style.left = `${Math.max(16, Math.min(window.innerWidth - cw - 16, r.left + r.width / 2 - cw / 2))}px`;
  }
  function startTour() {
    touring = true; tStep = 0; renderHints(); size();
    tourEl.hidden = false; placeTour();
    $("[data-tour-next]").focus({ preventScroll: true });
  }
  function endTour() {
    touring = false; tourEl.hidden = true; store.set("tour", 1);
    renderHints(); size();
  }
  $("[data-tour-next]").addEventListener("click", () => {
    if (TOUR[tStep].last) { endTour(); return; }
    tStep++; placeTour();
    if (!reduce) card.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: EASE });
  });
  $("[data-tour-skip]").addEventListener("click", endTour);
  tourEl.addEventListener("keydown", ev => { if (ev.key === "Escape") endTour(); });
  window.addEventListener("resize", () => { if (touring) placeTour(); });
  $("[data-tour-replay]").addEventListener("click", () => { closeFilter(); setTimeout(startTour, 250); });

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
  /* Online booking (beta): camps open in the booking sheet, with price today and places left. */
  const BK = window.BTSBook;
  const bookable = {};
  if (BK && BK.mode !== "off") {
    BK.camps().then(list => {
      list.forEach(c => { bookable[c.camp_id] = c; });
      if (current && sheet.open) openSheet(current);
    }).catch(() => { /* fall back to the booking form */ });
  }
  function relative(e) {
    const s = C.parse(e.start), t = C.parse(e.end);
    if (t < C.today) return "Done and dusted";
    if (s <= C.today) return "Happening right now";
    const d = C.diff(s, C.today);
    return d === 1 ? "Tomorrow! Pack the boat" : d < 14 ? `In ${d} days` : d < 60 ? `In ${Math.round(d / 7)} weeks` : `In ${Math.round(d / 30.4)} months`;
  }
  const ICON = {
    cal: `<svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2 7h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8 9v3.4M6.3 10.7h3.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    bell: `<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z M10 20.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`
  };
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
    const finished = C.parse(e.end) < C.today;
    const cl = closeOf(e), clDays = cl ? C.diff(cl.date, C.today) : null;
    const facts = [];
    if (e.venue) facts.push(["Venue", C.esc(e.venue)]);
    facts.push(["Rigs", C.esc(C.rigText(e)) + (e.type === "ilca-uk-training" && !e.rigs.length ? " (places by ranking/entry)" : "")]);
    const online = e.type === "bts-camp" && bookable[e.id];
    if (online) {
      facts.push(["Price", `${BK.fmt.money(online.price_now)} per sailor${online.late_now ? " (includes late booking fee)" : ""}`]);
      if (BK.fmt.placesText(online)) facts.push(["Places", `<b>${C.esc(BK.fmt.placesText(online))}</b>`]);
    }
    // entry close: one line, not a whole box (the bell button below sets the reminder)
    if (cl && e.type !== "deadline" && !finished) {
      const when = clDays < 0 ? "closed" : clDays === 0 ? "today!" : clDays === 1 ? "tomorrow!" : clDays < 60 ? `in ${clDays} days` : `in ${Math.round(clDays / 7)} weeks`;
      facts.push(["Entries close", `<span class="${clDays >= 0 && clDays <= 7 ? "warn" : ""}">${cl.est ? "Usually " : ""}${fmtDay(cl.date)}</span> <span class="muted">· ${when}${cl.est ? " · the Sunday before, as a rule" : ""}</span>`]);
    }
    if (e.note) facts.push(["Notes", C.esc(e.note)]);
    if (e.checkNor) facts.push(["Check", `<span class="warn">Rigs vary by event, so check the NoR</span>`]);
    if (e.placeholder) facts.push(["Status", `<span class="warn">Dates still being cooked up. Not bookable yet.</span>`]);
    else if (e.status === "provisional") facts.push(["Status", `<span class="warn">Provisional: dates or venue may still move</span>`]);
    // NoR / SI: links when published, one quiet line when not (BTS camps don't have them)
    const docs = [["nor", "Notice of Race"], ["si", "Sailing Instructions"]].filter(([k]) => e[k]);
    if (docs.length) facts.push(["Docs", docs.map(([k, label]) => `<a class="doc-chip" href="${C.esc(e[k])}" target="_blank" rel="noopener">${label} ↗</a>`).join(" ")]);
    else if (e.type !== "bts-camp" && e.type !== "deadline" && !finished) facts.push(["NoR", `<span class="muted">They haven't published it yet. We'll pop it here when they do.</span>`]);
    $("[data-sheet-facts]").innerHTML = facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");

    const actions = [];
    // Every dated BTS camp books through the new booking page (it explains when a camp isn't open online yet)
    if (e.type === "bts-camp" && e.placeholder) actions.push(`<a class="btn btn-accent" href="https://chat.whatsapp.com/Ela5XJPNzAq9mNSzR45p3q" target="_blank" rel="noopener">Register interest ↗</a>`);
    else if (e.type === "bts-camp" && !finished) actions.push(`<a class="btn btn-accent arrow" href="../book/?camp=${encodeURIComponent(e.id)}">Book with BTS${online ? ` <span class="beta-tag">Online</span>` : ""}</a>`);
    else if (e.type !== "bts-camp" && e.url) actions.push(`<a class="btn btn-accent" href="${C.esc(e.url)}" target="_blank" rel="noopener">Event page ↗</a>`);
    if (cl && clDays >= 1) actions.push(`<button type="button" class="act-btn" data-pop="remind" aria-expanded="false">${ICON.bell}<span>Remind me</span></button>`);
    if (!finished) actions.push(`<button type="button" class="act-btn act-ic" data-pop="cal" aria-expanded="false" aria-label="Add to calendar" title="Add to calendar">${ICON.cal}</button>`);
    $("[data-sheet-actions]").innerHTML = actions.join("");
    const pop = $("[data-sheet-pop]");
    pop.hidden = true; pop.innerHTML = "";

    renderWho(e, finished);
    renderVenue(e);
    if (!sheet.open) sheet.showModal();
    sheet.scrollTop = 0;
    hintDone("tap");
    history.replaceState(null, "", `#event=${encodeURIComponent(id)}`);
  }
  /* Small panel under the action row: "add to calendar" or "remind me", each with Google / Apple / Outlook */
  function showPop(kind, btn) {
    const pop = $("[data-sheet-pop]"), e = byId[current];
    const wasOpen = !pop.hidden && pop.dataset.kind === kind;
    $$("[data-pop]", sheet).forEach(b => b.setAttribute("aria-expanded", "false"));
    if (wasOpen) { pop.hidden = true; return; }
    pop.dataset.kind = kind;
    if (kind === "cal") {
      pop.innerHTML = `<p>Pop it in your calendar:</p><div class="pop-btns">
        <a class="btn btn-line" href="${C.esc(C.gcal(e))}" target="_blank" rel="noopener">Google</a>
        <button type="button" class="btn btn-line" data-ics>Apple</button>
        <button type="button" class="btn btn-line" data-ics>Outlook</button></div>`;
    } else {
      const cl = closeOf(e);
      pop.innerHTML = `<p>We'll nudge you at 9am on ${fmtDay(C.addDays(cl.date, -1))}, the day before ${e.type === "deadline" ? "the deadline" : "entries close"}. No more “wait, it closed?!”</p><div class="pop-btns">
        <a class="btn btn-line" href="${C.esc(C.reminderGcal(reminderFor(e, cl)))}" target="_blank" rel="noopener" data-remind-set>Google</a>
        <button type="button" class="btn btn-line" data-remind-ics>Apple</button>
        <button type="button" class="btn btn-line" data-remind-ics>Outlook</button></div>`;
    }
    pop.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    if (!reduce) pop.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 240, easing: EASE });
  }

  /* ---------- Entry-close reminder ----------
     `entryClose` (ISO) on an event wins. National Opens without one close, as a rule, on the Sunday
     before the event (James, 12 Nov), shown as "Usually …"; deadline events remind for themselves. */
  const sundayBefore = d => C.addDays(d, -(d.getDay() || 7));
  function closeOf(e) {
    if (e.entryClose) return { date: C.parse(e.entryClose), est: false, what: "Entries close" };
    if (e.type === "deadline") return { date: C.parse(e.start), est: false, what: e.name };
    if (e.type === "national-open" && /^no\d$/.test(e.id)) return { date: sundayBefore(C.parse(e.start)), est: true, what: "Entries close" };
    return null;
  }
  const fmtDay = d => `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]} ${d.getDate()} ${C.MONTHS[d.getMonth()]}`;
  function reminderFor(e, cl) {
    const short = e.short || e.name;
    const what = e.type === "deadline" ? e.name : `${e.name} entries close`;
    return {
      id: e.id, date: C.iso(C.addDays(cl.date, -1)), url: e.url || "",
      title: e.type === "deadline" ? `Tomorrow: ${e.name}` : `${short}: entries close tomorrow`,
      details: `${what} on ${fmtDay(cl.date)}${cl.est ? " (usually the Sunday before: check the exact time on the event page)" : ""}. Event ${C.range(e)}${e.venue ? " at " + e.venue : ""}. Reminder from the Beyond the Shift season calendar.`
    };
  }

  /* ---------- Who's going (signed-in parents, BTS camps) ---------- */
  function renderWho(e, finished) {
    const host = $("[data-sheet-who]");
    host.innerHTML = "";
    if (e.type !== "bts-camp" || e.placeholder || !BK || BK.mode === "off") return;
    if (!BK.signedIn) {
      if (!finished) host.innerHTML = `<p class="who-signin"><a href="../account/">Sign in</a> to see who's booked (and who's still “thinking about it”).</p>`;
      return;
    }
    host.innerHTML = `<p class="docs-title">Who's going</p><div data-who-list></div>`;
    if (window.BTSUI) window.BTSUI.who($("[data-who-list]", host), e.id);
  }

  /* ---------- Venue guide: icon tiles, straight under the buttons ---------- */
  const VG_IC = {
    pays: `<path d="M12 3v18M12 3l-4 4M12 3l4 4"/><path d="M4 15c2.5-1.6 5-1.6 8 0s5.5 1.6 8 0"/>`,
    rose: `<circle cx="12" cy="12" r="8.5"/><path d="M12 4.5l2.3 7.5L12 19.5 9.7 12z" fill="currentColor" stroke="none"/>`,
    tide: `<path d="M3 9c2.5-2 4.5-2 7 0s4.5 2 7 0 3-1 4-.5"/><path d="M3 15c2.5-2 4.5-2 7 0s4.5 2 7 0 3-1 4-.5"/>`,
    slip: `<path d="M3 18l18-8"/><path d="M8 13.5l3-9 3 7z"/><path d="M4 21h16"/>`,
    parent: `<circle cx="8" cy="6.5" r="2.5"/><circle cx="16.5" cy="9" r="2"/><path d="M3.5 20v-3.5a4.5 4.5 0 0 1 9 0V20M13 20v-2.5a3.5 3.5 0 0 1 7 0V20"/>`,
    bed: `<path d="M3 19V7M3 15h18v4M3 11h7a3 3 0 0 1 3 3v1M14 11h4.5a2.5 2.5 0 0 1 2.5 2.5V15"/>`
  };
  function renderVenue(e) {
    const host = $("[data-sheet-venue]");
    const v = e.venue && (window.BTS_VENUES || []).find(x => x.match.test(e.venue));
    host.hidden = !v;
    if (!v) { host.innerHTML = ""; return; }
    const base = "../" + v.url;
    host.innerHTML = `<a class="vg-head" href="${base}"><span><small>Venue guide</small><b>${C.esc(v.name)}</b><em>${C.esc(v.tagline || v.place)}</em></span><span class="vg-go" aria-hidden="true">Open →</span></a>
      <ul class="vg-tiles">${v.parts.map(([id, t, d, ic]) => `<li><a class="vg-tile vg-${ic || "pays"}" href="${base}#${id}"><svg viewBox="0 0 24 24" aria-hidden="true">${VG_IC[ic] || VG_IC.pays}</svg><b>${C.esc(t)}</b><small>${C.esc(d)}</small></a></li>`).join("")}</ul>`;
  }
  function closeSheet() { sheet.close(); }
  sheet.addEventListener("close", () => {
    if (sheet.open) return; // reopened before the close event ran
    current = null; history.replaceState(null, "", location.pathname + location.search);
  });
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
    if (ev.target.closest("[data-ics]")) { const e = byId[current]; C.download(`${e.id}.ics`, C.ics(e)); }
    const pb = ev.target.closest("[data-pop]");
    if (pb) showPop(pb.dataset.pop, pb);
    const rIcs = ev.target.closest("[data-remind-ics]");
    if (rIcs || ev.target.closest("[data-remind-set]")) {
      const e = byId[current];
      if (rIcs) C.download(`${e.id}-reminder.ics`, C.reminderIcs(reminderFor(e, closeOf(e))));
      const rb = $('[data-pop="remind"]', sheet);
      if (rb) { rb.classList.add("is-set"); rb.innerHTML = `${ICON.bell}<span>Reminder set ✓</span>`; rb.setAttribute("aria-expanded", "false"); }
      $("[data-sheet-pop]", sheet).hidden = true;
    }
  });
  // swipe down to close on mobile (only when the sheet is scrolled to the top)
  swipeToClose(sheet, closeSheet);
  function swipeToClose(dlg, close) {
    let sy = null;
    dlg.addEventListener("touchstart", ev => { sy = dlg.scrollTop <= 0 ? ev.touches[0].clientY : null; }, { passive: true });
    dlg.addEventListener("touchend", ev => { if (sy != null && ev.changedTouches[0].clientY - sy > 80) close(); sy = null; });
  }
  sheet.addEventListener("keydown", ev => {
    if (ev.key === "ArrowRight") $('[data-sheet-step="1"]').click();
    if (ev.key === "ArrowLeft") $('[data-sheet-step="-1"]').click();
  });

  document.addEventListener("click", ev => {
    const hit = ev.target.closest(".cal-bar[data-id], .mlist button[data-id]");
    if (hit) openSheet(hit.dataset.id);
  });

  /* ---------- nav (shared look, minimal JS) ---------- */
  // booking/ui.js already wires the menu button when it is loaded; don't toggle twice
  const nav = $("[data-nav]"), toggle = $("[data-nav-toggle]");
  if (!window.BTSUI) toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));

  /* ---------- boot ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  renderChips();
  renderHints();
  syncPressed();
  setView(state.view);
  // start counting the viewer's own scrolling only after our scroll-to-today has settled (fonts + smooth scroll)
  Promise.race([document.fonts ? document.fonts.ready : null, new Promise(r => setTimeout(r, 1500))].filter(Boolean))
    .then(() => setTimeout(() => {
      booted = true; updateToday();
      if (!store.get("tour", 0) && !/event=/.test(location.hash)) startTour();
    }, 800));
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
