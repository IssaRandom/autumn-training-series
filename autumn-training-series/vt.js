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
    /* guide pages: the phone contents capsule + sheet are glass too (advice.css, 18 Nov) */
    const toc = document.querySelector("[data-toc]");
    const tocBtn = toc && toc.querySelector("[data-toc-toggle]"), tocSheet = toc && toc.querySelector(".toc-panel");
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!still) {
      let ticking = false;
      const light = () => { ticking = false; const a = (135 + 38 * Math.sin(scrollY / 240)).toFixed(1) + "deg"; nav.style.setProperty("--lg-a", a); if (toc) toc.style.setProperty("--lg-a", a); };
      addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(light); } }, { passive: true });
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
        `<feDisplacementMap in="SourceGraphic" in2="map" scale="${strength}" xChannelSelector="R" yChannelSelector="B"/>`;
    };
    const draw = () => {
      if (btn) lens("lg-lens-btn", btn, 10, -26);
      if (sheet) lens("lg-lens-sheet", sheet, 18, -44);
      if (tocBtn) lens("lg-lens-toc", tocBtn, 10, -26);
      if (tocSheet) lens("lg-lens-tocsheet", tocSheet, 18, -44);
    };
    draw();
    const ro = new ResizeObserver(draw);
    if (btn) ro.observe(btn);
    if (sheet) ro.observe(sheet);
    if (tocBtn) ro.observe(tocBtn);
    if (tocSheet) ro.observe(tocSheet);
    new MutationObserver(() => requestAnimationFrame(draw)).observe(nav, { attributes: true, attributeFilter: ["class"] });
    if (toc) new MutationObserver(() => requestAnimationFrame(draw)).observe(toc, { attributes: true, attributeFilter: ["class"] });
    document.documentElement.classList.add("lg-refract");
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start); else start();
})();
