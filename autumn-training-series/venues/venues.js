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
    const types = list.dataset.venueTypes ? list.dataset.venueTypes.split(" ") : null;   /* James 16 Nov: Weymouth = NOs + BTS only */
    const evts = window.BTS_EVENTS
      .filter(e => re.test(e.venue || "") && !e.optional && C.parse(e.end) >= C.today && e.type !== "deadline" && (!types || types.includes(e.type)))
      .sort((a, b) => C.parse(a.start) - C.parse(b.start))
      .slice(0, 8);
    const T = window.BTS_TYPES || {};
    list.innerHTML = evts.length ? evts.map(e => {
      const shared = /\//.test(e.venue) ? " · one of several venues" : "";
      return `<li><a class="t-${e.type}" href="../../calendar/#event=${encodeURIComponent(e.id)}">` +
        `<span class="sw" aria-hidden="true"></span><span class="d">${C.esc(C.range(e).replace(/ \d{4}$/, ""))}</span>` +
        `<span class="n">${C.esc(e.name.replace(/^BTS\s+/, ""))}<small>${C.esc(e.type === "bts-camp" ? "Training" : (T[e.type] || {}).label || "")} · ${C.esc(C.rigText(e))}${shared}</small></span>` +
        `<span class="go" aria-hidden="true">→</span></a></li>`;
    }).join("") : `<li class="empty">No events listed here yet this season.</li>`;
  }

  /* links still waiting for a real URL */
  $$("[data-placeholder-link]").forEach(a => a.addEventListener("click", ev => ev.preventDefault()));

  /* ---- Nav: steps aside while reading down, back on the first scroll up (James 15 Nov, same as New to ILCAs) ---- */
  const nav = $("[data-nav]"), toc = $("[data-toc]");
  if (nav && document.body.classList.contains("venue-page")) {
    let lastY = window.scrollY;
    window.addEventListener("scroll", () => {
      const y = window.scrollY, d = y - lastY;
      if (Math.abs(d) < 4 && y > 80) return;
      const busy = nav.classList.contains("is-open") || (toc && toc.classList.contains("is-open"));
      document.body.classList.toggle("nav-hid", y > 80 && d > 0 && !busy);
      lastY = y;
    }, { passive: true });
  }

  const still = matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- Tidal stream atlas: one chart per hour, HW-6 to HW+6 (James 16 Nov) ---- */
  const atlas = $("[data-tide-atlas]");
  if (atlas) {
    const imgs = $$("img[data-hw]", atlas), range = $("[data-ta-range]", atlas), badge = $("[data-ta-label]", atlas);
    const playBtn = $("[data-ta-play]", atlas), playT = $("[data-ta-play-t]", atlas);
    const say = h => h === 0 ? "High water Portland" : `${Math.abs(h)} hour${Math.abs(h) > 1 ? "s" : ""} ${h < 0 ? "before" : "after"} HW Portland`;
    const show = h => {
      imgs.forEach(im => im.classList.toggle("is-on", Number(im.dataset.hw) === h));
      range.value = h; badge.textContent = say(h);
      range.style.setProperty("--p", ((h + 6) / 12 * 100) + "%");
      range.setAttribute("aria-valuetext", say(h));
    };
    let timer = null;
    const stop = () => { clearInterval(timer); timer = null; playBtn.setAttribute("aria-pressed", "false"); playT.textContent = "Play the tide"; };
    playBtn.addEventListener("click", () => {
      if (timer) { stop(); return; }
      playBtn.setAttribute("aria-pressed", "true"); playT.textContent = "Pause";
      imgs.forEach(im => { im.loading = "eager"; });
      timer = setInterval(() => { const h = Number(range.value); show(h >= 6 ? -6 : h + 1); }, still.matches ? 1600 : 900);
    });
    range.addEventListener("input", () => { stop(); show(Number(range.value)); });
    /* all 13 charts load once the atlas is near, so scrubbing never waits */
    const io = "IntersectionObserver" in window && new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { io.disconnect(); imgs.forEach(im => { im.loading = "eager"; }); }
    }, { rootMargin: "500px 0px" });
    if (io) io.observe(atlas); else imgs.forEach(im => { im.loading = "eager"; });
    show(-6);
  }

  /* ---- Site plan walk: plan pinned under the nav; the step being read zooms it to its area ---- */
  const walk = $("[data-plan-walk]");
  if (walk && "IntersectionObserver" in window) {
    walk.classList.add("pw-on");
    const pic = $("[data-pw-pic]", walk), steps = $$(".pw-step", walk), hls = $$("[data-hl]", walk);
    const focus = key => {
      steps.forEach(s => s.classList.toggle("is-on", s.dataset.focus === key));
      hls.forEach(h => h.classList.toggle("is-on", h.dataset.hl === key));
      const box = hls.find(h => h.dataset.hl === key);
      walk.classList.toggle("pw-dim", !!box);
      if (!box) { pic.style.transform = ""; return; }
      const v = k => parseFloat(box.style.getPropertyValue("--" + k));
      const x = v("x"), y = v("y"), w = v("w"), h = v("h");
      const s = Math.min(2.6, Math.max(1, 70 / Math.max(w, h)));
      const cx = x + w / 2, cy = y + h / 2;
      /* keep the zoomed picture covering the frame: clamp the centre */
      const half = 50 / s, ccx = Math.min(100 - half, Math.max(half, cx)), ccy = Math.min(100 - half, Math.max(half, cy));
      pic.style.transform = `scale(${s.toFixed(3)}) translate(${(50 - ccx).toFixed(2)}%, ${(50 - ccy).toFixed(2)}%)`;
    };
    const io = new IntersectionObserver(es => {
      const vis = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis.length) focus(vis[0].target.dataset.focus);
    }, { rootMargin: "-55% 0px -35% 0px" });
    steps.forEach(s => io.observe(s));
    steps.forEach(s => s.addEventListener("click", () => focus(s.dataset.focus)));
    /* stuck = the walk has scrolled past the pin line and the plan hasn't reached its end yet; only then does it slide up with the nav */
    const stage = $(".pw-stage", walk);
    const stuck = () => {
      const r = walk.getBoundingClientRect(), t = parseFloat(getComputedStyle(stage).top) || 0;
      stage.classList.toggle("is-stuck", r.top < t && r.bottom > t + stage.offsetHeight + 1);
    };
    window.addEventListener("scroll", stuck, { passive: true });
    window.addEventListener("resize", stuck);
    stuck();
  }

  /* ---- Our picks map: coastline from geo.js + a pin per card; cards and pins drive each other ---- */
  const initRecs = () => {
  const recs = $("[data-recs]");
  if (recs && window.WEY_GEO) {
    const G = window.WEY_GEO, mapEl = $("[data-recs-map]", recs), rail = $("[data-recs-rail]", recs);
    const cards = $$(".rec", rail), chips = $$(".recs-chip", recs);
    const NS = "http://www.w3.org/2000/svg";
    const HOME = [-2900, -3700, 4400, 6400];   /* Weymouth town down to Portland House */
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", HOME.join(" "));
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Map of Weymouth and Portland with our picks pinned");
    svg.innerHTML = `<rect class="rm-sea" x="-20000" y="-20000" width="40000" height="40000"/>` +
      `<path class="rm-land" d="${G.land}"/>` + (G.walls || []).map(d => `<path class="rm-wall" d="${d}"/>`).join("") +
      [["Weymouth", -2300, -3350], ["Portland Harbour", 600, 400], ["Portland", -150, 3600], ["Weymouth Bay", 900, -2300], ["WPNSA", -1500, 1150]]
        .map(([t, x, y]) => `<text class="rm-lbl${t === "WPNSA" ? " rm-spot" : ""}" x="${x}" y="${y}">${t}</text>`).join("") +
      `<g class="rm-pins"></g>`;
    mapEl.append(svg);
    const pinsG = svg.querySelector(".rm-pins");
    const pins = cards.map((c, i) => {
      if (!c.dataset.x) return null;
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "rm-pin " + Array.from(c.classList).filter(k => k.startsWith("c-")).join(" ") + (c.dataset.zone ? " rm-zone" : ""));
      g.setAttribute("transform", `translate(${c.dataset.x} ${c.dataset.y})`);
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
      g.setAttribute("aria-label", $("h3", c).textContent);
      g.innerHTML = (c.dataset.zone ? `<circle class="rm-area" r="170"/>` : "") + `<circle class="rm-ring" r="1"/><circle class="rm-dot" r="1"/><text class="rm-name"></text>`;
      g.querySelector(".rm-name").textContent = $("h3", c).textContent;
      g.addEventListener("click", () => pick(i, true));
      g.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(i, true); } });
      pinsG.append(g);
      return g;
    });
    /* pins keep the same size on screen whatever the zoom */
    let vb = HOME.slice(), anim = 0;
    const sizePins = () => {
      const px = vb[2] / Math.max(1, mapEl.clientWidth);
      pins.forEach((p, i) => { if (!p) return; const on = p.classList.contains("is-on");
        p.querySelector(".rm-dot").setAttribute("r", (on ? 9 : 7) * px); p.querySelector(".rm-ring").setAttribute("r", (on ? 17 : 10) * px);
        const nm = p.querySelector(".rm-name"); nm.setAttribute("font-size", 13 * px); nm.setAttribute("x", 22 * px); nm.setAttribute("y", 4.5 * px); });
      svg.querySelectorAll(".rm-lbl").forEach(t => t.setAttribute("font-size", 12 * px));
    };
    const fly = to => {
      cancelAnimationFrame(anim);
      const from = vb.slice(), t0 = performance.now(), dur = still.matches ? 0 : 650;
      const step = now => {
        const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
        vb = from.map((v, j) => v + (to[j] - v) * e);
        svg.setAttribute("viewBox", vb.map(n => n.toFixed(1)).join(" ")); sizePins();
        if (k < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    };
    const aspect = () => HOME[2] / HOME[3];
    let cur = -1;
    const pick = (i, fromPin) => {
      if (i === cur) return;
      cur = i;
      cards.forEach((c, j) => c.classList.toggle("is-on", j === i));
      pins.forEach((p, j) => p && p.classList.toggle("is-on", j === i));
      const c = cards[i];
      if (c && c.dataset.x) {
        const span = c.dataset.zone ? 1600 : 1300, w = span, h = span / aspect();
        fly([+c.dataset.x - w / 2, +c.dataset.y - h / 2, w, h]);
        pinsG.append(pins[i]);   /* active pin on top */
      } else fly(HOME);
      if (fromPin && c) {
        const horiz = getComputedStyle(rail).overflowX === "auto";
        if (horiz) rail.scrollTo({ left: c.offsetLeft - (rail.clientWidth - c.offsetWidth) / 2, behavior: still.matches ? "auto" : "smooth" });
        else rail.scrollTo({ top: c.offsetTop - rail.offsetTop - 8, behavior: still.matches ? "auto" : "smooth" });
      }
    };
    cards.forEach((c, i) => {
      c.addEventListener("click", ev => { if (!ev.target.closest("a")) pick(i); });
      c.addEventListener("pointerenter", ev => { if (ev.pointerType === "mouse") pick(i); });
    });
    /* phone rail: the card nearest the middle is the one on the map */
    let tick = 0;
    rail.addEventListener("scroll", () => {
      if (getComputedStyle(rail).overflowX !== "auto") return;
      clearTimeout(tick);
      tick = setTimeout(() => {
        const mid = rail.scrollLeft + rail.clientWidth / 2;
        let best = -1, bd = 1e9;
        cards.forEach((c, i) => { if (c.hidden) return; const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
        if (best > -1) pick(best);
      }, 90);
    }, { passive: true });
    chips.forEach(ch => ch.addEventListener("click", () => {
      const cat = ch.dataset.cat;
      chips.forEach(o => o.setAttribute("aria-pressed", String(o === ch)));
      cards.forEach((c, i) => {
        const show = cat === "all" || c.dataset.cat.split(" ").includes(cat);
        c.hidden = !show;
        if (pins[i]) pins[i].classList.toggle("is-off", !show);
      });
      cur = -1;
      const first = cards.findIndex(c => !c.hidden);
      rail.scrollTo({ left: 0, top: 0 });
      if (cat === "all") { cards.forEach(c => c.classList.remove("is-on")); pins.forEach(p => p && p.classList.remove("is-on")); fly(HOME); }
      else pick(first);
    }));
    new ResizeObserver(sizePins).observe(mapEl);
    sizePins();
  }
  };
  /* geo.js loads after this file */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initRecs); else initRecs();

  /* ---- Sticky notes: tilt, second half writes itself in, replays (same as the advice articles) ---- */
  const notesV = $$(".note");
  if (notesV.length) {
    notesV.forEach((note, i) => {
      note.style.setProperty("--tilt", i % 2 ? "1.4deg" : "-1.8deg");
      if (still.matches) return;
      const words = [];
      note.querySelectorAll("p:not(.note__label)").forEach(p => {
        const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), nodes = [];
        while (w.nextNode()) nodes.push(w.currentNode);
        nodes.forEach(t => {
          const frag = document.createDocumentFragment();
          t.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const sp = document.createElement("span"); sp.className = "wd"; sp.textContent = part; words.push(sp); frag.append(sp);
          });
          t.replaceWith(frag);
        });
      });
      const half = Math.floor(words.length / 2);
      words.forEach((w, k) => { if (k >= half) { w.classList.add("late"); w.style.setProperty("--d", k - half); } });
    });
    if ("IntersectionObserver" in window && !still.matches) {
      document.documentElement.classList.add("js-vnote");
      const enter = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-in"); }), { rootMargin: "0px 0px -12% 0px" });
      const leave = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) e.target.classList.remove("is-in"); }), { rootMargin: "40px 0px 40px 0px" });
      notesV.forEach(el => { enter.observe(el); leave.observe(el); });
    }
  }

  /* ---- Third-party widgets: load the script only when it gets near the screen ---- */
  $$("[data-lazy-script]").forEach(el => {
    const load = () => { const sc = document.createElement("script"); sc.src = el.dataset.lazyScript; sc.async = true; sc.setAttribute("data-cfasync", "false"); document.body.append(sc); };
    if (!("IntersectionObserver" in window)) { load(); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: "600px 0px" });
    io.observe(el.parentElement);
  });
})();
