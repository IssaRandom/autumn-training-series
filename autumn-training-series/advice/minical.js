/* Mini season calendar: 12 month strips drawn from data/events.js (same source as /calendar).
   Shared by New to ILCAs (Racing) and the venue guides (events here). Needs window.BTS_EVENTS.
   Markup: <a class="minical" href="…/calendar/" data-minical> … <span data-minical-grid></span> … </a>
   Optional filters on the link:
     data-minical-types="national-open bts-camp"   which event types to draw (default: NOs, champs, ILCA UK training, BTS)
     data-minical-match="WPNSA|Weymouth|Portland"  regex on the event's venue (venue guides)
   The calendar is prerendered (Speculation Rules) as the section comes within ~2 screens, so the tap feels instant
   (James 14 Nov: "almost preloaded"). Other browsers get a prefetch of the page and its data/scripts. */
(() => {
  "use strict";
  const mini = document.querySelector("[data-minical]");
  const grid = mini && mini.querySelector("[data-minical-grid]");
  if (!mini) return;

  if (grid && Array.isArray(window.BTS_EVENTS)) {
    const TYPES = (mini.dataset.minicalTypes || "national-open championship ilca-uk-training bts-camp").split(" ");
    const match = mini.dataset.minicalMatch ? new RegExp(mini.dataset.minicalMatch, "i") : null;
    const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = s => { const [y, m, dd] = s.split("-").map(Number); return new Date(y, m - 1, dd); };
    const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const evs = window.BTS_EVENTS.filter(e => TYPES.includes(e.type) && !e.optional && !e.placeholder && (!match || match.test(e.venue || "")));
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
      grid.append(row);
    }
  }

  let warmed = false;
  const warm = () => {
    if (warmed) return; warmed = true;
    const url = new URL(mini.getAttribute("href"), location.href).href;
    if (HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
      const s = document.createElement("script");
      s.type = "speculationrules";
      s.textContent = JSON.stringify({ prerender: [{ source: "list", urls: [url], eagerness: "immediate" }] });
      document.head.append(s);
    } else {
      [url, new URL("../data/events.js", url).href, new URL("calendar.js", url).href, new URL("calendar.css", url).href]
        .forEach(h => { const l = document.createElement("link"); l.rel = "prefetch"; l.href = h; document.head.append(l); });
    }
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { warm(); io.disconnect(); } }, { rootMargin: "200% 0px" });
    io.observe(mini.closest("section") || mini);
  } else warm();
  mini.addEventListener("pointerdown", warm, { once: true });
  mini.addEventListener("focus", warm, { once: true });
})();
