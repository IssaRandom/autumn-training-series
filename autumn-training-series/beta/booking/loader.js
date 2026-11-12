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
     Where each is used: race on /book "Loading camp…" and /account "Loading your bookings…"; wave for
     /account "Loading…" (gone as soon as the script runs), "Loading camps…" and /book "Loading your account…".
     No data-loader means race. ("Who's going" has its own veiled-names placeholder in ui.js.) */
  function upgrade(el) {
    if (el.dataset.loader === "1" || el.dataset.upgraded) return;
    const style = el.dataset.loader || "race";
    if (style === "wave") return wave(el);
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
