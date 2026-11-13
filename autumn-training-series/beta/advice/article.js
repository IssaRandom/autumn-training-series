/* Article-design patterns for long advice guides. Pairs with article.css. No dependencies.
   - nav steps aside while reading down, comes back on the first scroll up
   - reveals for bands (18), charts (13), figure cards (03), sticky notes, polaroids, season board
     and the finish line (12); they reset once fully off screen, so they play again every time
   - sticky notes: the second half of the note "writes" itself in
   - FAQ mystery boxes: tap a crate to open it (answers stay findable with Ctrl+F where supported)
   - boatwork: sideways timeline (01 + 16); vertical scroll moves the cards across, the blueprint pans
   - towing: van drives the route down the UK as each stop's card passes
   - training: season board row for the paragraph being read lights up
   - phone contents pill: "n of N" count, and steps aside while something is pinned */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Sticky notes: tilt + split words (before reveals start) ---------- */
  document.querySelectorAll(".note").forEach((note, i) => {
    note.style.setProperty("--tilt", i % 2 ? "1.4deg" : "-1.8deg");
    if (reduce) return;
    const words = [];
    note.querySelectorAll("p:not(.note__label)").forEach(p => {
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(t => {
        const frag = document.createDocumentFragment();
        t.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const s = document.createElement("span");
          s.className = "wd";
          s.textContent = part;
          words.push(s);
          frag.append(s);
        });
        t.replaceWith(frag);
      });
    });
    const half = Math.floor(words.length / 2);   // first half is there already, the rest writes in
    words.forEach((w, k) => { if (k >= half) { w.classList.add("late"); w.style.setProperty("--d", k - half); } });
  });

  /* ---------- Reveals that replay ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    document.documentElement.classList.add("js-art");
    const targets = document.querySelectorAll(".band, .chart, .fig, .finish, .note, .polaroid, .season");
    const enter = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-in"); }), { rootMargin: "0px 0px -12% 0px" });
    const leave = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) e.target.classList.remove("is-in"); }), { rootMargin: "40px 0px 40px 0px" });
    targets.forEach(el => { enter.observe(el); leave.observe(el); });
  }

  /* ---------- FAQ mystery boxes ---------- */
  const faq = document.querySelector("[data-faq]");
  if (faq) {
    const boxes = [...faq.querySelectorAll(".box")];
    const allBtn = faq.querySelector("[data-faq-all]");
    const setBox = (li, open) => {
      li.classList.toggle("is-open", open);
      li.querySelector(".box__lid").setAttribute("aria-expanded", open);
      const a = li.querySelector(".box__a");
      if (open) a.removeAttribute("hidden"); else a.setAttribute("hidden", "onbeforematch" in a ? "until-found" : "");
    };
    const syncAll = () => { allBtn.textContent = boxes.every(b => b.classList.contains("is-open")) ? "Close all" : "Open all"; };
    boxes.forEach(li => {
      setBox(li, false);
      li.querySelector(".box__lid").addEventListener("click", () => { setBox(li, !li.classList.contains("is-open")); syncAll(); });
      li.querySelector(".box__a").addEventListener("beforematch", () => { setBox(li, true); syncAll(); });
    });
    allBtn.addEventListener("click", () => { const open = !boxes.every(b => b.classList.contains("is-open")); boxes.forEach(li => setBox(li, open)); syncAll(); });
  }

  /* ---------- Nav: hide on the way down, show on the way up ---------- */
  const nav = document.querySelector("[data-nav]");
  const toc = document.querySelector("[data-toc]");
  let lastY = window.scrollY;
  const navScroll = () => {
    const y = window.scrollY, d = y - lastY;
    if (Math.abs(d) < 4 && y > 80) return;
    const busy = (nav && nav.classList.contains("is-open")) || (toc && toc.classList.contains("is-open"));
    body.classList.toggle("nav-hid", y > 80 && d > 0 && !busy);
    lastY = y;
  };

  /* ---------- Boatwork: sideways timeline ---------- */
  const hz = document.querySelector("[data-hz]");
  const hzItems = hz ? [...hz.querySelectorAll("[data-diag-item]")] : [];
  const hzSpots = hz ? [...hz.querySelectorAll(".hz-spot")] : [];
  const hzDots = hz ? [...hz.querySelectorAll(".dots i")] : [];
  const hzCap = hz && hz.querySelector("[data-diag-cap]");
  const hzBoat = hz && hz.querySelector(".hz-boat");
  const names = hzItems.map(li => (li.querySelector("strong") || li).textContent.replace(/\s*→\s*$/, "").trim());
  const partX = hzItems.map((_, i) => { const s = hzSpots.find(sp => sp.dataset.part == i + 1); return s ? parseFloat(s.style.getPropertyValue("--x")) / 100 : .5; });
  let hzOn = false, hzStep = -1, L = {};
  const writeCap = n => {   /* text nodes only */
    if (!hzCap) return;
    const num = document.createElement("span");
    num.className = "n";
    num.textContent = `${n + 1} / ${hzItems.length}`;
    hzCap.replaceChildren(num, document.createTextNode(names[n]));
  };
  const layoutHz = () => {
    if (!hz) return;
    const vw = document.documentElement.clientWidth, vh = window.innerHeight, phone = vw < 760;
    L = { vw, vh, cw: phone ? Math.round(vw * .84) : Math.round(clamp(vw * .36, 340, 440)), gap: 16 };
    L.bw = phone ? vw * 1.9 : Math.min(vw * .94, (vh - 300) * 1.777, 1500);
    if (reduce || vh < 520) { hz.classList.remove("hz-on"); hzOn = false; return; }
    hz.classList.add("hz-on");
    hz.style.setProperty("--fw", vw + "px");
    hz.style.setProperty("--ml", -Math.round(hz.parentElement.getBoundingClientRect().left) + "px");
    hz.style.setProperty("--cw", L.cw + "px");
    hz.style.setProperty("--gap", L.gap + "px");
    hz.style.setProperty("--bw", L.bw + "px");
    const tallest = Math.max(...hzItems.map(li => li.offsetHeight));
    if (tallest > vh - 110) { hz.classList.remove("hz-on"); hzOn = false; return; }   // too short a screen: plain list
    hzOn = true;
    hz.style.setProperty("--hz-h", Math.round(vh + (hzItems.length - 1) * vh * .6) + "px");
    hzStep = -1;
  };
  const updateHz = () => {
    if (!hzOn) return false;
    const r = hz.getBoundingClientRect(), n = hzItems.length;
    const p = clamp(-r.top / (hz.offsetHeight - L.vh), 0, 1), f = p * (n - 1);
    const i = Math.min(n - 2, Math.floor(f)), t = f - i;
    hz.style.setProperty("--tx", ((L.vw - L.cw) / 2 - f * (L.cw + L.gap)) + "px");
    const x = (partX[i] + (partX[i + 1] - partX[i]) * t) * L.bw;
    let bx = L.vw / 2 - x;
    if (L.bw > L.vw) bx = clamp(bx, L.vw - L.bw, 0);
    else bx = (L.vw - L.bw) / 2 + clamp(bx - (L.vw - L.bw) / 2, -60, 60);
    hz.style.setProperty("--bx", bx + "px");
    hz.style.setProperty("--gx", (-p * 160) + "px");
    hz.style.setProperty("--rail", (p * 100) + "%");
    const step = Math.round(f);
    if (step !== hzStep) {
      hzStep = step;
      hzItems.forEach((li, k) => li.classList.toggle("is-on", k === step));
      hzSpots.forEach(s => s.classList.toggle("on", s.dataset.part == step + 1));
      hzDots.forEach((d, k) => d.classList.toggle("on", k <= step));
      writeCap(step);
    }
    return r.top <= 0 && r.bottom >= L.vh;
  };

  /* ---------- Towing: van along the route ---------- */
  const trip = document.querySelector("[data-trip]");
  const road = trip && trip.querySelector("[data-trip-road]");
  const van = trip && trip.querySelector("[data-trip-van]");
  const tripCards = trip ? [...trip.querySelectorAll("[data-trip-card]")] : [];
  const stops = trip ? [...trip.querySelectorAll(".stop")] : [];
  const tripSvg = trip && trip.querySelector(".trip__map svg");
  let roadLen = 0, stopLen = [];
  if (road) {
    const pts = road.getAttribute("points").trim().split(/\s+/).map(p => p.split(",").map(Number));
    const cum = [0];
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    roadLen = road.getTotalLength ? road.getTotalLength() : cum[cum.length - 1];
    const scale = roadLen / cum[cum.length - 1];
    stopLen = stops.map(s => {   /* stop = the route vertex nearest it */
      const [, sx, sy] = s.getAttribute("transform").match(/translate\(([\d.]+) ([\d.]+)\)/).map(Number);
      let best = 0, bd = Infinity;
      pts.forEach((p, k) => { const d = Math.hypot(p[0] - sx, p[1] - sy); if (d < bd) { bd = d; best = k; } });
      return cum[best] * scale;
    });
    road.style.setProperty("--len", roadLen);
  }
  const updateTrip = () => {
    if (!road || !tripCards.length) return false;
    const vh = window.innerHeight, phone = window.matchMedia("(max-width: 760px)").matches;
    const mb = trip.querySelector(".trip__map").getBoundingClientRect().bottom;
    const line = phone ? mb + (vh - mb) * .45 : vh * .55;
    const cs = tripCards.map(c => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; });
    let f = 0;
    if (cs[0] <= line) {
      f = cs.length - 1;
      for (let k = 0; k < cs.length - 1; k++) if (cs[k + 1] > line) { f = k + (line - cs[k]) / (cs[k + 1] - cs[k]); break; }
    }
    if (reduce) f = Math.round(f);
    const k = Math.min(stopLen.length - 2, Math.floor(f)), t = f - k;
    const len = stopLen[k] + (stopLen[k + 1] - stopLen[k]) * t;
    road.style.setProperty("--off", roadLen - len);
    const pt = road.getPointAtLength(len), ahead = road.getPointAtLength(Math.min(roadLen, len + 2));
    const dir = ahead.x - pt.x > .3 ? -1 : 1;   // the drawing faces left; flip when heading east
    van.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) scale(${dir} 1)`);
    /* zoomed-in map that follows the car down the country (viewBox matches the box's shape, so nothing letterboxes) */
    if (tripSvg && tripSvg.clientHeight) {
      const W = 320, H = 600, asp = tripSvg.clientWidth / tripSvg.clientHeight;
      let vh2 = H / (phone ? 2.6 : 1.6), vw2 = vh2 * asp;
      if (vw2 > W) { vw2 = W; vh2 = W / asp; }
      const cx = vw2 >= W ? W / 2 : clamp(pt.x, vw2 / 2, W - vw2 / 2);
      const cy = clamp(pt.y + vh2 * .1, vh2 / 2, H - vh2 / 2);
      tripSvg.setAttribute("viewBox", `${(cx - vw2 / 2).toFixed(1)} ${(cy - vh2 / 2).toFixed(1)} ${vw2.toFixed(1)} ${vh2.toFixed(1)}`);
    }
    const now = Math.round(f);
    stops.forEach((s, j) => s.classList.toggle("on", j <= f + .02));
    tripCards.forEach((c, j) => c.classList.toggle("is-on", j === now && cs[0] <= line + vh * .3));
    const r = trip.getBoundingClientRect();
    return phone && r.top < 0 && r.bottom > mb + 40;
  };

  /* ---------- Training: season board ---------- */
  const season = document.querySelector("[data-season]");
  const sStage = season && season.querySelector(".season__stage");
  const sParas = season ? [...season.querySelectorAll(".season__text > p")] : [];
  const sRows = season ? [...season.querySelectorAll("[data-row]")] : [];
  let sOn = null;
  const updateSeason = () => {
    if (!season) return false;
    const vh = window.innerHeight, sb = sStage.getBoundingClientRect().bottom, line = sb + (vh - sb) * .3;
    let cur = null;
    sParas.forEach(p => { const r = p.getBoundingClientRect(); if (r.top <= line && r.bottom > sb) cur = p; });
    const key = cur && cur.dataset.prog ? cur.dataset.prog : null;
    if (key !== sOn) {
      sOn = key;
      if (key) season.dataset.on = key; else delete season.dataset.on;
      sRows.forEach(r => r.classList.toggle("on", r.dataset.row === key));
      sParas.forEach(p => p.classList.toggle("on", p === cur && !!key));
    }
    const r = season.getBoundingClientRect();
    return r.top < sb - 20 && r.bottom > sb + 80;
  };

  /* ---------- Rig walk: girl + boy walk the kg scale as you scroll ---------- */
  const walk = document.querySelector("[data-walk]");
  const RIG = { 4: ["4.7", "ILCA 4", 60], 6: ["Radial", "ILCA 6", 70], 7: ["Standard", "ILCA 7", 82] };
  const SAIL = '<svg viewBox="0 0 50 100" focusable="false"><path d="M8 4V90" stroke="currentColor" stroke-width="2.5"/><path d="M10 6Q40 38 44 86H10Z" fill="currentColor" opacity=".8"/><path d="M8 86H46" stroke="currentColor" stroke-width="2"/><path d="M2 90H48L43 97H8Z" fill="currentColor"/></svg>';
  const FIG = girl => `<svg class="kid" viewBox="0 0 40 86" focusable="false"><g class="body">
    <g class="arm arm-b"><line class="suit" x1="20" y1="25" x2="20" y2="44" stroke-width="5" stroke-linecap="round"/></g>
    <g class="leg leg-b"><line class="suit" x1="20" y1="50" x2="20" y2="82" stroke-width="6.5" stroke-linecap="round"/></g>
    <g class="leg leg-a"><line class="suit" x1="20" y1="50" x2="20" y2="82" stroke-width="6.5" stroke-linecap="round"/></g>
    <rect class="bib" x="12.5" y="19" width="15" height="33" rx="5"/>
    ${girl ? '<path class="hair" d="M14 8Q6 10 8 22Q10.5 15.5 14.5 13Z"/>' : ""}
    <circle class="skin" cx="20" cy="11" r="7"/>
    <path class="hair" d="M13 10.5Q13 3 20 3Q27 3 27 9.5Q24 6.2 20 6.6Q15.5 6.4 13 10.5Z"/>
    <g class="arm arm-a"><line class="suit" x1="20" y1="25" x2="20" y2="44" stroke-width="5" stroke-linecap="round"/></g>
  </g></svg>`;
  let walkOn = false, walkLanes = [];
  if (walk) {
    document.documentElement.classList.add("js-walk");
    const pairs = s => s.split(",").map(x => x.split(":"));
    walkLanes = [...walk.querySelectorAll(".lane")].map(lane => {
      const gates = pairs(lane.dataset.gates).map(([kg, r]) => ({ kg: +kg, r }));
      const race = pairs(lane.dataset.race).map(([r, span]) => { const [a, b] = span.split("-").map(Number); return { r, a, b }; });
      const track = document.createElement("div");
      track.className = "lane__track";
      let html = "";
      gates.forEach((g, k) => { html += `<span class="kgx seg" data-rig-c="${g.r}" style="--kg:${g.kg};--to:${gates[k + 1] ? gates[k + 1].kg : 90}"></span>`; });
      race.forEach(b => { html += `<span class="kgx race" data-rig-c="${b.r}" style="--kg:${b.a};--to:${b.b}"></span>`; });
      gates.forEach(g => { const [nm, cls, sz] = RIG[g.r]; html += `<span class="kgx gate" data-rig-c="${g.r}" style="--kg:${g.kg};--sz:${sz}">${SAIL}<span class="gate__lbl">${nm}<small>${cls}</small></span></span>`; });
      html += `<span class="kgx who">${FIG(lane.dataset.lane === "w")}<span class="bubble"></span></span>`;
      track.innerHTML = html;   // our own static markup, no user data
      lane.append(track);
      return { lane, gates, race, stop: +lane.dataset.stop, who: track.querySelector(".who"), bubble: track.querySelector(".bubble"),
        gateEls: [...track.querySelectorAll(".gate")], raceEls: [...track.querySelectorAll(".race")], kg: -1, t: 0 };
    });
  }
  const walkKg = walk && walk.querySelector("[data-walk-kg]");
  const setLane = (L, kg) => {
    kg = Math.min(kg, L.stop);
    const moved = Math.abs(kg - L.kg) > .01;
    if (!moved) return;
    L.kg = kg;
    L.who.style.setProperty("--kg", kg.toFixed(2));
    L.who.style.setProperty("--s", (.62 + (kg - 42) / 42 * .46).toFixed(3));
    L.who.style.setProperty("--p", ((kg - 40) / 50).toFixed(3));
    const cur = L.gates.filter(g => kg >= g.kg).pop();
    const band = L.race.find(b => kg >= b.a && kg <= b.b);
    L.gateEls.forEach((el, k) => el.classList.toggle("on", kg >= L.gates[k].kg));
    L.raceEls.forEach((el, k) => el.classList.toggle("on", L.race[k] === band));
    L.bubble.dataset.rigC = cur ? cur.r : "";
    const i = document.createElement("i");
    const main = document.createTextNode(cur ? `${RIG[cur.r][1]} · ${RIG[cur.r][0]}` : "Still growing");
    const small = document.createElement("small");
    small.textContent = band ? `${RIG[band.r][1]} race weight` : `${Math.round(kg)} kg`;
    L.bubble.replaceChildren(i, main, small);
    L.who.classList.toggle("done", kg >= L.stop);
    if (!reduce && walkOn) {
      L.lane.classList.add("walking");
      clearTimeout(L.t);
      L.t = setTimeout(() => L.lane.classList.remove("walking"), 140);
    }
  };
  const layoutWalk = () => {
    if (!walk) return;
    walkOn = !reduce && window.innerHeight >= 520;
    walk.classList.toggle("walk-on", walkOn);
    if (!walkOn) { walkLanes.forEach(L => setLane(L, L.stop)); if (walkKg) walkKg.textContent = "84"; }
  };
  const updateWalk = () => {
    if (!walkOn) return false;
    const r = walk.getBoundingClientRect(), vh = window.innerHeight;
    const p = clamp(-r.top / Math.max(1, walk.offsetHeight - vh), 0, 1);
    const kg = 42 + clamp((p - .04) / .84, 0, 1) * 42;
    walkLanes.forEach(L => setLane(L, kg));
    if (walkKg) walkKg.textContent = Math.round(kg);
    return r.top <= 0 && r.bottom >= vh;
  };

  /* ---------- Mini season calendar (Racing) ---------- */
  const mini = document.querySelector("[data-minical]");
  const miniGrid = mini && mini.querySelector("[data-minical-grid]");
  if (miniGrid && Array.isArray(window.BTS_EVENTS)) {
    const TYPES = ["national-open", "championship", "ilca-uk-training", "bts-camp"];
    const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = s => { const [y, m, dd] = s.split("-").map(Number); return new Date(y, m - 1, dd); };
    const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const evs = window.BTS_EVENTS.filter(e => TYPES.includes(e.type) && !e.optional && !e.placeholder);
    for (let k = 0; k < 12; k++) {
      const m0 = new Date(2026, 8 + k, 1), m1 = new Date(2026, 9 + k, 0);
      const row = document.createElement("span");
      row.className = "mc-row" + (m1 < today ? " past" : "");
      const lbl = document.createElement("span");
      lbl.className = "mc-m";
      lbl.textContent = MON[m0.getMonth()] + (m0.getMonth() === 0 || k === 0 ? " ’" + String(m0.getFullYear()).slice(2) : "");
      const strip = document.createElement("span");
      strip.className = "mc-strip";
      const lanes = [];
      evs.map(e => ({ e, s: d(e.start), t: d(e.end || e.start) })).filter(x => x.t >= m0 && x.s <= m1).sort((a, b) => a.s - b.s).forEach(x => {
        const s = x.s < m0 ? m0 : x.s, t = x.t > m1 ? m1 : x.t;
        let l = lanes.findIndex(end => end < s);
        if (l === -1) { l = Math.min(lanes.length, 1); }
        lanes[l] = t;
        const bar = document.createElement("span");
        bar.className = "mc-bar t-" + x.e.type;
        bar.style.cssText = `--d0:${s.getDate() - 1};--n:${t.getDate() - s.getDate() + 1};--l:${l}`;
        strip.append(bar);
      });
      if (today >= m0 && today <= m1) { const t = document.createElement("span"); t.className = "mc-today"; t.style.setProperty("--d0", today.getDate() - .5); strip.append(t); }
      row.append(lbl, strip);
      miniGrid.append(row);
    }
  }
  /* ---------- Phone pill count ---------- */
  const pill = document.querySelector("[data-toc-toggle]");
  const links = [...document.querySelectorAll("[data-toc-list] a")];
  let count = null;
  if (pill && links.length) {
    count = document.createElement("span");
    count.className = "toc-count";
    count.setAttribute("aria-hidden", "true");
    pill.querySelector(".toc-chev").before(count);
  }

  const update = () => {
    if (count) {
      const i = links.findIndex(a => a.classList.contains("is-active"));
      count.textContent = `${Math.max(1, i + 1)} of ${links.length}`;
    }
    const a = updateHz(), b = updateTrip(), c = updateSeason(), w = updateWalk();
    body.classList.toggle("pinned", a || b || c || w);
  };
  let raf = 0;
  const onScroll = () => { navScroll(); if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { layoutHz(); layoutWalk(); update(); });
  if (hzItems.length) writeCap(0);
  layoutWalk();
  layoutHz();
  update();
  /* the blueprint loads lazily: re-measure once it (and the fonts) are in */
  if (hzBoat) hzBoat.querySelector("img").addEventListener("load", () => { layoutHz(); update(); });
  if (document.fonts) document.fonts.ready.then(() => { layoutHz(); update(); });
})();
