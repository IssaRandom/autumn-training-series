/* The road to Volos (19 Nov 2026). Needs window.BTS_EVENTS (data/events.js).
   - hero countdown to the ILCA 6 Youth Worlds (start date from events.js "i6-youth-worlds")
   - programme board: Feb–Aug 2027 month strips drawn from events.js (our camps, Nationals + registration day, the Worlds);
     it pins under the nav while the stop cards scroll past; the stop being read lights its bars, tap a bar to jump to its stop
   - a racing card (.rv-stop--race, the spring National Opens) sits between the stops; it lights its bars but is not counted
   (the "build your summer" receipt was removed 20 Nov: James doesn't want costs highlighted) */
(() => {
  "use strict";
  const EV = Array.isArray(window.BTS_EVENTS) ? window.BTS_EVENTS : [];
  const byId = id => EV.find(e => e.id === id);
  const d = s => { const [y, m, dd] = s.split("-").map(Number); return new Date(y, m - 1, dd); };
  const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const DAY = 864e5;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const worlds = byId("i6-youth-worlds");
  const goal = worlds ? d(worlds.start) : new Date(2027, 7, 21);

  /* ---------- Hero countdown ---------- */
  const left = document.querySelector("[data-goal-left]");
  if (left) {
    const n = Math.round((goal - today) / DAY);
    left.textContent = n > 1 ? `${n} days` : n === 1 ? "Tomorrow" : n === 0 ? "Today" : "";
  }

  /* ---------- Programme board ---------- */
  const prog = document.querySelector("[data-rv-prog]");
  const rows = prog && prog.querySelector("[data-rv-rows]");
  const nowEl = prog && prog.querySelector("[data-rv-now]");
  const stops = prog ? [...prog.querySelectorAll("[data-stop]")] : [];
  const stage = prog && prog.querySelector(".rv-stage");
  const camps = stops.filter(s => !s.classList.contains("rv-stop--race"));   // numbered BTS stops
  const evStop = {};   // event id -> stop element
  stops.forEach(s => (s.dataset.ev || "").split(" ").filter(Boolean).forEach(id => { evStop[id] = s; }));
  const bars = [];

  if (prog && rows && EV.length) {
    document.documentElement.classList.add("js-rv");
    const ids = Object.keys(evStop);
    const evs = ids.map(byId).filter(Boolean);
    const fresh = e => window.BTSCal && window.BTSCal.isFresh ? window.BTSCal.isFresh(e) : !!e.isNew;
    for (let m = 1; m <= 7; m++) {   // Feb..Aug 2027
      const m0 = new Date(2027, m, 1), m1 = new Date(2027, m + 1, 0);
      const row = document.createElement("div");
      row.className = "rv-row";
      row.dataset.m = m;
      const lbl = document.createElement("span");
      lbl.className = "rv-m";
      lbl.textContent = MON[m];
      const strip = document.createElement("span");
      strip.className = "rv-strip";
      const lanes = [];
      evs.map(e => ({ e, s: d(e.start), t: d(e.end || e.start) })).filter(x => x.t >= m0 && x.s <= m1)
        .sort((a, b) => (a.e.type === "bts-camp" ? 0 : 1) - (b.e.type === "bts-camp" ? 0 : 1) || a.s - b.s)
        .forEach(x => {
          const s = x.s < m0 ? m0 : x.s, t = x.t > m1 ? m1 : x.t;
          let l = lanes.findIndex(end => end < s);
          if (l === -1) l = lanes.length;
          l = Math.min(l, 1);
          lanes[l] = t;
          const b = document.createElement("button");
          b.type = "button";
          const e = x.e;
          b.className = ["rv-bar", "t-" + e.type, fresh(e) ? "is-fresh" : "", e.reg ? "is-reg" : "", e.id === "i6-youth-worlds" ? "is-goal" : ""].filter(Boolean).join(" ");
          b.style.cssText = `--d0:${s.getDate() - 1};--n:${t.getDate() - s.getDate() + 1};--l:${l}`;
          b.setAttribute("aria-label", `${e.name}: go to this stop`);
          b.title = e.name;
          b.dataset.id = e.id;
          b.addEventListener("click", () => {
            const st = evStop[e.id];
            if (st) st.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
          });
          bars.push(b);
          strip.append(b);
        });
      row.append(lbl, strip);
      rows.append(row);
    }
  }

  let on = null;
  const weeksTo = s => {
    const w = Math.round((goal - d(s)) / (7 * DAY));
    return w > 1 ? `${w} weeks to Volos` : w === 1 ? "1 week to Volos" : "Volos";
  };
  const update = () => {
    if (!prog || !stage) return;
    const vh = window.innerHeight, sb = stage.getBoundingClientRect().bottom, line = sb + (vh - sb) * .35;
    let cur = null;
    stops.forEach(s => { const r = s.getBoundingClientRect(); if (r.top <= line && r.bottom > sb) cur = s; });
    if (cur !== on) {
      on = cur;
      const set = new Set(cur ? (cur.dataset.ev || "").split(" ") : []);
      if (cur) prog.dataset.on = cur.dataset.stop; else delete prog.dataset.on;
      bars.forEach(b => b.classList.toggle("on", set.has(b.dataset.id)));
      stops.forEach(s => s.classList.toggle("on", s === cur));
      const first = cur && byId((cur.dataset.ev || "").split(" ")[0]);
      const months = new Set();
      if (cur) bars.filter(b => b.classList.contains("on")).forEach(b => months.add(b.closest(".rv-row").dataset.m));
      rows && [...rows.children].forEach(r => r.classList.toggle("on", months.has(r.dataset.m)));
      const race = cur && cur.classList.contains("rv-stop--race");
      if (nowEl) nowEl.innerHTML = cur && first
        ? `<b>${race ? "Racing" : `Stop ${camps.indexOf(cur) + 1} of ${camps.length}`}</b> · ${cur.dataset.name} · ${cur.dataset.stop === "volos" ? "the goal" : weeksTo(first.start)}`
        : `${camps.length} stops · ${weeksTo("2027-02-15").replace(" to Volos", "")} from February to Volos`;
    }
    const r = prog.getBoundingClientRect();
    document.body.classList.toggle("rv-pinned", r.top < sb - 20 && r.bottom > sb + 80);
  };
  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  if (prog) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

})();
