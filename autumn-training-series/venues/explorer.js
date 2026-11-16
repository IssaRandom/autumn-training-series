/* Beyond the Shift /beta — venue explorer (James 14–15 Nov 2026, Weymouth first; reusable for other venues).
   A chart of the venue drawn from real coastline data (geo file per venue, window.WEY_GEO style):
   - Overview with one hotspot per race area and the swell drawn. Tap a hotspot, or tap the water: inside the harbour
     walls = harbour, outside = bay. In an area, tap the water outside it (or drag towards the other area) to move across.
   - Drag pans a little round each area (rubber band at the edge), never far.
   - Wind picker = a pie of SECTORS (config). Tapping a sector snaps to its one direction (Weymouth: NW–NE → N,
     E–S → SE, SW–W → WSW). The chart turns so the wind blows straight down the screen, always the short way round.
     The compass (top left) is a toggle: north-up instead, and the big arrow turns to show the wind.
   - Area "wind" layer: wind lines in a wind-aligned frame, stronger lane left or right from the config field.
   - Area "waves" layer (and the overview): swell crests from a travel-time grid (Dijkstra, 16 neighbours, slower in
     shallow water) so they bend round Portland Bill and the walls. Config `gates` close the harbour entrances, so no
     swell gets into the harbour or leaks back out; the cells behind them are the harbour zone used for taps.
   - Notes panel shows <template data-note="area-SECTOR"> (or "area-*", then "soon").
   - Story mode (P2, Weymouth 17 Nov): inside .vx-spine the map pins and the .vx-story chapters drive it. Each
     [data-vx-beat] paragraph sets area + wind (from its .vx-chap), shows the marks named in data-show and can move the
     camera (data-cam). Taps on the map scroll the story instead. Marks config: course, cams, marks (see the venue page).
   Config: window.VENUE_EXPLORER = { geo, start:{area, dir}, sectors:[{id,label,from,to,bear,name}],
           areas:{id:{x,y,span,label,layer,seed?,field:{SECTOR:{bias,gain}}}}, overview:{x,y,span}, labels:[{t,x,y,k}],
           gates:[[x0,y0,x1,y1]], waveAmp:{SECTOR:n}, waveBox:[x0,y0,x1,y1] }. Units: metres, y south. */
