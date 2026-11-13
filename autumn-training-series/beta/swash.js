/* Beyond the Shift /beta — swash (POLISH-AUDIT #47 v3, James 12 Nov).
   Canvas wave modelled on overhead drone footage of swash running up sand and draining back:
   - the front is lumpy, not scalloped: a few big tongues plus mid lobes and small jags, each drifting at its own rate
   - a thin dark wet line runs just ahead of the foam (sand darkening as it soaks)
   - a thick white foam band with holes in it; holes are small at the front and grow towards the back
   - behind the foam, see-through turquoise water with a lacy caustic net
   - on the backwash the foam band thins, its holes open up and stretch seawards, and lace + streaks trail behind it,
     while the wet line widens into a soft dark band of just-uncovered sand
   API: BTSswash(layer, {swash, hold, back}) -> { reach(x, y, back), front(x, t), time(), foam, total, stop() } or null.
   Side sweep (James 13 Nov, "it makes the site look slow"): BTSswash(layer, {dir: 1 | -1, sweep, fade}) runs ONE pass
   across from the left (1) or right (-1) edge and fades out as it leaves, no hold or backwash. The wave is drawn in its
   own "wave space" (x' along the front, y' the way it travels) and turned onto the screen with a base transform, so
   front(x', t) takes the cross-axis position (screen y) and returns how far the front has travelled from its edge.
   v6 (13 Nov): the side sweep runs at a slight angle (opt.tilt, random lean each wash) so it reads as swash, not a wipe;
   phones and touch screens get a lite drawing (no blurred shadows, 1x canvas, coarser front, fewer holes) so it
   holds its frame rate; starting a new wash releases the old one, which fades out over ~180 ms instead of vanishing.
   front()/time() let callers float things on the water (calendar.js rides bars in and out on it).
   reach() gives the coverage fraction p (0..1) at which the front crosses (x, y) so callers can time things to it. */
