/* Beyond the Shift /beta — splash on high-impact buttons (POLISH-AUDIT #46).
   Opt in with data-splash, or match one of the booking selectors below (works for buttons drawn later by JS).
   Fires on press, never delays navigation, no sound. Reduced motion: a quick ring only. */
(() => {
  const SEL = '[data-splash], [data-confirm], a[href*="book/?camp="], a.nav-cta[href$="calendar/"]';
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const EASE_UP = "cubic-bezier(.2, .8, .3, 1)";

  function splash(btn, x, y) {
    const r = btn.getBoundingClientRect();
    if (x == null) { x = r.left + r.width / 2; y = r.top + r.height / 2; }
    btn.classList.add("fx-splashy");

    // ripple ring inside the button, from the tap point
    const ring = document.createElement("span");
    ring.className = "fx-ring"; ring.setAttribute("aria-hidden", "true");
    ring.style.setProperty("--x", `${x - r.left}px`);
    ring.style.setProperty("--y", `${y - r.top}px`);
    ring.style.setProperty("--s", Math.ceil(Math.hypot(r.width, r.height) / 7));
    btn.appendChild(ring);
    ring.addEventListener("animationend", () => ring.remove(), { once: true });
    if (reduce.matches) return;

    // spray: droplets thrown up and out like a bow wave hitting a chop, then falling back
    const n = 13 + Math.round(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      const d = document.createElement("span");
      d.className = "fx-drop"; d.setAttribute("aria-hidden", "true");
      const size = 6 + Math.random() * 6;
      d.style.setProperty("--d", `${size}px`);
      document.body.appendChild(d);
      const ang = (-90 + (Math.random() * 2 - 1) * 78) * Math.PI / 180;   // mostly upward fan
      const v = 48 + Math.random() * 56;
      const dx = Math.cos(ang) * v, dy = Math.sin(ang) * v;
      const fall = 26 + Math.random() * 30;
      const x0 = x - size / 2, y0 = y - size / 2;
      const dur = 460 + Math.random() * 180;
      d.animate([
        { transform: `translate(${x0}px, ${y0}px) scale(.4)`, opacity: 0 },
        { transform: `translate(${x0 + dx * .55}px, ${y0 + dy * .7}px) scale(1)`, opacity: 1, offset: .3, easing: "ease-out" },
        { transform: `translate(${x0 + dx}px, ${y0 + dy}px) scale(.9)`, opacity: .9, offset: .55, easing: "ease-in" },
        { transform: `translate(${x0 + dx * 1.2}px, ${y0 + dy + fall}px) scale(.35)`, opacity: 0 }
      ], { duration: dur, easing: EASE_UP, fill: "forwards" }).finished.then(() => d.remove(), () => d.remove());
    }
  }

  // pointerdown so the spray starts the instant you press (before a link navigates)
  document.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    const btn = e.target.closest(SEL);
    if (btn && !btn.disabled) splash(btn, e.clientX, e.clientY);
  }, { passive: true });
  // keyboard presses (Enter / Space) come through as clicks with detail 0
  document.addEventListener("click", e => {
    if (e.detail !== 0) return;
    const btn = e.target.closest(SEL);
    if (btn && !btn.disabled) splash(btn);
  });

  window.BTSfx = Object.assign(window.BTSfx || {}, { splash });

  /* #9 picture skeletons: fx.css runs a wind-streak shimmer behind an image until it's here (or failed). */
  document.querySelectorAll("img").forEach(img => {
    const done = () => img.classList.add("is-loaded");
    if (img.complete) done();
    else { img.addEventListener("load", done, { once: true }); img.addEventListener("error", done, { once: true }); }
  });
})();
