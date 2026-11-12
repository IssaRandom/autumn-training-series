/* Venue guide template parts: map pins, wind picker, wind rose, cost calculator, events at this venue.
   Loaded after ../advice/advice.js (nav, contents, progress). Each part is optional. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---- Map pins <-> legend ---- */
  const map = $("[data-map]");
  if (map) {
    const set = n => $$("[data-pin]", map).forEach(el => el.classList.toggle("is-on", el.dataset.pin === n));
    map.addEventListener("pointerover", ev => { const t = ev.target.closest("[data-pin]"); if (t) set(t.dataset.pin); });
    map.addEventListener("pointerleave", () => set(null));
    map.addEventListener("click", ev => { const t = ev.target.closest("[data-pin]"); if (t) set(t.dataset.pin); });
  }

  /* ---- Wind picker ---- */
  const wind = $("[data-wind]");
  if (wind) {
    const tabs = $$("[data-dir]", wind);
    const panels = $$("[data-panel]", wind);
    const has = new Set(panels.map(p => p.dataset.panel));
    const core = $(".wind-core", wind);
    tabs.forEach(t => {
      const id = "wind-" + t.dataset.dir;
      t.id = id;
      if (has.has(t.dataset.dir)) t.classList.add("has-notes");
    });
    const show = dir => {
      const key = has.has(dir) ? dir : "soon";
      tabs.forEach(t => { const on = t.dataset.dir === dir; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
      panels.forEach(p => { p.hidden = p.dataset.panel !== key; if (!p.hidden) p.setAttribute("aria-labelledby", "wind-" + dir); });
      const soon = $("[data-soon-dir]", wind);
      if (soon) soon.textContent = dir;
      const tab = tabs.find(t => t.dataset.dir === dir);
      core.style.setProperty("--wa", tab.style.getPropertyValue("--a"));
      $("[data-wind-label]", wind).textContent = dir;
    };
    wind.addEventListener("click", ev => { const t = ev.target.closest("[data-dir]"); if (t) show(t.dataset.dir); });
    // arrow keys move round the compass (clockwise order)
    const ring = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    wind.addEventListener("keydown", ev => {
      const t = ev.target.closest("[data-dir]");
      if (!t || !["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(ev.key)) return;
      ev.preventDefault();
      const step = ev.key === "ArrowRight" || ev.key === "ArrowDown" ? 1 : -1;
      const next = ring[(ring.indexOf(t.dataset.dir) + step + 8) % 8];
      show(next);
      tabs.find(b => b.dataset.dir === next).focus();
    });
    show((location.hash.match(/wind=(\w+)/) || [])[1] || "SW");
  }

  /* ---- Wind rose (SVG from data-rose="N:9,NE:11,...") ---- */
  $$("[data-rose]").forEach(el => {
    const vals = el.dataset.rose.split(",").map(p => { const [d, v] = p.split(":"); return { d, v: Number(v) }; });
    const max = Math.max(...vals.map(x => x.v));
    const R = 120, c = 150, n = vals.length, half = Math.PI / n * 0.82;
    const pt = (r, a) => `${(c + r * Math.sin(a)).toFixed(1)},${(c - r * Math.cos(a)).toFixed(1)}`;
    const rings = [0.33, 0.66, 1].map(f => `<circle cx="${c}" cy="${c}" r="${R * f}" fill="none" style="stroke:var(--line-strong)"/>`).join("");
    const wedges = vals.map((x, i) => {
      const a = i * 2 * Math.PI / n, r = 18 + (R - 18) * x.v / max;
      const top = x.v === max;
      return `<path d="M${pt(18, a - half)} L${pt(r, a - half)} A${r} ${r} 0 0 1 ${pt(r, a + half)} L${pt(18, a + half)} A18 18 0 0 0 ${pt(18, a - half)}Z" style="fill:${top ? "var(--accent)" : "var(--blue-300)"};fill-opacity:${top ? 1 : .45}"><title>${x.d}: ${x.v}%</title></path>` +
        `<text x="${pt(R + 18, a).split(",")[0]}" y="${pt(R + 18, a).split(",")[1]}" style="fill:${top ? "var(--heading)" : "var(--muted)"}" font-size="12" font-weight="800" text-anchor="middle" dominant-baseline="middle">${x.d}</text>`;
    }).join("");
    el.innerHTML = `<svg viewBox="0 0 300 300" aria-hidden="true">${rings}${wedges}<circle cx="${c}" cy="${c}" r="16" style="fill:var(--bg)"/></svg>`;
  });

  /* ---- Cost calculator ---- */
  const calc = $("[data-calc]");
  if (calc) {
    const LITRES_PER_GALLON = 4.546;
    const gbp = n => "£" + Math.round(n).toLocaleString("en-GB");
    const run = () => {
      const v = {};
      $$("input", calc).forEach(i => { v[i.dataset.k] = Math.max(0, parseFloat(i.value) || 0); });
      const fuel = v.mpg ? (v.miles * 2 / v.mpg) * LITRES_PER_GALLON * v.ppl : 0;
      const stay = v.nights * v.night;
      $("[data-total]", calc).textContent = gbp(fuel + stay + v.entry + v.ferry);
      $("[data-break]", calc).textContent = `Fuel ${gbp(fuel)} return · stay ${gbp(stay)} · entry ${gbp(v.entry)}${v.ferry ? ` · ferry/tolls ${gbp(v.ferry)}` : ""}`;
    };
    calc.addEventListener("input", run);
    run();
  }

  /* ---- Events at this venue (data/events.js) ---- */
  const list = $("[data-venue-events]");
  if (list && window.BTS_EVENTS && window.BTSCal) {
    const C = window.BTSCal, re = new RegExp(list.dataset.venueMatch, "i");
    const evts = window.BTS_EVENTS
      .filter(e => re.test(e.venue || "") && !e.optional && C.parse(e.end) >= C.today && e.type !== "deadline")
      .sort((a, b) => C.parse(a.start) - C.parse(b.start))
      .slice(0, 8);
    const T = window.BTS_TYPES || {};
    list.innerHTML = evts.length ? evts.map(e => {
      const shared = /\//.test(e.venue) ? " · one of several venues" : "";
      return `<li><a class="t-${e.type}" href="../../calendar/#event=${encodeURIComponent(e.id)}">` +
        `<span class="sw" aria-hidden="true"></span><span class="d">${C.esc(C.range(e).replace(/ \d{4}$/, ""))}</span>` +
        `<span class="n">${C.esc(e.name)}<small>${C.esc((T[e.type] || {}).label || "")} · ${C.esc(C.rigText(e))}${shared}</small></span>` +
        `<span class="go" aria-hidden="true">→</span></a></li>`;
    }).join("") : `<li class="empty">No events listed here yet this season.</li>`;
  }

  /* links still waiting for a real URL */
  $$("[data-placeholder-link]").forEach(a => a.addEventListener("click", ev => ev.preventDefault()));
})();