(() => {
  const root = document.querySelector("[data-explorer]");
  const CFG = window.VENUE_EXPLORER;
  if (!root || !CFG || !CFG.geo) return;
  const G = CFG.geo;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = root) => el.querySelector(s);
  const $$ = (s, el = root) => [...el.querySelectorAll(s)];
  const SECS = CFG.sectors;
  const SEC = id => SECS.find(s => s.id === id) || SECS[0];
  const BEAR = id => SEC(id).bear;
  const short = d => ((d % 360) + 540) % 360 - 180;            // shortest signed turn

  const view = $(".vx-view"), world = $(".vx-world"), over = $(".vx-over");
  const S = 10, HALF = 16000, OX = HALF / S;            // world div: 1px = 10 m, metre (0,0) at (OX,OX)

  /* ---------- chart ---------- */
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `${-HALF} ${-HALF} ${2 * HALF} ${2 * HALF}`);
  svg.setAttribute("width", 2 * OX); svg.setAttribute("height", 2 * OX);
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("vx-chart");
  svg.innerHTML = `<defs><pattern id="vx-grid" width="1000" height="1000" patternUnits="userSpaceOnUse"><path d="M1000 0H0V1000" fill="none" class="vx-gridline"/></pattern></defs>
    <rect x="${-HALF}" y="${-HALF}" width="${2 * HALF}" height="${2 * HALF}" class="vx-sea"/>
    <rect x="${-HALF}" y="${-HALF}" width="${2 * HALF}" height="${2 * HALF}" fill="url(#vx-grid)"/>
    <g class="vx-zones"></g>
    <path class="vx-shallow" d="${G.land}"/>
    <path class="vx-land" d="${G.land}"/>
    ${G.walls.map(d => `<path class="vx-wall" d="${d}"/>`).join("")}`;
  world.prepend(svg);   // under the wave canvas (the canvas leaves land see-through)

  /* ---------- wind zones: areas[id].zones[SECTOR] = [{k:"light"|"more", p:[x,y, x,y, ...]}] in metres.
     Drawn under the land, so a zone can spill over the shore and the coast still cuts it clean. ---------- */
  const smooth = p => {                                   // closed Catmull-Rom through the points
    const P = []; for (let i = 0; i < p.length; i += 2) P.push([p[i], p[i + 1]]);
    const n = P.length, at = i => P[(i + n) % n];
    let d = `M${P[0][0]} ${P[0][1]}`;
    for (let i = 0; i < n; i++) {
      const [a, b, c, e] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
      d += `C${(b[0] + (c[0] - a[0]) / 6).toFixed(0)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(0)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(0)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(0)} ${c[0]} ${c[1]}`;
    }
    return d + "Z";
  };
  const zoneG = svg.querySelector(".vx-zones");
  const zonesFor = (area, dir) => { const a = CFG.areas[area]; return (a && a.zones && a.zones[dir]) || null; };
  const ZK = { light: "Lighter breeze", more: "More breeze" };
  const zoneKey = document.createElement("div");
  zoneKey.className = "vx-key"; zoneKey.hidden = true;
  zoneKey.innerHTML = Object.entries(ZK).map(([k, t]) => `<span class="vx-key-i vx-key-${k}"><i aria-hidden="true"></i>${t}</span>`).join("");
  over.after(zoneKey);
  const drawZones = (area, dir) => {
    const z = zonesFor(area, dir) || [];
    zoneG.innerHTML = z.map(o => `<path class="vx-zone vx-zone--${o.k}" d="${smooth(o.p)}"/>`).join("");
    zoneKey.hidden = !z.length;
    zoneKey.querySelectorAll(".vx-key-i").forEach(el => { el.hidden = !z.some(o => el.classList.contains("vx-key-" + o.k)); });
  };
  // a coarse lookup grid of the current zones, so the wind lines can slow down or speed up as they cross one
  const zoneGrid = (() => {
    const C = 80, cache = {};
    return (area, dir) => {
      const z = zonesFor(area, dir); if (!z) return null;
      const key = area + "-" + dir; if (cache[key]) return cache[key];
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      z.forEach(o => { for (let i = 0; i < o.p.length; i += 2) { x0 = Math.min(x0, o.p[i]); x1 = Math.max(x1, o.p[i]); y0 = Math.min(y0, o.p[i + 1]); y1 = Math.max(y1, o.p[i + 1]); } });
      const gw = Math.ceil((x1 - x0) / C) + 1, gh = Math.ceil((y1 - y0) / C) + 1;
      const m = document.createElement("canvas"); m.width = gw; m.height = gh;
      const c = m.getContext("2d", { willReadFrequently: true });
      c.setTransform(1 / C, 0, 0, 1 / C, -x0 / C, -y0 / C);
      z.forEach(o => { c.fillStyle = o.k === "more" ? "#00ff00" : "#ff0000"; c.fill(new Path2D(smooth(o.p))); });
      const px = c.getImageData(0, 0, gw, gh).data, v = new Float32Array(gw * gh).fill(1);
      for (let i = 0; i < v.length; i++) if (px[i * 4 + 3] > 120) v[i] = px[i * 4 + 1] > px[i * 4] ? 1.55 : .45;
      return (cache[key] = (x, y) => { const cx = Math.floor((x - x0) / C), cy = Math.floor((y - y0) / C); return cx < 0 || cy < 0 || cx >= gw || cy >= gh ? 1 : v[cy * gw + cx]; });
    };
  })();


  /* ---------- P2 marks (story mode): pins, lanes, zones and a schematic course, shown per paragraph ----------
     Geometry in metres. Course parts use a wind frame: u = upwind (0 = leeward gates, 1 = windward mark), a = across,
     + to the right looking upwind; both in course lengths. So "left" and "right" are always the sailor's. */
  let mlabels = [];
  const markG = document.createElementNS(NS, "g");
  markG.setAttribute("class", "vx-marks");
  svg.append(markG);
  svg.querySelector("defs").insertAdjacentHTML("beforeend", '<marker id="vx-ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.6" markerHeight="3.6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffd66b"/></marker>');
  const R0 = v => Math.round(v);
  const poly = (pts, close) => "M" + pts.map(p => R0(p[0]) + " " + R0(p[1])).join("L") + (close ? "Z" : "");
  const curve = pts => {                                   // open Catmull-Rom through the points
    let d = `M${R0(pts[0][0])} ${R0(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], e = pts[Math.min(pts.length - 1, i + 2)];
      d += `C${R0(b[0] + (c[0] - a[0]) / 6)} ${R0(b[1] + (c[1] - a[1]) / 6)} ${R0(c[0] - (e[0] - b[0]) / 6)} ${R0(c[1] - (e[1] - b[1]) / 6)} ${R0(c[0])} ${R0(c[1])}`;
    }
    return d;
  };
  const pairs = f => { const o = []; for (let i = 0; i < f.length; i += 2) o.push([f[i], f[i + 1]]); return o; };
  const buildMarks = (area, dir) => {
    const M = CFG.marks || {}, out = [];
    const add = (id, body, labels = []) => out.push({ id, body, labels });
    const b = BEAR(dir) * Math.PI / 180, U = [Math.sin(b), -Math.cos(b)], Rt = [Math.cos(b), Math.sin(b)];
    const c = CFG.course && CFG.course[area];
    if (c) {
      const L = c.len, o = [c.x - U[0] * L / 2, c.y - U[1] * L / 2];
      const P = (a, u) => [o[0] + (u * U[0] + a * Rt[0]) * L, o[1] + (u * U[1] + a * Rt[1]) * L];
      const rect = (a0, a1, u0, u1) => poly([P(a0, u0), P(a1, u0), P(a1, u1), P(a0, u1)], true);
      const lab = (t, a, u, k = "", tbc) => { const [x, y] = P(a, u); return { t, x, y, k, tbc }; };
      const m1 = P(-.15, 1), m2 = P(.35, .8), g4 = [P(-.21, 0), P(-.09, 0)], g3 = [P(.29, 0), P(.41, 0)];
      const buoy = (p, k = "") => `<circle class="vx-buoy ${k}" cx="${R0(p[0])}" cy="${R0(p[1])}" r="${R0(L * .024)}"/>`;
      const inner = poly([P(-.15, .03), m1]), outer = poly([P(.35, .03), m2]);
      add("course", `<path class="vx-leg" d="${inner}"/><path class="vx-leg" d="${outer}"/><path class="vx-leg vx-leg--off" d="${poly([m1, m2])}"/>` +
        [m1, m2, ...g4, ...g3].map(p => buoy(p)).join(""), [lab("Schematic course", .1, -.2, "note")]);
      add("inner", `<path class="vx-leg vx-leg--hi" d="${inner}" marker-end="url(#vx-ah)"/>`, [lab("Inner loop", -.42, .5)]);
      add("outer", `<path class="vx-leg vx-leg--hi" d="${outer}" marker-end="url(#vx-ah)"/>`, [lab("Outer loop", .62, .42)]);
      add("gate-right", `<circle class="vx-ring" cx="${R0(g3[0][0])}" cy="${R0(g3[0][1])}" r="${R0(L * .07)}"/>`, [lab("Right-turn gate", .3, -.1)]);
      add("tint-left", `<path class="vx-tint vx-tint--good" d="${rect(-.62, .1, -.12, 1.12)}"/>`);
      add("tint-right", `<path class="vx-tint vx-tint--flat" d="${rect(.1, .82, -.12, 1.12)}"/>`);
      add("flat-right", `<path class="vx-tint vx-tint--flat" d="${rect(.1, .82, -.12, 1.12)}"/>`, [lab("Flatter water", .6, .2)]);
      add("corner-bl", `<path class="vx-tint vx-tint--maybe" d="${rect(-.62, -.12, -.12, .3)}"/>`, [lab("Bottom left ?", -.37, .09, "corner")]);
      add("corner-tr", `<path class="vx-tint vx-tint--no" d="${rect(.42, .82, .76, 1.12)}"/>`, [lab("Top right ✕", .62, .94, "corner")]);
      add("corner-tl", `<path class="vx-tint vx-tint--good" d="${rect(-.62, -.12, .76, 1.12)}"/>`, [lab("Top left", -.37, .94, "corner")]);
      // persistent-shift blocks: pressure patches with the breeze turned about 20° each way
      const shift = (ctr, deg) => { const r = deg * Math.PI / 180, dx = -U[0] * Math.cos(r) + U[1] * Math.sin(r), dy = -U[1] * Math.cos(r) - U[0] * Math.sin(r);
        return `<path class="vx-flow" d="${poly([[ctr[0] - dx * L * .1, ctr[1] - dy * L * .1], [ctr[0] + dx * L * .1, ctr[1] + dy * L * .1]])}" marker-end="url(#vx-ah)"/>`; };
      const bl = [P(-.32, .62), P(.22, .32)];
      add("blocks", bl.map((p, i) => `<ellipse class="vx-blob vx-blob--more" cx="${R0(p[0])}" cy="${R0(p[1])}" rx="${R0(L * .17)}" ry="${R0(L * .13)}"/>` + shift(p, i ? -20 : 20)).join(""),
        [lab("~20°", -.32, .8), lab("~20°", .22, .5)]);
      add("bend", `<path class="vx-flow vx-flow--dash" d="${curve([P(-.5, .02), P(-.7, .45), P(-.52, .98)])}" marker-end="url(#vx-ah)"/>`, [lab("Left-hand bend", -.78, .5, "", true)]);
      if (M.nothe) {
        const N = M.nothe, Cc = P(.1, .5), bn = Math.atan2(N[0] - Cc[0], -(N[1] - Cc[1])), r = L * .78;
        const at = (t, rr = r) => [Cc[0] + rr * Math.sin(t), Cc[1] - rr * Math.cos(t)], w = 35 * Math.PI / 180;
        const a0 = at(bn - w), a1 = at(bn + w);
        add("nothe-line", `<path class="vx-flow vx-flow--dash" d="${poly([N, m2])}"/>`);
        add("nothe-arc", `<path class="vx-arc vx-arc--random" d="M${R0(a0[0])} ${R0(a0[1])}A${R0(r)} ${R0(r)} 0 0 1 ${R0(at(bn)[0])} ${R0(at(bn)[1])}"/>` +
          `<path class="vx-arc vx-arc--steady" d="M${R0(at(bn)[0])} ${R0(at(bn)[1])}A${R0(r)} ${R0(r)} 0 0 1 ${R0(a1[0])} ${R0(a1[1])}"/>` +
          `<path class="vx-tick" d="${poly([at(bn, r * .9), at(bn, r * 1.1)])}"/>`,
          [{ t: "Random", x: at(bn - w * .7, r * 1.16)[0], y: at(bn - w * .7, r * 1.16)[1] }, { t: "Steadier", x: at(bn + w * .7, r * 1.16)[0], y: at(bn + w * .7, r * 1.16)[1] }]);
      }
      add("cliff-drop", [-.4, 0, .4].map(a => `<path class="vx-flow" d="${poly([P(a, 1.42), P(a, 1.1)])}" marker-end="url(#vx-ah)"/>`).join(""), [lab("Breeze drops off the land", 0, 1.55)]);
      add("bounce", [[-.3, .7], [.2, .45], [.45, .88], [-.08, .22], [.6, .15]].map(([a, u]) => { const p = P(a, u);
        return `<circle class="vx-ring vx-ring--soft" cx="${R0(p[0])}" cy="${R0(p[1])}" r="${R0(L * .06)}"/>`; }).join(""), [lab("Pressure bounces down", .2, .6)]);
      const zig = []; for (let i = 0; i <= 24; i++) { const u = -.05 + i * 1.1 / 24; zig.push(P(-.75 + .07 * Math.sin(u * Math.PI * 2.2), u)); }
      add("osc", `<path class="vx-flow" d="${curve(zig)}" marker-end="url(#vx-ah)"/>`, [lab("Longer oscillations", -.75, 1.2)]);
      const crest = (u, k) => { const t = 25 * Math.PI / 180, ca = Math.cos(t), sa = Math.sin(t);
        return poly([P(.35 - .18 * ca, u - .18 * sa), P(.35 + .18 * ca, u + .18 * sa)]); };
      add("wave-angle", `<path class="vx-leg vx-leg--hi" d="${poly([P(.35, .78), P(.35, .08)])}" marker-end="url(#vx-ah)"/>` +
        [.2, .38, .56].map(u => `<path class="vx-crest" d="${crest(u)}"/>`).join(""), [lab("Wave angle on the run", .7, .5)]);
    }
    Object.entries(M.pins || {}).forEach(([id, p]) => add(id, `<circle class="vx-pin" cx="${p.x}" cy="${p.y}" r="70"/>`, [{ t: p.t, x: p.x, y: p.y, k: "pin", tbc: p.tbc }]));
    Object.entries(M.lanes || {}).forEach(([id, l]) => { const [x0, y0, x1, y1] = l.p, [nx, ny] = l.n;
      add(id, `<path class="vx-lane" d="${poly([[x0, y0], [x1, y1], [x1 + nx * l.w, y1 + ny * l.w], [x0 + nx * l.w, y0 + ny * l.w]], true)}"/>`,
        [{ t: l.t, x: (x0 + x1) / 2 + nx * 420, y: (y0 + y1) / 2 + ny * 420, tbc: l.tbc }]); });
    Object.entries(M.blobs || {}).forEach(([id, e]) => add(id, `<ellipse class="vx-blob vx-blob--${id}" cx="${e.x}" cy="${e.y}" rx="${e.rx}" ry="${e.ry}"/>`, [{ t: e.t, x: e.x, y: e.y, tbc: e.tbc }]));
    Object.entries(M.flows || {}).forEach(([id, f]) => { const ls = f.lines.map(pairs), last = ls[0][Math.floor(ls[0].length / 2)];
      add(id, ls.map(p => `<path class="vx-flow vx-flow--big" d="${curve(p)}" marker-end="url(#vx-ah)"/>`).join(""), [{ t: f.t, x: f.at ? f.at[0] : last[0], y: f.at ? f.at[1] : last[1] }]); });
    if (CFG.gates) add("gates", CFG.gates.map(([a, b2, x, y]) => `<path class="vx-gate" d="${poly([[a, b2], [x, y]])}"/>`).join(""),
      [{ t: "Harbour entrances", x: 1900, y: -700 }]);
    return out;
  };
  let markKey = "";
  const drawMarks = (area, dir) => {
    const key = area + "-" + dir; if (key === markKey) return; markKey = key;
    const ms = buildMarks(area, dir);
    markG.innerHTML = ms.map(m => `<g class="vx-m" data-m="${m.id}">${m.body}</g>`).join("");
    mlabels.forEach(l => l.el.remove());
    mlabels = ms.flatMap(m => m.labels.map(l => {
      const el = document.createElement("span");
      el.className = "vx-ml" + (l.k ? " vx-ml--" + l.k : "") + (l.tbc ? " tbc" : "");
      el.dataset.m = m.id; el.textContent = l.t; el.setAttribute("aria-hidden", "true");
      if (l.tbc) el.title = "Position to confirm";
      over.append(el);
      return { x: l.x, y: l.y, el };
    }));
  };
  const showMarks = set => {
    markG.querySelectorAll(".vx-m").forEach(g => g.classList.toggle("on", set.has(g.dataset.m)));
    mlabels.forEach(l => l.el.classList.toggle("on", set.has(l.el.dataset.m)));
    root.classList.toggle("vx-zones-on", set.has("zones"));
  };

  /* ---------- camera ---------- */
  let W = 0, H = 0;
  const cam = { x: 0, y: 0, z: .03, r: 0 };
  const zFor = span => Math.min(W, H) / span;
  const toScreen = (mx, my) => {
    const a = cam.r * Math.PI / 180, dx = (mx - cam.x) * cam.z, dy = (my - cam.y) * cam.z;
    return [W / 2 + dx * Math.cos(a) - dy * Math.sin(a), H / 2 + dx * Math.sin(a) + dy * Math.cos(a)];
  };
  const screenVec = (sx, sy) => {                        // screen offset (px) -> world offset (m)
    const a = cam.r * Math.PI / 180;
    return [(sx * Math.cos(a) + sy * Math.sin(a)) / cam.z, (-sx * Math.sin(a) + sy * Math.cos(a)) / cam.z];
  };
  const arrowSvg = $(".vx-arrow svg");
  const apply = () => {
    world.style.transform = `translate(${W / 2}px,${H / 2}px) rotate(${cam.r}deg) scale(${cam.z * S}) translate(${-(cam.x / S + OX)}px,${-(cam.y / S + OX)}px)`;
    root.style.setProperty("--vx-rot", cam.r + "deg");
    if (arrowSvg) arrowSvg.style.rotate = short(BEAR(st.dir) + cam.r) + "deg";
    world.style.setProperty("--m", (1 / cam.z).toFixed(2));
    mlabels.forEach(l => { const [sx, sy] = toScreen(l.x, l.y); l.el.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-50%)`; });
    labels.forEach(l => { const [sx, sy] = toScreen(l.x, l.y); l.el.style.transform = `translate(${sx}px,${sy}px) ${l.k === "spot" ? "translate(-3.5px,-50%)" : "translate(-50%,-50%)"}`; });   // spots: the dot sits on the point
  };

  /* course flags (James 16 Nov): the race committee hoists P for Portland Harbour, W for Weymouth Bay */
  const FLAGS = {
    P: '<svg class="vx-flag" viewBox="0 0 24 18" aria-hidden="true"><rect width="24" height="18" fill="#1b4fb3"/><rect x="8" y="6" width="8" height="6" fill="#fff"/></svg>',
    W: '<svg class="vx-flag" viewBox="0 0 24 18" aria-hidden="true"><rect width="24" height="18" fill="#1b4fb3"/><rect x="4" y="3" width="16" height="12" fill="#fff"/><rect x="8" y="6" width="8" height="6" fill="#e5364a"/></svg>'
  };
  const flagOf = a => (a && a.flag && FLAGS[a.flag]) || "";

  /* labels + hotspots live in screen space so they stay upright */
  const labels = (CFG.labels || []).map(l => {
    const el = document.createElement("span");
    el.className = "vx-label vx-label--" + (l.k || "place") + (l.zoom ? " vx-label--zoom" : "");
    el.textContent = l.t;
    el.setAttribute("aria-hidden", "true");
    over.append(el);
    return { ...l, el };
  });
  Object.entries(CFG.areas).forEach(([id, a]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "vx-hot"; b.dataset.go = id;
    b.innerHTML = `<span class="vx-hot-ring" aria-hidden="true"></span><span class="vx-hot-t">${flagOf(a)}${a.label}</span>`;
    over.append(b);
    labels.push({ x: a.hx ?? a.x, y: a.hy ?? a.y, el: b });
  });

  /* ---------- state ---------- */
  const st = { area: CFG.start.area || "overview", dir: SEC(CFG.start.dir).id, northUp: false };
  const spot = area => area === "overview" ? CFG.overview : CFG.areas[area];
  const rotFor = () => st.northUp ? 0 : -BEAR(st.dir);
  let camKey = "";                                         // story mode: a wider shot for some paragraphs (CFG.cams)
  const shot = area => { const a = (camKey && CFG.cams && CFG.cams[camKey]) || spot(area); return { x: a.x, y: a.y, z: zFor(a.span), r: rotFor() }; };
  let tw = 0;
  const fly = (to, ms, dip) => {
    cancelAnimationFrame(tw);
    if (RM || ms === 0) { Object.assign(cam, to); apply(); return; }
    const from = { ...cam };
    const dr = short(to.r - from.r);                     // always the short way round
    const t0 = performance.now();
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = now => {
      const t = Math.min(1, (now - t0) / ms), e = ease(t);
      cam.x = from.x + (to.x - from.x) * e;
      cam.y = from.y + (to.y - from.y) * e;
      cam.r = from.r + dr * e;
      cam.z = Math.exp(Math.log(from.z) + (Math.log(to.z) - Math.log(from.z)) * e - dip * Math.sin(Math.PI * e));
      apply();
      if (t < 1) tw = requestAnimationFrame(step); else { cam.r = short(cam.r); apply(); }
    };
    tw = requestAnimationFrame(step);
  };

  /* ---------- grid: land, gates, harbour zone (shared by the swell and taps) ---------- */
  const grid = (() => {
    const [X0, Y0, X1, Y1] = CFG.waveBox, C = CFG.waveCell || 60;
    const gw = Math.round((X1 - X0) / C), gh = Math.round((Y1 - Y0) / C);
    let g = null;
    const raster = withGates => {
      const m = document.createElement("canvas"); m.width = gw; m.height = gh;
      const c = m.getContext("2d");
      c.setTransform(1 / C, 0, 0, 1 / C, -X0 / C, -Y0 / C);
      c.fill(new Path2D(G.land));
      c.lineWidth = C * .9;
      G.walls.forEach(d => { c.fill(new Path2D(d)); c.stroke(new Path2D(d)); });
      if (withGates) { c.lineWidth = C * 2.2; c.lineCap = "round"; (CFG.gates || []).forEach(([a, b, x, y]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(x, y); c.stroke(); }); }
      const px = c.getImageData(0, 0, gw, gh).data, out = new Uint8Array(gw * gh);
      for (let i = 0; i < out.length; i++) out[i] = px[i * 4 + 3] > 90 ? 1 : 0;
      return out;
    };
    const idx = (x, y) => { const cx = Math.floor((x - X0) / C), cy = Math.floor((y - Y0) / C); return cx < 0 || cy < 0 || cx >= gw || cy >= gh ? -1 : cy * gw + cx; };
    const build = () => {
      if (g) return g;
      const land = raster(false), block = raster(true);
      // zone: 0 open water, 1 land/wall, 2.. enclosed area (flood fill from its seed inside the gates)
      const zone = new Uint8Array(gw * gh);
      for (let i = 0; i < zone.length; i++) zone[i] = land[i];
      const enclosed = [];
      Object.entries(CFG.areas).forEach(([id, a]) => {
        if (!a.seed) return;
        const code = 2 + enclosed.length; enclosed.push(id);
        const s = idx(a.seed[0], a.seed[1]); if (s < 0 || block[s]) return;
        const q = [s]; zone[s] = code;
        while (q.length) { const i = q.pop(), x = i % gw, y = (i / gw) | 0;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
            const j = ny * gw + nx; if (block[j] || zone[j] === code) continue; zone[j] = code; q.push(j); } }
      });
      // blocked for the swell: land, walls, gates and everything behind them
      const wall = new Uint8Array(gw * gh);
      for (let i = 0; i < wall.length; i++) wall[i] = block[i] || zone[i] >= 2 ? 1 : 0;
      // chamfer distance to real land (not gates), in metres
      const dist = new Float32Array(gw * gh).fill(1e9);
      for (let i = 0; i < land.length; i++) if (land[i]) dist[i] = 0;
      const D1 = C, D2 = C * 1.414;
      for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) { const i = y * gw + x; let d = dist[i];
        if (x > 0) d = Math.min(d, dist[i - 1] + D1); if (y > 0) { d = Math.min(d, dist[i - gw] + D1); if (x > 0) d = Math.min(d, dist[i - gw - 1] + D2); if (x < gw - 1) d = Math.min(d, dist[i - gw + 1] + D2); } dist[i] = d; }
      for (let y = gh - 1; y >= 0; y--) for (let x = gw - 1; x >= 0; x--) { const i = y * gw + x; let d = dist[i];
        if (x < gw - 1) d = Math.min(d, dist[i + 1] + D1); if (y < gh - 1) { d = Math.min(d, dist[i + gw] + D1); if (x < gw - 1) d = Math.min(d, dist[i + gw + 1] + D2); if (x > 0) d = Math.min(d, dist[i + gw - 1] + D2); } dist[i] = d; }
      return (g = { X0, Y0, C, gw, gh, land, wall, zone, dist, enclosed });
    };
    const openArea = Object.keys(CFG.areas).find(id => !CFG.areas[id].seed);
    return {
      build, gw, gh, X0, Y0, X1, Y1, C,
      areaAt(x, y) {                                  // which area a tap on the water belongs to (null on land)
        const b = build(), i = idx(x, y);
        if (i < 0) return openArea;
        if (b.zone[i] === 1) return null;
        return b.zone[i] >= 2 ? b.enclosed[b.zone[i] - 2] : openArea;
      }
    };
  })();

  /* ---------- UI ---------- */
  const tabs = $$("[data-go]");
  const dial = $(".vx-dial");
  const notes = $(".vx-notes");
  const hint = $(".vx-hint");
  const northBtn = $(".vx-north");
  const arrowLbl = $("[data-vx-dir]");

  // the pie: one wedge per sector, plus a centre arrow that turns the short way
  const pt = (b, r) => { const a = b * Math.PI / 180; return [(r * Math.sin(a)).toFixed(2), (-r * Math.cos(a)).toFixed(2)]; };
  const wedge = (a1, a2, R = 47, r = 17) => {
    const span = ((a2 - a1) % 360 + 360) % 360, big = span > 180 ? 1 : 0, g = 2;
    const s = a1 + g, e = a1 + span - g;
    const [x1, y1] = pt(s, R), [x2, y2] = pt(e, R), [x3, y3] = pt(e, r), [x4, y4] = pt(s, r);
    return `M${x1} ${y1}A${R} ${R} 0 ${big} 1 ${x2} ${y2}L${x3} ${y3}A${r} ${r} 0 ${big} 0 ${x4} ${y4}Z`;
  };
  const pie = document.createElementNS(NS, "svg");
  pie.setAttribute("viewBox", "-50 -50 100 100"); pie.setAttribute("aria-hidden", "true"); pie.classList.add("vx-pie");
  pie.innerHTML = SECS.map(s => `<path class="vx-wedge" data-sec="${s.id}" d="${wedge(s.from, s.to)}"/>`).join("") +
    `<g class="vx-pie-arrow"><path d="M0 -11V7" /><path d="M-5 3 0 10 5 3" fill="none"/></g>`;
  dial.prepend(pie);
  const pieArrow = pie.querySelector(".vx-pie-arrow");
  SECS.forEach(s => {
    const b = document.createElement("button");
    const mid = s.from + (((s.to - s.from) % 360 + 360) % 360) / 2;
    b.type = "button"; b.className = "vx-d"; b.dataset.dir = s.id; b.textContent = s.label;
    b.style.setProperty("--a", mid + "deg");
    b.setAttribute("role", "radio");
    b.setAttribute("aria-label", s.name);
    dial.append(b);
  });
  const dirBtns = $$(".vx-d");
  const wedges = [...pie.querySelectorAll(".vx-wedge")];
  let pieAng = BEAR(st.dir);

  const renderNotes = () => {
    if (!notes) return;
    const key = st.area + "-" + st.dir;
    const tpl = $(`template[data-note="${key}"]`) || $(`template[data-note="${st.area}-*"]`) || $('template[data-note="soon"]');
    const a = st.area === "overview" ? null : CFG.areas[st.area];
    notes.innerHTML = "";
    const head = document.createElement("p");
    head.className = "vx-notes-head";
    head.innerHTML = a ? `<span class="area ${a.tag || ""}">${flagOf(a)}${a.label}</span> ${SEC(st.dir).name}` : `<span class="area">Pick an area</span> ${SEC(st.dir).name}`;
    notes.append(head, tpl.content.cloneNode(true));
  };

  const setLayers = () => {
    const a = CFG.areas[st.area];
    root.dataset.area = st.area;
    root.dataset.layer = a ? a.layer : "overview";
    windFx.set(a ? (a.field && (a.field[st.dir] || a.field["*"])) || {} : null, a ? zoneGrid(st.area, st.dir) : null);   /* wind in the bay too (James 16 Nov) */
    drawZones(st.area, st.dir);
    waveFx.set(st.dir);                                   // swell everywhere it can reach; faint in wind areas (CSS)
  };

  const setHint = () => {
    if (!hint) return;
    const a = CFG.areas[st.area];
    hint.textContent = a ? (a.hint || "") : (CFG.overviewHint || "");
    hint.hidden = !hint.textContent;
    hint.classList.remove("out");
    clearTimeout(setHint.t); setHint.t = setTimeout(() => hint.classList.add("out"), 5000);   // says it once, then gets out of the way
  };

  const go = (area, opts = {}) => {
    const prev = st.area;
    st.area = area;
    tabs.forEach(t => t.setAttribute("aria-pressed", String(t.dataset.go === area)));
    setLayers();
    renderNotes();
    setHint();
    const far = prev !== area && prev !== "overview" && area !== "overview";
    fly(shot(area), opts.instant ? 0 : far ? 1300 : 1000, far ? .6 : .25);
  };
  const setDirUI = d => {
    st.dir = SEC(d).id;
    dirBtns.forEach(b => { const on = b.dataset.dir === st.dir; b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; });
    wedges.forEach(w => w.classList.toggle("on", w.dataset.sec === st.dir));
    pieAng += short(BEAR(st.dir) - pieAng);                // turn the dial arrow the short way, never a full spin
    pieArrow.style.transform = `rotate(${pieAng}deg)`;
    if (arrowLbl) arrowLbl.textContent = `${st.dir} · ${String(Math.round(BEAR(st.dir))).padStart(3, "0")}°`;
  };
  const setDir = (d, opts = {}) => {
    setDirUI(d);
    setLayers();
    renderNotes();
    if (!opts.silent) fly({ ...cam, r: rotFor() }, 800, 0); else apply();
  };
  const setNorth = on => {
    st.northUp = on;
    northBtn.setAttribute("aria-pressed", String(on));
    root.classList.toggle("vx-northup", on);
    fly({ ...cam, r: rotFor() }, 800, 0);
  };

  let story = null;                                       // set up at the end when the page has a .vx-story
  root.addEventListener("click", e => {
    const g = e.target.closest("[data-go]"); if (g) { story ? story.goTo(g.dataset.go, st.dir) : go(g.dataset.go); return; }
    const d = e.target.closest(".vx-d, .vx-wedge"); if (d) { const n = d.dataset.dir || d.dataset.sec; story ? story.goTo(st.area === "overview" ? "harbour" : st.area, n) : setDir(n); return; }
    if (e.target.closest(".vx-north")) setNorth(!st.northUp);
  });
  dial.addEventListener("keydown", e => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!k) return;
    e.preventDefault();
    const n = SECS[(SECS.findIndex(s => s.id === st.dir) + k + SECS.length) % SECS.length].id;
    story ? story.goTo(st.area === "overview" ? "harbour" : st.area, n) : setDir(n); dirBtns.find(b => b.dataset.dir === n).focus();
  });

  /* ---------- drag to look round (a little), tap or pull to change area ---------- */
  (() => {
    let p = null;
    const LIM = .32, PULL = .22;                          // pan limit and "pull across" threshold, as a share of the area's span
    view.addEventListener("pointerdown", e => {
      if (e.button || e.target.closest("button, a")) return;
      cancelAnimationFrame(tw);
      p = { id: e.pointerId, sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false };
    });
    view.addEventListener("pointermove", e => {
      if (!p || e.pointerId !== p.id) return;
      const dx = e.clientX - p.sx, dy = e.clientY - p.sy;
      if (!p.moved && Math.hypot(dx, dy) < 7) return;
      if (!p.moved) { p.moved = true; try { view.setPointerCapture(p.id); } catch (_) {} root.classList.add("vx-drag"); }
      const [wx, wy] = screenVec(dx, dy), base = spot(st.area), span = base.span;
      let ox = p.cx - wx - base.x, oy = p.cy - wy - base.y;
      const d = Math.hypot(ox, oy), lim = span * LIM;
      if (d > lim) { const k = (lim + (d - lim) * .25) / d; ox *= k; oy *= k; }   // rubber band
      cam.x = base.x + ox; cam.y = base.y + oy; apply();
    });
    const end = e => {
      if (!p || e.pointerId !== p.id) return;
      const q = p; p = null; root.classList.remove("vx-drag");
      if (e.type === "pointercancel") return;
      if (!q.moved) {                                     // a tap on the water: harbour inside the walls, bay outside
        const r = view.getBoundingClientRect();
        const [wx, wy] = screenVec(e.clientX - r.left - W / 2, e.clientY - r.top - H / 2);
        const to = grid.areaAt(cam.x + wx, cam.y + wy);
        if (to && to !== st.area) story ? story.goTo(to, st.dir) : go(to);
        return;
      }
      const a = CFG.areas[st.area], base = spot(st.area);
      const other = a && a.exit && CFG.areas[a.exit];
      if (other) {                                        // pulled far enough towards the other area?
        const vx = other.x - base.x, vy = other.y - base.y, vl = Math.hypot(vx, vy);
        const along = ((cam.x - base.x) * vx + (cam.y - base.y) * vy) / vl;
        if (along > base.span * PULL) { story ? story.goTo(a.exit, st.dir) : go(a.exit); return; }
      }
    };
    view.addEventListener("pointerup", end);
    view.addEventListener("pointercancel", end);
  })();

  /* ---------- wind lines (wind-aligned frame: straight lines blowing with the wind) ---------- */
  const windFx = (() => {
    const cv = $(".vx-wind"), ctx = cv.getContext("2d");
    let field = null, zg = null, ps = [], dpr = 1, on = false, D = 1;
    const spawn = (p, anywhere) => { p.u = (Math.random() - .5) * D; p.v = anywhere ? (Math.random() - .5) * D : -D / 2 - 10 * Math.random(); p.age = 0; p.k = undefined; p.max = 60 + Math.random() * 90; return p; };
    const speed = u => {
      const f = field || {}, g = f.gain ?? .9, x = Math.max(0, Math.min(1, (u + W / 2) / W));
      const lane = f.bias === "left" ? 1 - x : f.bias === "right" ? x : .5;
      return (RM ? .5 : 1) * (1.1 + g * 2.4 * lane * lane) * (W / 380);
    };
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1); cv.width = W * dpr; cv.height = H * dpr;
      D = Math.hypot(W, H);
      ps = Array.from({ length: Math.round(D * D / 1500) }, () => spawn({}, true));
    };
    let t = 0, still = 0;
    const frame = () => {
      if (!on) return;
      if (RM && ++still > 150) return;                      // reduced motion: draw a settled frame, then stop
      t += .016;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,.055)"; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      const a = (BEAR(st.dir) + cam.r) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      ctx.setTransform(dpr * c, dpr * s, -dpr * s, dpr * c, dpr * W / 2, dpr * H / 2);
      ctx.lineCap = "round";
      const ca = cam.r * Math.PI / 180, cc = Math.cos(ca), cs = Math.sin(ca);
      for (const p of ps) {
        let v = speed(p.u);
        if (zg) {                                          // where is this line on the chart? lighter or more breeze there
          const sx = c * p.u - s * p.v, sy = s * p.u + c * p.v;
          const k = zg(cam.x + (sx * cc + sy * cs) / cam.z, cam.y + (-sx * cs + sy * cc) / cam.z);
          p.k = (p.k ?? k) + (k - (p.k ?? k)) * .12;       // ease in and out of a zone, no hard jumps
          v *= p.k;
        }
        const nu = p.u + Math.sin(p.v * .01 + p.u * .004 + t * .6) * .04 * v;   // barely any wobble: James wasn't sold on the curving
        const nv = p.v + v;
        const al = Math.min(1, p.age / 12) * Math.min(1, (p.max - p.age) / 16);
        ctx.strokeStyle = `rgba(232,242,255,${.75 * al})`;
        ctx.lineWidth = .7 + v / (W / 380) * .28;
        ctx.beginPath(); ctx.moveTo(p.u, p.v); ctx.lineTo(nu, nv); ctx.stroke();
        p.u = nu; p.v = nv; p.age++;
        if (p.v > D / 2 || p.age > p.max) spawn(p, Math.random() < .7);
      }
      loop.need();
    };
    return {
      resize, frame,
      set(f, z) { field = f; zg = z || null; on = !!f; still = 0; cv.classList.toggle("on", on); if (!on) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); } loop.need(); },
      get on() { return on; }
    };
  })();

  /* ---------- swell crests (world space, refraction + diffraction; nothing behind the gates) ---------- */
  const waveFx = (() => {
    const cv = $(".vx-waves"), ctx = cv.getContext("2d");
    const { gw, gh, X0, Y0, X1, Y1, C } = grid;
    cv.width = gw; cv.height = gh;
    cv.style.cssText = `left:${X0 / S + OX}px;top:${Y0 / S + OX}px;width:${(X1 - X0) / S}px;height:${(Y1 - Y0) / S}px`;
    let T = null, amp = null, dir = null, on = false, img = null, cache = {}, g = null;
    const speedAt = i => .4 + .6 * Math.min(1, g.dist[i] / 1400);   // shoaling: slower near the shore
    const solve = d => {
      if (cache[d]) return cache[d];
      g = grid.build(); if (!img) img = ctx.createImageData(gw, gh);
      const blk = g.wall;
      const b = BEAR(d) * Math.PI / 180, kx = -Math.sin(b), ky = Math.cos(b);   // direction the swell travels
      const n = gw * gh, t = new Float32Array(n).fill(Infinity), done = new Uint8Array(n);
      const hv = [], hi = [];
      const push = (v, i) => { let k = hv.length; hv.push(v); hi.push(i); while (k) { const p = (k - 1) >> 1; if (hv[p] <= v) break; hv[k] = hv[p]; hi[k] = hi[p]; k = p; } hv[k] = v; hi[k] = i; };
      const pop = () => { const v0 = hv[0], i0 = hi[0], v = hv.pop(), i = hi.pop(); if (hv.length) { let k = 0; for (;;) { let c = 2 * k + 1; if (c >= hv.length) break; if (c + 1 < hv.length && hv[c + 1] < hv[c]) c++; if (hv[c] >= v) break; hv[k] = hv[c]; hi[k] = hi[c]; k = c; } hv[k] = v; hi[k] = i; } return [v0, i0]; };
      let pmin = Infinity;
      const proj = (x, y) => (x * kx + y * ky) * C;
      for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) pmin = Math.min(pmin, proj(x, y));
      const seed = (x, y) => { const i = y * gw + x; if (blk[i]) return; const v = proj(x, y) - pmin; if (v < t[i]) { t[i] = v; push(v, i); } };
      if (kx > .05) for (let y = 0; y < gh; y++) seed(0, y);
      if (kx < -.05) for (let y = 0; y < gh; y++) seed(gw - 1, y);
      if (ky > .05) for (let x = 0; x < gw; x++) seed(x, 0);
      if (ky < -.05) for (let x = 0; x < gw; x++) seed(x, gh - 1);
      const OFF = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1], [2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
      while (hv.length) {
        const [v, i] = pop();
        if (done[i]) continue; done[i] = 1;
        const x = i % gw, y = (i / gw) | 0, si = speedAt(i);
        for (const [dx, dy] of OFF) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
          const j = ny * gw + nx;
          if (blk[j] || done[j]) continue;
          if (Math.abs(dx) + Math.abs(dy) === 3) {   // knight move: both cells it brushes must be water
            const ax = x + Math.sign(dx) * (Math.abs(dx) === 2 ? 1 : 0), ay = y + Math.sign(dy) * (Math.abs(dy) === 2 ? 1 : 0);
            if (blk[ay * gw + ax] || blk[(y + Math.sign(dy)) * gw + x + Math.sign(dx)]) continue;
          }
          const nv = v + Math.hypot(dx, dy) * C * 2 / (si + speedAt(j));
          if (nv < t[j]) { t[j] = nv; push(nv, j); }
        }
      }
      // amplitude: lose energy where the swell had to bend round something, and in very shallow water
      const a = new Float32Array(n), A0 = (CFG.waveAmp || {})[d] ?? .6;
      for (let i = 0; i < n; i++) {
        if (blk[i] || t[i] === Infinity) continue;
        const x = i % gw, y = (i / gw) | 0, straight = proj(x, y) - pmin;
        const bend = Math.max(0, t[i] - straight);          // extra travel time from bending round land or slowing
        a[i] = A0 * Math.max(.3, 1 - bend / 7000) * Math.min(1, .35 + g.dist[i] / 500);
      }
      return (cache[d] = { t, a });
    };
    const LAMBDA = CFG.waveLength || 650;
    let ph = 0;
    const frame = () => {
      if (!on || !T) return;
      ph += RM ? 0 : CFG.waveSpeed || 7;
      const px = img.data;
      for (let i = 0, n = gw * gh; i < n; i++) {
        const k = i * 4;
        if (!amp[i]) { px[k + 3] = 0; continue; }
        const c = .5 + .5 * Math.cos(2 * Math.PI * (T[i] - ph) / LAMBDA);
        const crest = c * c * c * c * c * c * c * c;
        const al = amp[i] * (40 + 215 * crest);
        px[k] = 150 + 105 * crest; px[k + 1] = 200 + 55 * crest; px[k + 2] = 255; px[k + 3] = al;
      }
      ctx.putImageData(img, 0, 0);
      if (!RM) loop.need();                                  // reduced motion: one still frame
    };
    return {
      frame,
      get on() { return on; },
      set(d) {
        on = !!d; cv.classList.toggle("on", on);
        if (!on) { loop.need(); return; }
        if (d === dir && T) { loop.need(); return; }
        dir = d;
        root.classList.add("vx-busy");
        setTimeout(() => { const r = solve(d); if (dir !== d) return; T = r.t; amp = r.a; root.classList.remove("vx-busy"); frame(); }, 30);
      }
    };
  })();

  /* ---------- one animation loop, paused off screen ---------- */
  const loop = (() => {
    let visible = true, queued = false, last = 0;
    const tick = now => {
      queued = false;
      if (!visible) return;
      if (windFx.on) windFx.frame();
      if (now - last > 32) { last = now; waveFx.frame(); } else if (waveFx.on) loop.need();
    };
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop.need(); }).observe(view);
    return { need() { if (!queued && visible) { queued = true; requestAnimationFrame(tick); } } };
  })();

  const size = () => {
    const r = view.getBoundingClientRect();
    W = r.width; H = r.height;
    windFx.resize();
    cam.z = shot(st.area).z; apply();
  };
  new ResizeObserver(size).observe(view);
  size();
  Object.assign(cam, shot(st.area));
  setDir(st.dir, { silent: true });
  go(st.area, { instant: true });

  /* ---------- story mode (P2): the map pins, the paragraphs drive it ---------- */
  const spine = root.closest(".vx-spine"), storyEl = spine && spine.querySelector(".vx-story");
  if (storyEl) {
    spine.classList.add("vx-live");
    const cap = $("figcaption");
    if (cap) { cap.classList.add("vx-cap"); spine.append(cap); }      // attribution under the story, not inside the pin
    if (hint) hint.hidden = true;
    const beats = [...storyEl.querySelectorAll("[data-vx-beat]")];
    const chaps = [...storyEl.querySelectorAll(".vx-chap")];
    // the area heads get the course flag
    storyEl.querySelectorAll(".area[data-flag]").forEach(el => el.insertAdjacentHTML("afterbegin", FLAGS[el.dataset.flag] || ""));
    const side = matchMedia("(min-width: 1100px)");
    const line = () => {                                    // the reading line: under the map on phones, mid screen beside it
      if (side.matches) return innerHeight * .5;
      const r = root.getBoundingClientRect();
      return Math.max(r.bottom, 0) + (innerHeight - Math.max(r.bottom, 0)) * .3;
    };
    let cur = null;
    const activate = b => {
      if (b === cur) return; cur = b;
      const ch = b.closest(".vx-chap"), area = ch.dataset.area, dir = SEC(ch.dataset.dir).id;
      beats.forEach(x => x.classList.toggle("is-on", x === b));
      chaps.forEach(c => c.classList.toggle("vx-on", c === ch));     // bias bars fill each time their chapter comes in
      const prev = { area: st.area, dir: st.dir, cam: camKey };
      camKey = b.dataset.cam || "";
      st.area = area;
      tabs.forEach(t => t.setAttribute("aria-pressed", String(t.dataset.go === area)));
      if (dir !== prev.dir) setDirUI(dir);
      if (area !== prev.area || dir !== prev.dir) setLayers();
      drawMarks(area, dir);
      showMarks(new Set((b.dataset.show || "").split(/\s+/).filter(Boolean)));
      if (area !== prev.area || dir !== prev.dir || camKey !== prev.cam) {
        const wide = camKey || prev.cam || area !== prev.area || dir !== prev.dir;
        fly(shot(area), wide ? 600 : 400, area !== prev.area ? .15 : 0);   // 400 ms inside an area; 600 ms to pull out or move across
      }
    };
    const pick = () => {
      const y = line();
      let b = beats[0];
      for (const x of beats) { if (x.getBoundingClientRect().top <= y) b = x; else break; }
      activate(b);
    };
    // stuck = the spine has scrolled past the pin line and the map hasn't reached its end: only then it slides with the nav
    const stuck = () => {
      const r = spine.getBoundingClientRect(), t = parseFloat(getComputedStyle(root).top) || 0;
      root.classList.toggle("is-stuck", r.top < t && r.bottom > t + root.offsetHeight + 1);
    };
    let q = false;
    const onScroll = () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; pick(); stuck(); }); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    story = {
      goTo(area, dir) {
        const ch = chaps.find(c => c.dataset.area === area && (area === "overview" || c.dataset.dir === SEC(dir).id)) || chaps.find(c => c.dataset.area === area);
        if (!ch) return;
        const first = ch.querySelector("[data-vx-beat]");
        const y = scrollY + first.getBoundingClientRect().top - line() + 4;
        scrollTo({ top: y, behavior: RM ? "auto" : "smooth" });
      }
    };
    pick(); stuck();
  }
  root.classList.add("vx-ready");
})();
