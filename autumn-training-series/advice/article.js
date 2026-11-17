/* Article-design patterns for long advice guides. Pairs with article.css. No dependencies.
   - nav steps aside while reading down, comes back on the first scroll up
   - reveals for bands (18), charts (13), figure cards (03), sticky notes, polaroids, season board
     and the finish line (12); they reset once fully off screen, so they play again every time
   - sticky notes: the second half of the note "writes" itself in
   - FAQ mystery boxes: tap a crate to open it (answers stay findable with Ctrl+F where supported)
   - boatwork: sideways timeline (01 + 16); vertical scroll moves the cards across, the blueprint pans
   - towing: van drives the route down the UK as each stop's card passes
   - training: season board row for the paragraph being read lights up
   - which rig: compact pinned panel, girl + boy walk past the rigs; table rows + paragraph light up
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
      const W = 1478, H = 1064, asp = tripSvg.clientWidth / tripSvg.clientHeight;
      let vh2 = H / (phone ? 1.6 : 1.15), vw2 = vh2 * asp;
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

  /* ---------- Rig walk (round 4): compact pinned panel; girl + boy walk one line past the rigs as you read ---------- */
  const walk = document.querySelector("[data-walk]");
  const RIGN = { 4: "ILCA 4", 6: "ILCA 6", 7: "ILCA 7" };
  /* boat centres in the picture (% of its width); gates = Kai's transition weights, race = Kai's optimal race weights */
  const BX = { 4: 17, 6: 49.6, 7: 82.5 };
  const KIDS = {
    w: { from: 40, to: 70, end: .82, gates: [[46, 4], [58, 6]], race: { 4: [58, 64], 6: [65, 70] }, path: [[40, 3], [46, BX[4]], [58, BX[6]], [70, BX[6] + 7]] },
    m: { from: 42, to: 84, end: 1, gates: [[50, 4], [64, 6], [79, 7]], race: { 4: [64, 67], 6: [72, 75], 7: [79, 84] }, path: [[42, 6], [50, BX[4]], [64, BX[6]], [79, BX[7]], [84, BX[7] + 8]] }
  };
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
  let walkOn = false, wStage = null, wText = null, wParas = [], wRows = [], wBoats = [], wKids = [], wEnd = null, wPara = null;
  if (walk) {
    document.documentElement.classList.add("js-walk");
    wStage = walk.querySelector(".rigwalk__stage");
    wText = walk.querySelector(".rigwalk__text");
    wParas = [...wText.children].filter(el => el.tagName === "P");
    wEnd = wText.querySelector('[data-chart="gate"]') || wText;
    wBoats = [...walk.querySelectorAll("[data-boat]")];
    wRows = [...walk.querySelectorAll(".chart tbody tr[data-who]")].map(tr => ({ tr, who: tr.dataset.who, rig: +tr.dataset.rig,
      kind: tr.closest("[data-chart]").dataset.chart, lo: parseFloat(tr.style.getPropertyValue("--lo")), hi: parseFloat(tr.style.getPropertyValue("--hi")) }));
    const scene = walk.querySelector(".rw__scene");
    wKids = Object.entries(KIDS).map(([id, K]) => {
      const el = document.createElement("span");
      el.className = "rw__kid";
      el.dataset.kid = id;
      el.innerHTML = FIG(id === "w");   // our own static markup, no user data
      scene.append(el);
      const chip = walk.querySelector(`[data-chip="${id}"]`);
      return Object.assign({ id, el, chip, kgEl: chip.querySelector("[data-kg]"), rigEl: chip.querySelector("[data-rig]"), kg: -1, rig: 0, inRace: 0, t: 0 }, K);
    });
  }
  const along = (path, kg) => {   /* piecewise: kg -> x% along the picture */
    for (let k = 1; k < path.length; k++) if (kg <= path[k][0]) { const [a0, x0] = path[k - 1], [a1, x1] = path[k]; return x0 + (x1 - x0) * clamp((kg - a0) / (a1 - a0), 0, 1); }
    return path[path.length - 1][1];
  };
  const setKid = (K, kg) => {
    if (Math.abs(kg - K.kg) < .01) return;
    K.kg = kg;
    K.el.style.setProperty("--x", along(K.path, kg).toFixed(2));
    K.el.style.setProperty("--s", (.62 + (kg - 40) / 44 * .38).toFixed(3));
    const g = K.gates.filter(([w]) => kg >= w).pop();
    K.rig = g ? g[1] : 0;
    const band = Object.entries(K.race).find(([, [a, b2]]) => kg >= a && kg <= b2);
    K.inRace = band ? +band[0] : 0;
    K.kgEl.textContent = Math.round(kg);
    // " · race weight" is hidden on phones (a ✓ and the glow say it there) so the chips never wrap and the panel never changes height
    K.rigEl.innerHTML = K.rig ? RIGN[K.rig] + (K.inRace === K.rig ? '<span class="rw__rw"> · race weight</span>' : "") : "Growing";
    K.rigEl.classList.toggle("is-race", !!K.rig && K.inRace === K.rig);
    if (K.rig) K.rigEl.dataset.rigC = K.rig; else delete K.rigEl.dataset.rigC;
    K.chip.classList.toggle("race", !!K.inRace);
    K.el.classList.toggle("done", kg >= K.to);
    if (walkOn) {
      K.el.classList.add("walking");
      clearTimeout(K.t);
      K.t = setTimeout(() => K.el.classList.remove("walking"), 140);
    }
  };
  const paintWalk = () => {
    wBoats.forEach(bt => {
      const n = +bt.dataset.boat;
      bt.classList.toggle("on", wKids.some(K => K.rig === n));
      bt.classList.toggle("race", wKids.some(K => K.inRace === n));
    });
    const kid = { w: wKids.find(K => K.id === "w"), m: wKids.find(K => K.id === "m") };
    wRows.forEach(R => {
      const K = kid[R.who];
      const lit = R.kind === "race" ? K.kg >= R.lo && K.kg <= R.hi : K.rig === R.rig;
      R.tr.classList.toggle("lit", lit);
    });
  };
  const layoutWalk = () => {
    if (!walk) return;
    walkOn = !reduce && window.innerHeight >= 520;
    walk.classList.toggle("walk-on", walkOn);
    if (!walkOn) { wKids.forEach(K => setKid(K, K.to)); paintWalk(); }
  };
  const updateWalk = () => {
    if (!walk) return false;
    const vh = window.innerHeight, sb = wStage.getBoundingClientRect().bottom, line = sb + (vh - sb) * .35;
    if (walkOn) {
      const top = wText.getBoundingClientRect().top, end = wEnd.getBoundingClientRect().bottom;
      const p = clamp((line - top) / Math.max(1, end - top), 0, 1);
      wKids.forEach(K => setKid(K, K.from + (K.to - K.from) * clamp(p / K.end, 0, 1)));
      paintWalk();
    }
    let cur = null;
    wParas.forEach(el => { const r = el.getBoundingClientRect(); if (r.top <= line && r.bottom > sb) cur = el; });
    if (cur !== wPara) { wPara = cur; wParas.forEach(el => el.classList.toggle("on", el === cur)); }
    if (!walkOn) return false;
    const r = walk.getBoundingClientRect();
    return r.top < sb - 20 && r.bottom > sb + 80;
  };

  /* Mini season calendar: moved to minical.js (shared with the venue guides, 16 Nov) */
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
