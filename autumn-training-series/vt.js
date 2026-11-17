/* Beyond the Shift /beta — page transitions (POLISH-AUDIT #15).
   The transition itself is pure CSS (fx.css: @view-transition + the "wake" wipe). This tiny script only:
   - sends the wake the other way when you go Back (html.vt-back),
   - adds the foam band that rides the edge of the wipe (.vt-wake, named "wake"),
   - skips the transition on reload.
   It sits in <head> (not deferred) because pagereveal fires before the first frame of the new page.
   Browsers without cross-document view transitions (Firefox today) never fire it with a transition: nothing happens. */
(() => {
  addEventListener("pageswap", e => { if (e.viewTransition) document.documentElement.classList.add("vt-on"); });
  addEventListener("pageshow", e => { if (e.persisted) document.documentElement.classList.remove("vt-on"); });
  addEventListener("pagereveal", e => {
    const vt = e.viewTransition;
    if (!vt) return;
    const act = window.navigation && navigation.activation;
    if (act && act.navigationType === "reload") { vt.skipTransition(); return; }
    const root = document.documentElement;
    root.classList.add("vt-on");   // nav gets its view-transition-name only now (fx.css)
    const back = act && act.navigationType === "traverse" && act.from && act.entry && act.from.index > act.entry.index;
    if (back) root.classList.add("vt-back");

    let wake = null;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wake = document.createElement("div");
      wake.className = "vt-wake";
      wake.setAttribute("aria-hidden", "true");
      root.appendChild(wake);   // on <html>, so it exists before <body> has finished parsing
    }
    const done = () => { root.classList.remove("vt-back", "vt-on"); if (wake) wake.remove(); };
    vt.finished.then(done, done);
  });
})();
/* Review mode: ?review=1 shows James's internal markers (.todo, .draft, .verify, .gfx-slot); ?review=0 hides them again. */
(() => {
  try {
    const q = new URLSearchParams(location.search).get("review");
    if (q === "1") localStorage.setItem("bts-review", "1");
    if (q === "0") localStorage.removeItem("bts-review");
    if (localStorage.getItem("bts-review") === "1") document.documentElement.classList.add("review");
  } catch (e) {}
})();

/* Menu button extras, shared by every page (each page's own script still does the open/close):
   Escape or a tap outside closes the menu and hands focus back; Android gets a tiny tick (POLISH #24). */
(() => {
  const btn = () => document.querySelector("[data-nav-toggle]");
  const isOpen = () => { const n = document.querySelector("[data-nav]"); return n && n.classList.contains("is-open"); };
  addEventListener("click", e => {
    const b = btn();
    if (!b) return;
    if (b.contains(e.target)) { if (navigator.vibrate) try { navigator.vibrate(8); } catch (_) {} return; }
    if (isOpen() && !e.target.closest("[data-nav]")) b.click();
  }, true);
  addEventListener("keydown", e => {
    if (e.key === "Escape" && isOpen()) { const b = btn(); b.click(); b.focus(); }
  });
})();

/* Liquid glass menu (beta.css "Liquid glass"): the rim light turns as you scroll, and in Chromium each glass surface
   bends what is behind it at the edges like a lens. The lens is an SVG displacement filter whose map is drawn to the
   element's own size and corner radius: red/blue ramps (x/y offset) everywhere, flattened to neutral grey in the middle,
   so only a soft bezel near the edge refracts. Safari/Firefox can't use SVG filters in backdrop-filter: frosted glass only. */
