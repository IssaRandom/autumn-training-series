/* Beyond the Shift /beta — "beat to the mark" loader.
   Any element with class .bk-loading (the booking pages inject them while Apps Script answers, ~3–4 s, longer on a
   cold start) is swapped for a little race course: an ILCA beats up to the windward mark between the laylines,
   through gusts, lulls and windshifts. It tacks itself on the layline; tap / click / Space tacks it early.
   Tips rotate, and the status line changes the longer the wait gets.
   The original text stays as the status line, so screen readers still hear "Loading camp…". */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const TIPS = [
    "Tack on the headers, not the lifts.",
    "Dark patches upwind are more pressure. Sail to them.",
    "Every tack costs about a boat length. Make each one count.",
    "The ILCA 7 sail is 7.06 m², the ILCA 6 5.76 m², the ILCA 4 4.7 m².",
    "The boat was designed by Bruce Kirby and Ian Bruce in 1970.",
    "Same hull, three rigs: that's why the ILCA ladder works.",
    "Look upwind more than you look at the boat.",
    "Lull? Ease the kicker a touch and keep it flat.",
    "Know the laylines. Overstanding is free distance given away.",
    "Head out of the tack hard, then settle back to your lane.",
    "Clear air beats a clever shift you can't use.",
    "Sail faster by thinking clearer.",
  ];
  /* Where the wait is going, by seconds elapsed. Apps Script usually answers in ~3.5 s. */
  const STAGES = [
    [0, null],                                                    // the page's own text, e.g. "Loading camp…"
    [4.5, "Waking up the booking system…"],
    [9, "Still beating upwind. It naps between visitors."],
    [16, "Another lap while it finishes up…"],
    [25, "This is taking longer than usual. Check your signal, or refresh the page."],
  ];
  const TACK_QUIPS = { 5: "Busy beat!", 10: "Coach says: fewer tacks.", 20: "You're tacking on every wave.", 40: "Legend. Still loading though." };

  const Q = Math.PI / 4;                                   // 45°: close-hauled angle to the wind
  const norm = a => Math.atan2(Math.sin(a), Math.cos(a));  // wrap to -π..π
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* Side-view ILCA used by the wave style: hull, mast and sail. */
  const SIDE_BOAT = `<svg class="bk-sb" viewBox="0 0 32 30" aria-hidden="true">
      <g class="bk-sb-sail"><path d="M16 3 L16 21 L28 21 Z" /></g>
      <line x1="16" y1="2" x2="16" y2="22" />
      <path class="bk-sb-hull" d="M2 22 H30 L26.5 27 H6.5 Z" />
    </svg>`;

  /* Two styles, chosen per element with data-loader="race|wave":
     race — the interactive course, for the first, main wait on a page (an Apps Script call, ~3–4 s+)
     wave — a boat riding a rolling sea, for shorter or secondary loads inside a page that's already showing
     start — the fleet shuffling on a start line while the committee boat (right) runs the flag sequence
     Where each is used: race on /book "Loading camp…", start on /account "Loading your bookings…", beat on /book
     "Loading your account…". /account's first "Opening your bookings" is the same beat as static HTML, and "Open for
     booking" uses skeleton rows (fx.css #9). wave is kept for the loader-test page.
     beat — the small version of race (POLISH-AUDIT #14): a boat tacking up to the mark plus a coach line from
            data-line. Same markup as the static one on the calendar and guides; styles in fx.css.
     No data-loader means race. ("Who's going" has its own veiled-names placeholder in ui.js.) */
  function upgrade(el) {
    if (el.dataset.loader === "1" || el.dataset.upgraded) return;
    const style = el.dataset.loader || "race";
    if (style === "beat") return beat(el);
    if (style === "wave") return wave(el);
    if (style === "start") return startLine(el);
    const label = el.textContent.trim() || "Loading…";
    const compact = !!el.closest(".bk-card");
    const box = document.createElement("div");
    box.className = "bk-loader" + (compact ? " is-compact" : "");
    box.dataset.loader = "1";
    box.innerHTML = `
      <button type="button" class="bk-loader-stage" aria-label="Tack the boat (just for fun while it loads)">
        <canvas aria-hidden="true"></canvas>
        ${reduce ? "" : `<span class="bk-loader-tap" aria-hidden="true"><span class="bk-loader-finger"></span>Tap to tack</span>`}
      </button>
      <p class="bk-loader-status" role="status" aria-live="polite"></p>
      <p class="bk-loader-tip" aria-hidden="true"></p>
      <p class="bk-loader-hint" aria-hidden="true">${reduce ? "" : "Tap the course to tack"}<span data-tacks></span></p>`;
    el.replaceWith(box);
    run(box, label);
  }

  /* Keep in step with the static copies in calendar/index.html and the guides. */
  const BEAT_SVG = `<svg class="beat-course" viewBox="0 0 48 56" aria-hidden="true"><path class="beat-lay" d="M24 6 L0 34.6 M24 6 L48 34.6"/><circle class="beat-mark" cx="24" cy="6" r="2.6"/><g class="beat-boat"><path class="beat-hull" d="M0 -5.4 C2.3 -2 2.2 2.6 1.5 3.6 L-1.5 3.6 C-2.2 2.6 -2.3 -2 0 -5.4Z"/><path class="beat-sail" d="M0 -2 Q-2.4 1 -1.4 4.4"/></g></svg>`;
  function beat(el) {
    const box = document.createElement("div");
    box.className = "beat";
    box.dataset.upgraded = "1";
    box.innerHTML = `${BEAT_SVG}<p class="beat-line" role="status"><b></b> <span></span></p>`;
    box.querySelector("b").textContent = el.textContent.trim() || "Loading…";
    box.querySelector("span").textContent = el.dataset.line || "";
    el.replaceWith(box);
  }

  function wave(el) {
    const label = el.textContent.trim() || "Loading…";
    const box = document.createElement("div");
    box.dataset.upgraded = "1";
    box.className = "bk-ld-wave";
    box.innerHTML = `
      <div class="bk-ld-wave-scene" aria-hidden="true">
        <svg class="bk-ld-sea bk-ld-sea-back" viewBox="0 0 480 40" preserveAspectRatio="none"><path d="${seaPath(14, 9)}" /></svg>
        <div class="bk-ld-wave-boat">${SIDE_BOAT}</div>
        <svg class="bk-ld-sea bk-ld-sea-front" viewBox="0 0 480 40" preserveAspectRatio="none"><path d="${seaPath(20, 7)}" /></svg>
      </div>
      <p class="bk-ld-wave-label" role="status"></p>`;
    box.querySelector("[role=status]").textContent = label.replace(/(…|\.\.\.)$/, "");  // CSS animates the dots
    el.replaceWith(box);
  }
  /* A filled sine sea, two periods of 120px in a 240px half, repeated so a -50% slide loops seamlessly. */
  function seaPath(y, amp) {
    let d = `M0 ${y}`;
    for (let x = 0; x <= 480; x += 10) d += ` L${x} ${(y + Math.sin((x / 120) * Math.PI * 2) * amp).toFixed(1)}`;
    return d + " L480 40 L0 40 Z";
  }

  function run(box, label) {
    const stage = box.querySelector(".bk-loader-stage");
    const cv = box.querySelector("canvas");
    const ctx = cv.getContext("2d");
    const status = box.querySelector(".bk-loader-status");
    const tipEl = box.querySelector(".bk-loader-tip");
    const tacksEl = box.querySelector("[data-tacks]");
    const tapEl = box.querySelector(".bk-loader-tap");
    const css = getComputedStyle(document.documentElement);
    const col = (n, f) => (css.getPropertyValue(n).trim() || f);
    const C = {
      line: "rgba(143,181,255,.24)", wind: "rgba(230,237,247,.3)", label: "rgba(230,237,247,.6)",
      hull: "#ffffff", sail: col("--blue-300", "#8fb5ff"), sailor: col("--t-champ", "#ffc531"),
      mark: col("--t-train", "#ff8a3d"), wake: "rgba(255,255,255,",
    };

    status.textContent = label;
    let stageIdx = 0;
    let tipIdx = Math.floor(Math.random() * TIPS.length);
    const showTip = () => {
      tipEl.classList.remove("in");
      setTimeout(() => { tipEl.textContent = TIPS[tipIdx++ % TIPS.length]; tipEl.classList.add("in"); }, reduce ? 0 : 220);
    };
    showTip();

    const t0 = performance.now();
    let W = 0, H = 0, mark = { x: 0, y: 0 }, startY = 0, span = 1;
    let tacks = 0, laps = 1, roundT = -1, last = t0, patches = [], streaks = [];
    const boat = { x: 0, y: 0, dir: 1, h: 0, tackT: -1e9, tackFrom: 0, wake: [] };

    /* Wind: direction it blows FROM, radians clockwise from straight up the screen. Two slow sine waves give
       oscillating shifts of up to ~±17°, a new swing every few seconds, so a 4 s beat always sees one. */
    const ph1 = rnd(0, 6), ph2 = rnd(0, 6);
    const windAt = s => 0.22 * Math.sin(s * 1.05 + ph1) + 0.08 * Math.sin(s * 2.6 + ph2);

    function newLap(s) {
      boat.x = mark.x + rnd(-0.18, 0.18) * W; boat.y = startY;
      boat.dir = Math.random() < 0.5 ? 1 : -1;
      boat.h = windAt(s) + boat.dir * Q; boat.tackT = -1e9; boat.wake = [];
    }

    /* Layout size, not getBoundingClientRect: the stage scales on :active, and treating that as a resize used to
       send the boat back to the start line on every tap. A real resize rescales the boat instead of restarting. */
    function size(s) {
      const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (!w || !h) return false;
      if (w !== W || h !== H) {
        const first = !W, fx = w / (W || w), fy = h / (H || h);
        W = w; H = h;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        mark = { x: W / 2, y: Math.max(18, H * 0.14) };
        startY = H - 14; span = startY - mark.y;
        if (first) { seed(); newLap(s); }
        else { boat.x *= fx; boat.y *= fy; boat.wake = []; }
      }
      return true;
    }

    /* Gusts (blue, faster) and lulls (dark, slower) drift down the course with the wind; streaks show its direction. */
    function seed() {
      streaks = Array.from({ length: 16 }, () => ({ x: rnd(0, W), y: rnd(0, H), l: rnd(8, 18), v: rnd(30, 50) }));
      patches = Array.from({ length: 4 }, (_, i) => ({ x: rnd(0, W), y: rnd(-H, H), r: rnd(32, 62), v: rnd(12, 20), gust: i % 2 === 0 }));
    }
    const wrap = (o, pad) => {
      if (o.y - pad > H) { o.y = -pad; o.x = rnd(0, W); }
      if (o.x < -pad) o.x = W + pad; else if (o.x > W + pad) o.x = -pad;
    };

    const hintText = () => {
      const q = TACK_QUIPS[tacks];
      tacksEl.textContent = (tacks ? ` · ${tacks} tack${tacks === 1 ? "" : "s"}` : "") + (laps > 1 ? ` · lap ${laps}` : "") + (q ? ` — ${q}` : "");
    };

    /* A tack is a quick 0.3 s pivot through the wind while the boat slows right down, so the track shows a
       small kink rather than a wide arc. */
    const TACK_MS = 300;
    function tack(now, auto) {
      if (now - boat.tackT < TACK_MS + 40) return;
      boat.tackFrom = boat.h; boat.dir *= -1; boat.tackT = now;
      if (!auto) {
        tacks++; hintText();
        if (tapEl) tapEl.classList.add("is-gone");
      }
    }
    stage.addEventListener("click", () => tack(performance.now(), false));

    function step(now, s, dt, w) {
      // heading: close-hauled on the current wind, or pivoting through a tack
      const target = w + boat.dir * Q, k = (now - boat.tackT) / TACK_MS;
      if (k < 1) {
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;   // ease in-out
        boat.h = boat.tackFrom + norm(target - boat.tackFrom) * e;
      } else boat.h = target;

      // speed: dips through the tack and recovers over ~0.5 s; gusts and lulls change it
      const since = (now - boat.tackT) / 1000;
      let v = since < 0.8 ? 0.3 + 0.7 * Math.max(0, Math.min(1, (since - 0.2) / 0.6)) : 1;
      patches.forEach(p => {
        const d = Math.hypot(p.x - boat.x, p.y - boat.y);
        if (d < p.r) v *= 1 + (p.gust ? 0.45 : -0.35) * (1 - d / p.r);
      });
      const base = span * 0.42;                      // ~4 s a beat including tacks: the typical wait
      boat.x += Math.sin(boat.h) * base * v * dt;
      boat.y -= Math.cos(boat.h) * base * v * dt;

      // auto-tack on the layline: once the mark is 45° off the wind on the other side, the other tack fetches it
      const bearing = Math.atan2(mark.x - boat.x, boat.y - mark.y);
      const rel = norm(bearing - w);
      if (k >= 1 && (boat.dir > 0 ? rel <= -Q : rel >= Q)) tack(now, true);
      if (boat.x < 10 || boat.x > W - 10) { boat.x = Math.max(10, Math.min(W - 10, boat.x)); if (k >= 1) tack(now, true); }

      // rounded the mark: a pulse, then a new lap from the start line
      if (Math.hypot(mark.x - boat.x, mark.y - boat.y) < 9 || boat.y <= mark.y) {
        laps++; roundT = now; hintText(); newLap(s);
      }
      if (!boat.wake.length || Math.hypot(boat.wake[0].x - boat.x, boat.wake[0].y - boat.y) > 2.5) {
        boat.wake.unshift({ x: boat.x, y: boat.y }); boat.wake.length = Math.min(boat.wake.length, 80);
      }
    }

    function draw(now, still) {
      const s = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = windAt(s);
      const air = { x: -Math.sin(w), y: Math.cos(w) };  // direction the air moves
      if (!still) step(now, s, dt, w);

      ctx.clearRect(0, 0, W, H);
      // gusts and lulls
      patches.forEach(p => {
        if (!still) { p.x += air.x * p.v * dt; p.y += air.y * p.v * dt; wrap(p, p.r); }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, p.gust ? "rgba(47,109,246,.22)" : "rgba(2,8,22,.42)");
        g.addColorStop(1, p.gust ? "rgba(47,109,246,0)" : "rgba(2,8,22,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      });
      // wind streaks, along the wind
      ctx.strokeStyle = C.wind; ctx.lineWidth = 1.2; ctx.lineCap = "round";
      streaks.forEach(o => {
        if (!still) { o.x += air.x * o.v * dt; o.y += air.y * o.v * dt; wrap(o, o.l); }
        ctx.beginPath(); ctx.moveTo(o.x - air.x * o.l, o.y - air.y * o.l); ctx.lineTo(o.x, o.y); ctx.stroke();
      });

      // laylines swing with the wind
      ctx.setLineDash([4, 6]); ctx.strokeStyle = C.line; ctx.lineWidth = 1;
      ctx.beginPath();
      [w + Math.PI - Q, w + Math.PI + Q].forEach(a => {
        ctx.moveTo(mark.x, mark.y); ctx.lineTo(mark.x + Math.sin(a) * H * 2, mark.y - Math.cos(a) * H * 2);
      });
      ctx.stroke(); ctx.setLineDash([]);

      // wind indicator, top left: arrow plus the shift in degrees
      const deg = Math.round(w * 180 / Math.PI);
      ctx.save(); ctx.translate(16, 16); ctx.rotate(w);
      ctx.strokeStyle = C.label; ctx.fillStyle = C.label; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(-3.5, 3); ctx.lineTo(3.5, 3); ctx.fill();
      ctx.restore();
      ctx.fillStyle = C.label; ctx.font = "700 10px Inter, system-ui, 'Segoe UI', sans-serif"; ctx.textBaseline = "middle";
      ctx.fillText(deg === 0 ? "Wind" : `${Math.abs(deg)}° ${deg > 0 ? "right" : "left"}`, 27, 16);

      // wake
      for (let i = 1; i < boat.wake.length; i++) {
        const a = boat.wake[i - 1], b = boat.wake[i], f = 1 - i / boat.wake.length;
        ctx.strokeStyle = C.wake + (0.35 * f).toFixed(3) + ")";
        ctx.lineWidth = 2 * f + 0.4;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }

      // windward mark (bobbing), with a pulse when a lap is completed
      const bob = still ? 0 : Math.sin(s * 3) * 1.5;
      ctx.fillStyle = "rgba(255,138,61,.18)";
      ctx.beginPath(); ctx.arc(mark.x, mark.y + bob, 11 + (still ? 0 : Math.sin(s * 2) * 2), 0, 7); ctx.fill();
      ctx.fillStyle = C.mark; ctx.beginPath(); ctx.arc(mark.x, mark.y + bob, 6, 0, 7); ctx.fill();
      if (roundT > 0 && now - roundT < 700) {
        const k = (now - roundT) / 700;
        ctx.strokeStyle = `rgba(255,197,49,${(1 - k).toFixed(3)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(mark.x, mark.y + bob, 8 + k * 26, 0, 7); ctx.stroke();
      }

      // boat (top-down): sail on the leeward side, flapping while head to wind
      ctx.save(); ctx.translate(boat.x, boat.y); ctx.rotate(boat.h);
      const L = Math.max(14, Math.min(20, W / 18));
      ctx.fillStyle = C.hull;
      ctx.beginPath();
      ctx.moveTo(0, -L * 0.62);
      ctx.bezierCurveTo(L * 0.26, -L * 0.25, L * 0.24, L * 0.3, L * 0.17, L * 0.4);
      ctx.lineTo(-L * 0.17, L * 0.4);
      ctx.bezierCurveTo(-L * 0.24, L * 0.3, -L * 0.26, -L * 0.25, 0, -L * 0.62);
      ctx.fill();
      const relH = norm(boat.h - w);
      const side = relH >= 0 ? 1 : -1;                // leeward side (+x = starboard in the boat's frame)
      const luff = Math.abs(relH) < 0.35;
      const sailAng = luff ? Math.sin(now / 45) * 0.25 : -side * 0.32;
      ctx.save(); ctx.translate(0, -L * 0.2); ctx.rotate(sailAng);
      ctx.strokeStyle = C.sail; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo((luff ? 0 : side) * L * 0.18, L * 0.35, 0, L * 0.72); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = C.sailor;
      ctx.beginPath(); ctx.arc(-side * L * 0.2, L * 0.12, L * 0.11, 0, 7); ctx.fill();
      ctx.restore();
    }

    let raf = 0;
    function loop(now) {
      if (!box.isConnected) return stop();
      if (size((now - t0) / 1000)) draw(now, false);
      raf = requestAnimationFrame(loop);
    }
    function stop() { cancelAnimationFrame(raf); clearInterval(tipTimer); clearInterval(slowTimer); }
    const tipTimer = setInterval(() => { if (!box.isConnected) return stop(); showTip(); }, 6500);

    // status moves on as the wait grows (a timer, so it still runs when animation frames are paused)
    const slowTimer = setInterval(() => {
      if (!box.isConnected) return stop();
      const s = (performance.now() - t0) / 1000;
      while (stageIdx + 1 < STAGES.length && s >= STAGES[stageIdx + 1][0]) {
        stageIdx++;
        status.textContent = STAGES[stageIdx][1];
        box.classList.toggle("is-slow", stageIdx === STAGES.length - 1);
      }
    }, 500);

    if (reduce) {
      // one still frame mid-beat
      requestAnimationFrame(now => {
        if (!size(0)) return;
        boat.y = mark.y + span * 0.5; boat.x = mark.x + span * 0.2; boat.h = windAt(0) - Q; boat.dir = -1;
        last = now; draw(now, true);
      });
      stage.disabled = true;
    } else {
      requestAnimationFrame(now => { last = now; loop(now); });
      document.addEventListener("keydown", function onKey(ev) {
        if (!box.isConnected) return document.removeEventListener("keydown", onKey);
        if (ev.code === "Space" && document.activeElement === document.body) { ev.preventDefault(); tack(performance.now(), false); }
      });
    }
  }

  /* ---------- start — a start line, fleet holding below it, committee boat on the right running the sequence ----------
     Sequence (race clock runs 60x): class flag up = 5:00, P up = 4:00, P down = 1:00, class down = GO. Between sequences
     AP flies (postponed), then drops. The fleet sits on starboard, ~10° off the wind with sails flapping, shuffling back
     and forth, and works through three pre-start skills: scoop, reverse and double tack. Three fixed scenes (no random
     choreography) are checked for collisions offline; data-scene="1|2|3" picks one, otherwise it's chosen per loader. */
  const SEQ = { prep: 1, one: 4, go: 5, goLen: 2.4, ap: 5 };           // real seconds
  const CYCLE = SEQ.go + SEQ.goLen + SEQ.ap;
  const START_STAGES = [
    [0, null],
    [4.5, "Waking up the booking system…"],
    [12, "Race officer's checking the line. Nearly there…"],
    [25, "This is taking longer than usual. Check your signal, or refresh the page."],
  ];
  const ease = k => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  const lerp = (a, b, k) => a + (b - a) * k;

  /*SCENES-START (pure: also run by the offline collision check) */
  const DEG = Math.PI / 180, H0 = -10 * DEG;                          // starboard tack, 10° off the wind
  /* Moves, in boat lengths (x right, y down the course), u = 0…1. Net displacements cancel over a boat's list:
     scoop (-0.8, -1) + reverse (0, +1) + double tack (+0.8, 0) = 0, so every 10 s loop ends where it began. */
  const MOVES = {
    scoop: { d: 1.8, f: u => {                                         // bear away, sheet in, accelerate, luff back up
      const h = u < 0.2 ? lerp(H0, -45 * DEG, ease(u / 0.2)) : u < 0.6 ? -45 * DEG : lerp(-45 * DEG, H0, ease((u - 0.6) / 0.25));
      const p = ease(u);
      return { x: -0.8 * p, y: -1 * p, h, sail: u > 0.12 && u < 0.7 ? "sheet" : "luff" };
    } },
    reverse: { d: 1.6, f: u => {                                       // boom pushed out, sliding backwards
      const p = ease(u);
      return { x: 0, y: p, h: H0 + 5 * DEG * Math.sin(Math.PI * u), sail: u > 0.1 && u < 0.85 ? "back" : "luff" };
    } },
    double: { d: 2.2, f: u => {                                        // tack onto port, then straight back to starboard
      const h = u < 0.25 ? lerp(H0, 40 * DEG, ease(u / 0.25)) : u < 0.5 ? 40 * DEG : u < 0.75 ? lerp(40 * DEG, H0, ease((u - 0.5) / 0.25)) : H0;
      return { x: 0.8 * ease(u), y: -0.35 * Math.sin(Math.PI * u), h, sail: Math.abs(h) > 14 * DEG && u > 0.2 && u < 0.55 ? "sheet" : "luff" };
    } },
  };
  /* Each scene: 7 boats, left (pin) to right (committee boat). dep = boat lengths below the line while milling,
     near = where it lines up in the last minute, mv = [start s, move] within the 10 s milling loop (0–4 s before the
     one-minute gun, 5–10 s while AP flies). ocs = the boat that's over at the gun (X flag), or -1. */
  const SCENES = [
    { ocs: 3, boats: [
      { dep: 2.0, near: 0.9, ph: 0.0, mv: [[0.3, "scoop"], [5.3, "reverse"], [7.4, "double"]] },
      { dep: 3.4, near: 1.0, ph: 1.7, mv: [] },
      { dep: 1.8, near: 0.8, ph: 3.1, mv: [[0.6, "double"], [5.6, "scoop"], [7.9, "reverse"]] },
      { dep: 3.3, near: -0.4, ph: 4.4, mv: [[1.2, "reverse"], [5.2, "double"], [7.8, "scoop"]] },
      { dep: 1.7, near: 0.9, ph: 2.2, mv: [] },
      { dep: 3.2, near: 1.1, ph: 5.0, mv: [[0.2, "scoop"], [2.2, "reverse"], [6.0, "double"]] },
      { dep: 2.0, near: 0.8, ph: 0.9, mv: [[5.8, "reverse"], [7.6, "scoop"], [0.8, "double"]] },
    ] },
    { ocs: -1, boats: [
      { dep: 3.2, near: 1.0, ph: 2.6, mv: [[0.5, "reverse"], [5.4, "scoop"], [7.6, "double"]] },
      { dep: 1.8, near: 0.8, ph: 0.4, mv: [[1.4, "double"], [5.8, "reverse"], [7.8, "scoop"]] },
      { dep: 3.4, near: 1.0, ph: 3.8, mv: [] },
      { dep: 1.9, near: 0.9, ph: 1.1, mv: [[0.2, "scoop"], [2.3, "reverse"], [6.6, "double"]] },
      { dep: 3.3, near: 0.8, ph: 4.9, mv: [[5.2, "double"], [7.7, "reverse"], [1.0, "scoop"]] },
      { dep: 1.8, near: 1.0, ph: 2.0, mv: [] },
      { dep: 3.1, near: 0.9, ph: 5.6, mv: [[0.7, "double"], [5.6, "scoop"], [7.8, "reverse"]] },
    ] },
    { ocs: 4, boats: [
      { dep: 1.9, near: 0.8, ph: 1.3, mv: [] },
      { dep: 3.3, near: 1.0, ph: 4.1, mv: [[0.4, "scoop"], [2.4, "reverse"], [5.6, "double"]] },
      { dep: 1.8, near: 0.9, ph: 0.6, mv: [[1.1, "reverse"], [5.3, "double"], [7.8, "scoop"]] },
      { dep: 3.4, near: 1.0, ph: 2.9, mv: [[5.5, "scoop"], [7.6, "reverse"], [0.9, "double"]] },
      { dep: 2.0, near: -0.4, ph: 5.3, mv: [] },
      { dep: 3.2, near: 0.8, ph: 3.5, mv: [[0.3, "double"], [5.4, "reverse"], [7.4, "scoop"]] },
      { dep: 1.9, near: 1.0, ph: 0.2, mv: [[1.3, "scoop"], [5.9, "double"], [8.3, "reverse"]] },
    ] },
  ];
  /* Where boat b is at milling time m (0…10 s, loops): x, y in boat lengths from its lane spot on the line. */
  function pose(b, m) {
    m = ((m % 10) + 10) % 10;
    let x = 0, y = 0, h = H0 + 3 * DEG * Math.sin(m * 1.1 + b.ph), sail = "luff", busy = false;
    const moves = b.mv.slice().sort((p, q) => p[0] - q[0]);
    moves.forEach(([at, type]) => {
      const mv = MOVES[type], end = at + mv.d;
      if (m >= end) { const e = mv.f(1); x += e.x; y += e.y; }
      else if (m >= at) { const e = mv.f((m - at) / mv.d); x += e.x; y += e.y; h = e.h; sail = e.sail; busy = true; }
    });
    if (!busy) y += 0.22 * Math.sin(m * 1.7 + b.ph);                  // shuffling back and forth, sail flapping
    return { x, y: b.dep + y, h, sail };
  }
  /*SCENES-END*/

  /* Flags, drawn once to small canvases, then flown in vertical strips so they ripple. */
  function makeFlag(kind, dpr) {
    const w = kind === "ap" ? 30 : 24, h = 16;
    const c = document.createElement("canvas");
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    const g = c.getContext("2d"); g.scale(dpr, dpr);
    if (kind === "ap") {                                   // answering pennant: tapered, red and white stripes
      g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h * 0.32); g.lineTo(w, h * 0.68); g.lineTo(0, h); g.closePath(); g.clip();
      for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#e0242b"; g.fillRect(i * w / 5, 0, w / 5 + 0.5, h); }
    } else if (kind === "p") {                             // P: blue with a white square
      g.fillStyle = "#1d4ed8"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.fillRect(w / 3, h / 3, w / 3, h / 3);
    } else if (kind === "x") {                             // X: white with a blue cross
      g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#1d4ed8";
      g.fillRect(w / 2 - 2, 0, 4, h); g.fillRect(0, h / 2 - 2, w, 4);
    } else {                                               // class flag
      g.fillStyle = "#ffc531"; g.fillRect(0, 0, w, h); g.fillStyle = "#03132e";
      g.font = "800 7px Inter, system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText("ILCA", w / 2, h / 2 + 0.5);
    }
    return { c, w, h };
  }

  function startLine(el) {
    const label = el.textContent.trim() || "Loading…";
    const pick = Number(el.dataset.scene) - 1;
    const scene = SCENES[pick >= 0 && pick < SCENES.length ? pick : Math.floor(Math.random() * SCENES.length)];
    const box = document.createElement("div");
    box.className = "bk-loader is-start" + (el.closest(".bk-card") ? " is-compact" : "");
    box.dataset.loader = "1";
    box.innerHTML = `
      <div class="bk-loader-stage" aria-hidden="true"><canvas></canvas></div>
      <p class="bk-loader-status" role="status" aria-live="polite"></p>`;
    el.replaceWith(box);

    const cv = box.querySelector("canvas"), ctx = cv.getContext("2d");
    const status = box.querySelector(".bk-loader-status");
    status.textContent = label;
    const css = getComputedStyle(document.documentElement);
    const col = (n, f) => (css.getPropertyValue(n).trim() || f);
    const C = { sail: col("--blue-300", "#8fb5ff"), sailor: col("--t-champ", "#ffc531"), pin: col("--t-train", "#ff8a3d"),
      line: "rgba(230,237,247,.38)", label: "rgba(230,237,247,.72)" };

    let W = 0, H = 0, dpr = 1, flags = null, fleet = [], lineY = 0, pinX = 0, cbX = 0, L = 14;
    const t0 = performance.now();

    function size() {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return false;
      if (w === W && h === H) return true;
      W = w; H = h; dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      flags = { cls: makeFlag("cls", dpr), p: makeFlag("p", dpr), x: makeFlag("x", dpr), ap: makeFlag("ap", dpr) };
      lineY = Math.round(H * 0.36); pinX = W * 0.08; cbX = W * 0.86;
      L = Math.max(11, Math.min(16, W / 24));
      const n = W < 320 ? 5 : 7, span = cbX - pinX - 44;
      // depth is capped so the deepest boats still fit on short stages
      const maxDep = (H - lineY - L) / L;
      fleet = scene.boats.slice(0, n).map((b, i) => ({ ...b, dep: Math.min(b.dep, maxDep), lx: pinX + 18 + span * (i + 0.5) / n }));
      return true;
    }

    function drawBoat(x, y, h, sail, now, alpha, warn) {
      const l = L;
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(h);
      if (warn) {                                          // the boat that's over early blinks
        ctx.strokeStyle = `rgba(224,36,43,${(0.55 + 0.45 * Math.sin(now / 90)).toFixed(3)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, l * 0.85, 0, 7); ctx.stroke();
      }
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(0, -l * 0.62);
      ctx.bezierCurveTo(l * 0.26, -l * 0.25, l * 0.24, l * 0.3, l * 0.17, l * 0.4);
      ctx.lineTo(-l * 0.17, l * 0.4);
      ctx.bezierCurveTo(-l * 0.24, l * 0.3, -l * 0.26, -l * 0.25, 0, -l * 0.62);
      ctx.fill();
      // wind is straight down the screen: heading < 0 is starboard tack, so the sail sits to port (left)
      const side = h >= 0 ? 1 : -1, flap = Math.sin(now / 45 + x * 0.7);
      const ang = sail === "sheet" ? -side * 0.34 : sail === "back" ? -side * 1.2 + flap * 0.05 : -side * 0.16 + flap * 0.22;
      ctx.save(); ctx.translate(0, -l * 0.2); ctx.rotate(ang);
      ctx.strokeStyle = C.sail; ctx.lineWidth = 2.3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(sail === "luff" ? flap * l * 0.08 : side * l * 0.16, l * 0.35, 0, l * 0.72); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = C.sailor; ctx.beginPath(); ctx.arc(-side * l * 0.2, l * 0.12, l * 0.11, 0, 7); ctx.fill();
      ctx.restore();
    }

    // a flag on the committee boat's pole: p = 0 (lowered) … 1 (close up), slot 0 = top
    function drawFlag(f, p, slot, now, poleX, poleTop, poleBot) {
      if (p <= 0) return;
      const y = poleBot - 16 + (poleTop + slot * 20 - (poleBot - 16)) * p;
      const strip = 2;
      ctx.save(); ctx.globalAlpha = Math.min(1, p * 3);
      for (let i = 0; i < f.w; i += strip) {
        const off = Math.sin(i * 0.28 - now / 110) * (i / f.w) * 2.2;
        ctx.drawImage(f.c, i * dpr, 0, strip * dpr, f.h * dpr, poleX - f.w + i - 1, y + off, strip + 0.4, f.h);
      }
      ctx.restore();
    }

    function draw(now, still) {
      const t = still ? SEQ.prep + 1 : (now - t0) / 1000;
      const c = t % CYCLE, ocs = scene.ocs < fleet.length ? scene.ocs : -1;
      const inSeq = c < SEQ.go + SEQ.goLen, g = c - SEQ.go, a = c - SEQ.go - SEQ.goLen;
      const up = (on, off, at) => ease((at - on) / 0.35) * (1 - ease((at - off) / 0.35));

      ctx.clearRect(0, 0, W, H);
      // light ripples drifting down the course with the wind
      ctx.strokeStyle = "rgba(230,237,247,.12)"; ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const x = (i * 97.3) % W, y = ((i * 53.1 + (still ? 0 : t * 14)) % (H + 20)) - 10;
        ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.quadraticCurveTo(x, y - 2, x + 5, y); ctx.stroke();
      }

      // the line: pin end (left) to the committee boat's flagpole (right)
      ctx.setLineDash([3, 5]); ctx.strokeStyle = C.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pinX, lineY); ctx.lineTo(cbX, lineY); ctx.stroke(); ctx.setLineDash([]);
      const bob = still ? 0 : Math.sin(t * 2.6) * 1.2;
      ctx.fillStyle = "rgba(255,138,61,.2)"; ctx.beginPath(); ctx.arc(pinX, lineY + bob, 9, 0, 7); ctx.fill();
      ctx.fillStyle = C.pin; ctx.beginPath(); ctx.arc(pinX, lineY + bob, 5, 0, 7); ctx.fill();

      // committee boat, head to wind on its anchor, with a cabin
      const cbL = Math.max(30, Math.min(44, W / 9)), cbY = lineY + cbL * 0.12 + bob * 0.5;
      ctx.save(); ctx.translate(cbX, cbY);
      ctx.fillStyle = "#dfe7f3";
      ctx.beginPath();
      ctx.moveTo(0, -cbL * 0.55);
      ctx.bezierCurveTo(cbL * 0.3, -cbL * 0.25, cbL * 0.27, cbL * 0.32, cbL * 0.22, cbL * 0.45);
      ctx.lineTo(-cbL * 0.22, cbL * 0.45);
      ctx.bezierCurveTo(-cbL * 0.27, cbL * 0.32, -cbL * 0.3, -cbL * 0.25, 0, -cbL * 0.55);
      ctx.fill();
      ctx.fillStyle = "#8aa3c7"; ctx.fillRect(-cbL * 0.13, -cbL * 0.1, cbL * 0.26, cbL * 0.3);
      ctx.restore();
      const poleX = cbX, poleTop = 8, poleBot = cbY - cbL * 0.3;
      ctx.strokeStyle = "rgba(230,237,247,.85)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(poleX, poleBot); ctx.lineTo(poleX, poleTop - 2); ctx.stroke();

      // flags, and the race clock top left
      let clock;
      if (inSeq) {
        drawFlag(flags.cls, up(0, SEQ.go, c), 0, now, poleX, poleTop, poleBot);
        drawFlag(flags.p, up(SEQ.prep, SEQ.one, c), 1, now, poleX, poleTop, poleBot);
        if (ocs >= 0) drawFlag(flags.x, up(SEQ.go + 0.15, SEQ.go + 2, c), 1, now, poleX, poleTop, poleBot);
        const left = Math.max(0, Math.ceil(300 - c * 60));
        clock = left > 0 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : "GO";
      } else {
        drawFlag(flags.ap, up(0.2, SEQ.ap - 0.8, a), 0, now, poleX, poleTop, poleBot);
        clock = "AP";
      }
      ctx.fillStyle = C.label; ctx.font = "700 11px Inter, system-ui, 'Segoe UI', sans-serif"; ctx.textBaseline = "middle";
      ctx.fillText(clock, 10, 14);

      // the fleet: milling time runs 0–5 s before the gun and 5–10 s while AP flies
      const m = inSeq ? Math.min(c, SEQ.go) : SEQ.go + a;
      fleet.forEach((b, i) => {
        const isOcs = i === ocs;
        let x, y, h, sail, alpha = 1;
        if (inSeq && c >= SEQ.go) {
          // GO: sheet in and sail off upwind on starboard tack
          const goT = isOcs ? g - 1.4 : g, y0 = lineY + b.near * L;
          x = b.lx; sail = "sheet";
          if (isOcs && g < 1.4) {                             // over early: dip back round the line, then go
            const q = Math.sin(Math.PI * g / 1.4);
            h = H0 + (Math.PI - H0) * q; y = y0 + 1.6 * L * q;
          } else {
            const hk = ease(goT / 0.4), d = 34 * goT + 26 * goT * goT;
            h = lerp(H0, -0.6, hk);
            x += Math.sin(h) * d; y = y0 - Math.cos(h) * d;
            alpha = 1 - ease((goT - 1.4) / 0.6);
          }
        } else {
          // milling: the scene's moves; in the last minute everyone closes up to their spot on the line
          const p = pose(b, m), close = inSeq ? ease(c - SEQ.one) : 0;
          x = b.lx + p.x * L * (1 - close); y = lineY + lerp(p.y, b.near, close) * L; h = p.h; sail = p.sail;
          if (!inSeq) alpha = ease(a / 0.6);                // the fleet comes back for the next sequence
        }
        if (alpha > 0.01) drawBoat(x, y, h, sail, now, alpha, isOcs && inSeq && c >= SEQ.go && g < 2);
      });
    }

    let raf = 0;
    const stop = () => { cancelAnimationFrame(raf); clearInterval(slowTimer); };
    let stageIdx = 0;
    const slowTimer = setInterval(() => {
      if (!box.isConnected) return stop();
      const s = (performance.now() - t0) / 1000;
      while (stageIdx + 1 < START_STAGES.length && s >= START_STAGES[stageIdx + 1][0]) {
        stageIdx++; status.textContent = START_STAGES[stageIdx][1];
        box.classList.toggle("is-slow", stageIdx === START_STAGES.length - 1);
      }
    }, 500);
    if (reduce) requestAnimationFrame(now => { if (size()) draw(now, true); });
    else {
      const loop = now => { if (!box.isConnected) return stop(); if (size()) draw(now, false); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
  }

  const scan = root => (root.querySelectorAll ? root.querySelectorAll(".bk-loading") : []).forEach(upgrade);
  const start = () => {
    scan(document);
    new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      if (n.classList.contains("bk-loading")) upgrade(n); else scan(n);
    }))).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  window.BTSLoader = { upgrade };
})();
