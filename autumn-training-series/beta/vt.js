/* Beyond the Shift /beta — page transitions (POLISH-AUDIT #15).
   The transition itself is pure CSS (fx.css: @view-transition + the "wake" wipe). This tiny script only:
   - sends the wake the other way when you go Back (html.vt-back),
   - adds the foam band that rides the edge of the wipe (.vt-wake, named "wake"),
   - skips the transition on reload.
   It sits in <head> (not deferred) because pagereveal fires before the first frame of the new page.
   Browsers without cross-document view transitions (Firefox today) never fire it with a transition: nothing happens. */
(() => {
  addEventListener("pagereveal", e => {
    const vt = e.viewTransition;
    if (!vt) return;
    /* a page that already did its own exit (the guide's mini calendar zooming up to fill the screen) asks to skip the wipe */
    try { if (sessionStorage.getItem("bts-vt-skip")) { sessionStorage.removeItem("bts-vt-skip"); vt.skipTransition(); return; } } catch (_) {}
    const act = window.navigation && navigation.activation;
    if (act && act.navigationType === "reload") { vt.skipTransition(); return; }
    const root = document.documentElement;
    const back = act && act.navigationType === "traverse" && act.from && act.entry && act.from.index > act.entry.index;
    if (back) root.classList.add("vt-back");

    let wake = null;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wake = document.createElement("div");
      wake.className = "vt-wake";
      wake.setAttribute("aria-hidden", "true");
      root.appendChild(wake);   // on <html>, so it exists before <body> has finished parsing
    }
    const done = () => { root.classList.remove("vt-back"); if (wake) wake.remove(); };
    vt.finished.then(done, done);
  });
})();