(() => {
  const start = () => {
    const nav = document.querySelector("[data-nav]");
    if (!nav) return;
    const btn = nav.querySelector("[data-nav-toggle]"), sheet = nav.querySelector(".nav-links");
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!still) {
      let ticking = false;
      const light = () => { ticking = false; nav.style.setProperty("--lg-a", (135 + 38 * Math.sin(scrollY / 240)).toFixed(1) + "deg"); };
      addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(light); } }, { passive: true });
    }
    const phone = matchMedia("(max-width: 820px)");
    /* light under the finger (beta.css ::after) */
    const lightAt = (el, e) => { const r = el.getBoundingClientRect();
      el.style.setProperty("--lg-x", (e.clientX - r.left).toFixed(0) + "px"); el.style.setProperty("--lg-y", (e.clientY - r.top).toFixed(0) + "px"); };
    [btn, sheet].forEach(el => {
      if (!el) return;
      el.addEventListener("pointerdown", e => { lightAt(el, e); el.classList.add("lg-lit"); });
      el.addEventListener("pointermove", e => { if (el.classList.contains("lg-lit")) lightAt(el, e); });
      ["pointerup", "pointercancel", "pointerleave"].forEach(t => el.addEventListener(t, () => el.classList.remove("lg-lit")));
    });
    /* the liquid lens in the menu */
    if (sheet) {
      const pill = document.createElement("span");
      pill.className = "lg-pill"; pill.setAttribute("aria-hidden", "true"); pill.innerHTML = "<i></i>";
      sheet.prepend(pill);
      const items = () => [...sheet.querySelectorAll(":scope > li")];
      const home = () => { const a = sheet.querySelector("a[aria-current]"); return a && a.closest("li"); };
      let on = null, drag = null, swallow = false;
      sheet.addEventListener("click", e => { if (swallow) { swallow = false; e.preventDefault(); e.stopPropagation(); } }, true); // the native click after a drag-release
      const place = (li, glide) => {
        if (on && on !== li) on.classList.remove("lg-on");
        if (!li) { pill.classList.remove("is-on"); on = null; return; }
        const row = document.body.classList.contains("nav-up") && !nav.classList.contains("is-open");
        const x = row ? li.offsetLeft : li.offsetLeft - 10, y = row ? 5 : li.offsetTop + 3;
        const w = row ? li.offsetWidth : li.offsetWidth + 20, h = row ? 36 : li.offsetHeight - 6;
        if (!glide) pill.style.transition = "none";
        pill.style.width = w + "px"; pill.style.height = h + "px"; pill.style.transform = `translate(${x}px, ${y}px)`;
        if (!glide) { pill.offsetWidth; pill.style.transition = ""; }
        else if (on !== li && !still && pill.firstChild.animate) // stretch like a drop on the move
          pill.firstChild.animate([{ transform: "scale(1)" }, { transform: row ? "scale(1.12, .9)" : "scale(1.04, .8)", offset: .3 }, { transform: "scale(1)" }],
            { duration: 520, easing: "cubic-bezier(.3, 1.3, .5, 1)" });
        pill.classList.add("is-on");
        if (glide || nav.classList.contains("is-open")) li.classList.add("lg-on");
        on = li;
      };
      const rest = glide => { const h = home(); if (h) place(h, glide); else place(null); if (h && !nav.classList.contains("is-open")) h.classList.remove("lg-on"); };
      const under = e => { const t = document.elementFromPoint(e.clientX, e.clientY); return t && t.closest && t.closest(".nav-links > li"); };
      sheet.addEventListener("pointerdown", e => { if (!phone.matches) return; drag = { x: e.clientX, y: e.clientY, moved: false }; const li = under(e); if (li) place(li, true); });
      sheet.addEventListener("pointermove", e => {
        if (!drag || !nav.classList.contains("is-open")) return;
        if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) drag.moved = true;
        const li = under(e); if (li && li !== on) place(li, true);
      });
      sheet.addEventListener("pointerup", e => {
        const d = drag; drag = null;
        if (d && d.moved && nav.classList.contains("is-open")) { const li = under(e), a = li && li.querySelector("a"); if (a) { a.click(); swallow = true; setTimeout(() => { swallow = false; }, 450); return; } }
      });
      sheet.addEventListener("pointercancel", () => { drag = null; rest(true); });
      sheet.addEventListener("pointerleave", () => { if (!drag) rest(true); });
      // on open: lens sits on the current page; on close/resize/row mode: re-place without gliding
      new MutationObserver(() => requestAnimationFrame(() => rest(false))).observe(nav, { attributes: true, attributeFilter: ["class"] });
      new MutationObserver(() => requestAnimationFrame(() => rest(false))).observe(document.body, { attributes: true, attributeFilter: ["class"] });
      addEventListener("resize", () => rest(false));
      rest(false);
    }
    const chromium = navigator.userAgentData && navigator.userAgentData.brands.some(b => /Chromium/.test(b.brand));
    if (!chromium || matchMedia("(prefers-reduced-transparency: reduce)").matches || !window.ResizeObserver) return;
    const NS = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(NS, "svg");
    defs.setAttribute("aria-hidden", "true");
    defs.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    document.body.appendChild(defs);
    const lens = (id, el, bezel, strength) => {
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (!w || !h) return;
      const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, h / 2, w / 2);
      const b = Math.min(bezel, h / 2 - 1, w / 2 - 1);
      const map = `<svg xmlns="${NS}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>` +
        `<linearGradient id="x"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient>` +
        `<linearGradient id="y" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#00f"/></linearGradient>` +
        `<filter id="s"><feGaussianBlur stdDeviation="${(b / 2.4).toFixed(1)}"/></filter></defs>` +
        `<rect width="${w}" height="${h}" fill="#000"/><rect width="${w}" height="${h}" rx="${r}" fill="url(#x)"/>` +
        `<rect width="${w}" height="${h}" rx="${r}" fill="url(#y)" style="mix-blend-mode:screen"/>` +
        `<rect x="${b}" y="${b}" width="${w - 2 * b}" height="${h - 2 * b}" rx="${Math.max(r - b, 0)}" fill="#808080" filter="url(#s)"/></svg>`;
      let f = defs.querySelector("#" + id);
      if (!f) { f = document.createElementNS(NS, "filter"); f.id = id; defs.appendChild(f); }
      ["x", "y"].forEach(k => f.setAttribute(k, 0));
      f.setAttribute("width", w); f.setAttribute("height", h);
      f.setAttribute("filterUnits", "userSpaceOnUse"); f.setAttribute("primitiveUnits", "userSpaceOnUse");
      f.setAttribute("color-interpolation-filters", "sRGB");
      f.innerHTML = `<feImage href="data:image/svg+xml,${encodeURIComponent(map)}" x="0" y="0" width="${w}" height="${h}" result="map" preserveAspectRatio="none"/>` +
        // rainbow edge: red, green and blue bend by slightly different amounts, like real glass
        [["r", 1, "1 0 0 0 0"], ["g", .9, "0 1 0 0 0"], ["b", .8, "0 0 1 0 0"]].map(([c, k, row]) =>
          `<feDisplacementMap in="SourceGraphic" in2="map" scale="${(strength * k).toFixed(1)}" xChannelSelector="R" yChannelSelector="B" result="d${c}"/>` +
          `<feColorMatrix in="d${c}" type="matrix" values="${c === "r" ? row : "0 0 0 0 0"} ${c === "g" ? row : "0 0 0 0 0"} ${c === "b" ? row : "0 0 0 0 0"} 0 0 0 1 0" result="c${c}"/>`).join("") +
        `<feComposite in="cr" in2="cg" operator="arithmetic" k2="1" k3="1" result="rg"/>` +
        `<feComposite in="rg" in2="cb" operator="arithmetic" k2="1" k3="1"/>`;
    };
    const draw = () => {
      if (btn) lens("lg-lens-btn", btn, 10, -26);
      if (sheet) lens("lg-lens-sheet", sheet, 18, -44);
    };
    draw();
    const ro = new ResizeObserver(draw);
    if (btn) ro.observe(btn);
    if (sheet) ro.observe(sheet);
    new MutationObserver(() => requestAnimationFrame(draw)).observe(nav, { attributes: true, attributeFilter: ["class"] });
    document.documentElement.classList.add("lg-refract");
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start); else start();
})();