(function () {
  "use strict";
  const TAU = Math.PI * 2;
  const rng = seed => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);

  // a sum of sines, normalised so it stays inside -1..1; each part drifts at its own speed (rad/ms)
  function field(rand, spec) {
    const cs = [];
    spec.forEach(([n, lo, hi, a, ws]) => {
      for (let i = 0; i < n; i++) cs.push({ k: TAU / (lo + rand() * (hi - lo)), ph: rand() * TAU, a: a * (.6 + rand() * .8), w: (rand() - .5) * 2 * ws });
    });
    const sum = cs.reduce((s, c) => s + c.a, 0);
    cs.forEach(c => { c.a /= sum; });
    return (x, t) => { let v = 0; for (const c of cs) v += c.a * Math.sin(c.k * x + c.ph + c.w * t); return v; };
  }

  // seamless tile of cell walls (a Voronoi net): the web of light lines in shallow water and in thinning foam.
  // g = cells per side; width = wall thickness in px; some walls are fainter so it never looks like a grid.
  function cells(rand, size, g, width, alpha) {
    const pts = [], lum = [], cs = size / g;
    for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) {
      pts.push([(i + .1 + rand() * .8) * cs, (j + .1 + rand() * .8) * cs]);
      lum.push(.35 + rand() * .65);
    }
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const cx = c.getContext("2d"), img = cx.createImageData(size, size), d = img.data;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const gi = Math.floor(x / cs), gj = Math.floor(y / cs);
      let d1 = 1e9, d2 = 1e9, k1 = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const ii = gi + di, jj = gj + dj, wi = (ii + g) % g, wj = (jj + g) % g, p = pts[wj * g + wi];
        const px = p[0] + (ii - wi) * cs, py = p[1] + (jj - wj) * cs, dd = Math.hypot(px - x, py - y);
        if (dd < d1) { d2 = d1; d1 = dd; k1 = wj * g + wi; } else if (dd < d2) d2 = dd;
      }
      const e = (d2 - d1) / width, a = e >= 1 ? 0 : (1 - e) * (1 - e) * alpha * lum[k1];
      const o = (y * size + x) * 4;
      d[o] = d[o + 1] = d[o + 2] = 255; d[o + 3] = a * 255;
    }
    cx.putImageData(img, 0, 0);
    return c;
  }
  let tiles = null;   // built once per page, reused by every wash
  const getTiles = rand => tiles || (tiles = {
    caustic: cells(rand, 192, 9, 1.5, .34),     // fine net, just behind the foam
    deep: cells(rand, 288, 7, 2, .12),       // bigger, fainter cells further out
    foam: cells(rand, 140, 8, 3, .9)        // fat white walls: foam breaking up into lace on the drain
  });

  let live = null;
  window.BTSswash = function (layer, opt) {
    const SX = layer.clientWidth, SY = layer.clientHeight;
    if (!SX || !SY || !document.createElement("canvas").getContext) return null;
    if (live) live.release();
    const dir = opt.dir === 1 || opt.dir === -1 ? opt.dir : 0;
    const W = dir ? SY : SX, H = dir ? SX : SY;   // wave space: W along the front, H the way it travels
    const SW = dir ? opt.sweep : opt.swash, HO = dir ? 0 : opt.hold, BA = dir ? opt.fade : opt.back;
    const TOTAL = dir ? SW + BA * .5 : SW + HO + BA;   // sideways the fade starts while the front is leaving
    const rand = rng((Math.random() * 1e9) | 0);
    const L = Math.min(60, Math.max(18, H * .08));   // how far tongues of water run ahead of the mean line
    // lean of the front across the screen (rise per px); sideways only, random way each wash
    const slope = dir ? (opt.tilt != null ? opt.tilt : .07) * (rand() < .5 ? -1 : 1) : 0;
    const M = L + 14 + Math.abs(slope) * W / 2;      // start and finish fully off the top, end the run fully past the bottom
    const lite = opt.lite != null ? opt.lite : window.innerWidth < 760 || matchMedia("(pointer: coarse)").matches;
    const F0 = Math.min(110, Math.max(32, H * .16)); // foam band thickness at its fullest

    const edgeF = field(rand, [[3, W * .45, W * 1.3, 1, .0007], [4, 70, 170, .32, .0018], [6, 12, 30, .08, .004]]);
    const foamF = field(rand, [[3, 90, 260, 1, .001], [5, 34, 80, .3, .003], [4, 12, 22, .06, .005]]);
    const laceF = field(rand, [[3, 80, 220, 1, .0012], [4, 20, 60, .4, .003]]);

    function phase(t) {
      if (dir) {
        // one even pass, easing off a touch; foam thins and opens up as it fades
        const u = Math.min(1, t / SW), f0 = TOTAL - BA;
        return { p: u * (1.3 - .3 * u), b: t > f0 ? Math.min(1, (t - f0) / BA) : 0, g: Math.min(1, u * 3) };
      }
      if (t < SW) { const u = t / SW; return { p: 1 - (1 - u) * (1 - u), b: 0, g: u }; }   // runs up fast, slows
      if (t < SW + HO) return { p: 1, b: 0, g: 1 };
      const u = Math.min(1, (t - SW - HO) / BA);
      return { p: 1 - u * u, b: u, g: 1 };                                                   // drains slowly, then rushes
    }
    const ampOf = s => L * (s.b ? 1 - .35 * s.b : .5 + .5 * s.g);   // tongues grow on the run up, flatten on the drain
    const reach = (x, y, back) => {
      const t = dir ? SW * .5 : back ? SW + HO + BA * .5 : SW * .5, off = edgeF(x, t) * ampOf(phase(t)) + slope * (x - W / 2);
      return Math.min(1, Math.max(0, (y - off + M) / (H + 2 * M)));
    };

    const dpr = lite ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
    // wave space -> screen: (x', y') -> (y', x') from the left, (SX - y', x') from the right
    const base = dir ? [0, dpr, dir * dpr, 0, dir < 0 ? SX * dpr : 0, 0] : [dpr, 0, 0, dpr, 0, 0];
    // shadows ignore the transform, so point their offset the way the wave is travelling
    const shOff = (c, v) => { c.shadowOffsetX = dir ? dir * v : 0; c.shadowOffsetY = dir ? 0 : v; };
    const cv = document.createElement("canvas"), fc = document.createElement("canvas");
    cv.className = "fx-swash";
    cv.width = fc.width = Math.round(SX * dpr); cv.height = fc.height = Math.round(SY * dpr);
    layer.appendChild(cv);
    const ctx = cv.getContext("2d"), fx = fc.getContext("2d");

    const T = getTiles(rand);
    const caustic = ctx.createPattern(T.caustic, "repeat");
    const caustic2 = ctx.createPattern(T.deep, "repeat");
    const foamNet = fx.createPattern(T.foam, "repeat");

    const STEP = lite ? 10 : 6, xs = [];
    for (let x = -STEP; x <= W + STEP; x += STEP) xs.push(x);
    const n = xs.length, ys = new Float32Array(n), fb = new Float32Array(n), lb = new Float32Array(n);
    const at = x => Math.min(n - 1, Math.max(0, Math.round((x + STEP) / STEP)));

    // holes in the foam: d = depth into the band (0 front, 1 back); bigger towards the back, like the footage
    // each hole is a lumpy 7-sided blob, not a circle
    const holes = [];
    for (let i = Math.round(W * (lite ? .1 : .17)); i--;) {
      const d = Math.pow(rand(), .65), sh = [];
      for (let j = 0; j < 7; j++) sh.push(.7 + rand() * .55);
      holes.push({ x: rand() * W, d, r: (.9 + rand() * (1 + 5.5 * d * d)) * F0 / 60, rot: rand() * TAU, sq: .55 + rand() * .45, sh });
    }

    const strip = (front, back) => {
      const p = new Path2D();
      p.moveTo(xs[0], front[0]);
      for (let i = 1; i < n; i++) p.lineTo(xs[i], front[i]);
      for (let i = n - 1; i >= 0; i--) p.lineTo(xs[i], back[i]);
      p.closePath();
      return p;
    };

    function frame(t) {
      const s = phase(t), A = ampOf(s), mean = -M + s.p * (H + 2 * M), b = s.b;
      const rf = rel ? Math.max(0, 1 - (performance.now() - rel) / 180) : 1;   // released: quick fade out
      const fade = rf * (dir ? Math.max(0, Math.min(1, t / 60, 1 - b * b * (3 - 2 * b)))
        : Math.max(0, Math.min(1, t / 90, (TOTAL - t) / 160)));
      const thick = F0 * (b ? 1 - .62 * b : .55 + .45 * s.g);
      const net = F0 * (.3 + 1.3 * b);
      for (let i = 0; i < n; i++) {
        const x = xs[i];
        ys[i] = mean + edgeF(x, t) * A + slope * (x - W / 2);
        fb[i] = ys[i] - thick * (.75 + .5 * foamF(x, t));
        lb[i] = fb[i] - net * (.7 + .5 * laceF(x, t));
      }
      const water = new Path2D();
      water.moveTo(xs[0], -60);
      for (let i = 0; i < n; i++) water.lineTo(xs[i], ys[i]);
      water.lineTo(xs[n - 1], -60);
      water.closePath();

      ctx.setTransform(...base);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = fade;

      // 1. wet sand: the water's shadow cast just ahead of it; widens into a soft band on the drain
      ctx.save();
      ctx.shadowColor = `rgba(0,6,18,${.55 + .15 * b})`;
      ctx.shadowBlur = lite ? 0 : (4 + 24 * b) * dpr;   // blur is the costliest thing on a phone; a hard edge reads fine
      shOff(ctx, (2 + 9 * b) * dpr);
      ctx.fillStyle = "#000";
      ctx.fill(water);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill(water);
      ctx.restore();

      // 2. the water: deep teal far back, clear turquoise in the shallows, thinner as it drains
      const g = ctx.createLinearGradient(0, mean - H * .85, 0, mean);
      g.addColorStop(0, "rgba(14,92,122,.42)");
      g.addColorStop(.6, "rgba(34,150,160,.32)");
      g.addColorStop(.85, "rgba(92,206,186,.34)");
      g.addColorStop(1, "rgba(150,230,200,.40)");
      ctx.globalAlpha = fade * (1 - .3 * b);
      ctx.fillStyle = g;
      ctx.fill(water);

      // 3. caustic net, travelling with the water; a brighter one in the shallows behind the foam
      ctx.save();
      ctx.clip(water);
      ctx.globalAlpha = fade * .8;
      caustic2.setTransform(new DOMMatrix([1, 0, 0, 1, Math.sin(t / 520) * 10, mean * .8]));
      ctx.fillStyle = caustic2;
      ctx.fillRect(0, 0, W, H);
      // three overlapping bands so the net fades out away from the foam instead of stopping at a line
      caustic.setTransform(new DOMMatrix([1, 0, 0, 1 + .8 * b, t * .012, mean]));
      ctx.fillStyle = caustic;
      ctx.globalAlpha = fade * .4;
      const back = new Float32Array(n);
      for (const k of lite ? [2.3] : [1.3, 2.3, 3.6]) {
        for (let i = 0; i < n; i++) back[i] = ys[i] - F0 * k * (.8 + .4 * laceF(xs[i] * 1.7, t));
        ctx.fill(strip(ys, back));
      }
      ctx.restore();

      // 4. foam, drawn on its own canvas so the holes punch through foam only
      fx.setTransform(...base);
      fx.clearRect(0, 0, W, H);
      if (b > 0) {
        const on = Math.min(1, b * 2.2);
        // lacy foam left behind the band, stretched seawards
        fx.save();
        fx.clip(strip(fb, lb));
        fx.globalAlpha = .75 * on;
        foamNet.setTransform(new DOMMatrix([1.2, 0, 0, 1 + 1.6 * b, 0, mean]));
        fx.fillStyle = foamNet;
        fx.fillRect(0, 0, W, H);
        fx.restore();
      }
      fx.fillStyle = "rgba(246,250,252,.82)";
      fx.fill(strip(ys, fb));
      const mid = new Float32Array(n);
      for (let i = 0; i < n; i++) mid[i] = ys[i] - (ys[i] - fb[i]) * (.5 - .2 * b);
      fx.fillStyle = "rgba(255,255,255,.95)";
      fx.fill(strip(ys, mid));
      // holes: open up and stretch seawards on the drain
      const hp = new Path2D(), grow = 1 + 1.5 * b, pull = 1 + 2 * b;
      for (const h of holes) {
        const i = at(h.x), y = ys[i] - h.d * (ys[i] - fb[i]), rx = h.r * grow, ry = h.r * h.sq * pull;
        const c = Math.cos(h.rot * (1 - b)), s = Math.sin(h.rot * (1 - b)), k = h.sh.length;
        // lumpy outline smoothed through the midpoints, so holes look soft rather than chipped
        const P = [];
        for (let j = 0; j < k; j++) {
          const a = j / k * TAU, m = h.sh[j], px = Math.cos(a) * rx * m, py = Math.sin(a) * ry * m;
          P.push([h.x + px * c - py * s, y + px * s + py * c]);
        }
        const mx = j => (P[j % k][0] + P[(j + 1) % k][0]) / 2, my = j => (P[j % k][1] + P[(j + 1) % k][1]) / 2;
        hp.moveTo(mx(k - 1), my(k - 1));
        for (let j = 0; j < k; j++) hp.quadraticCurveTo(P[j][0], P[j][1], mx(j), my(j));
        hp.closePath();
      }
      fx.globalCompositeOperation = "destination-out";
      fx.fillStyle = "rgba(0,0,0,.78)";   // a film of foam stays in the holes, like the sand showing through in the footage
      fx.fill(hp);
      fx.globalCompositeOperation = "source-over";
      // bright lip on the leading edge
      const lip = new Path2D();
      lip.moveTo(xs[0], ys[0]);
      for (let i = 1; i < n; i++) lip.lineTo(xs[i], ys[i]);
      fx.strokeStyle = "rgba(255,255,255,.95)";
      fx.lineWidth = 2 - .8 * b;
      fx.lineJoin = "round";
      fx.stroke(lip);

      // foam sits on the water: a soft shadow gives the holes their rims
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = fade;
      ctx.shadowColor = lite ? "transparent" : "rgba(0,24,40,.32)";
      ctx.shadowBlur = lite ? 0 : 3 * dpr;
      shOff(ctx, 1.5 * dpr);
      ctx.drawImage(fc, 0, 0);
      ctx.restore();
    }

    let raf = 0, t0 = 0, stopped = false, rel = 0;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      cv.remove();
      if (live === api) live = null;
    };
    const loop = now => {
      if (stopped) return;
      if (!t0) t0 = now;
      const t = now - t0;
      if (t >= TOTAL || (rel && now - rel > 180)) return stop();
      frame(t);
      raf = requestAnimationFrame(loop);
    };
    frame(0);
    // opt.still: draw frames on demand only (loader-test style scrubbing), no clock
    if (!opt.still) raf = requestAnimationFrame(loop);
    // front(x, t): y of the leading edge at time t; time(): ms since the wash started (0 until the first frame)
    const front = (x, t) => { const s = phase(t); return -M + s.p * (H + 2 * M) + edgeF(x, t) * ampOf(s) + slope * (x - W / 2); };
    // let go of this wash (a newer one is starting): fade it out quickly rather than cutting it
    const release = () => { if (stopped || rel) return; if (opt.still) return stop(); rel = performance.now(); if (live === api) live = null; };
    const api = { reach, stop, release, lite, draw: frame, total: TOTAL, front, foam: F0, dir, len: H, fadeAt: TOTAL - BA, time: () => (t0 ? performance.now() - t0 : 0) };
    live = api;
    return api;
  };
})();
