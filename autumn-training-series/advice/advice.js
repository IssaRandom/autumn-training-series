/* Advice guide template: nav, contents (built from h2s), scroll-spy, reading progress, reveals. No dependencies. */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Nav (same behaviour as homepage, always solid here) */
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  /* Contents list */
  const secs = [...document.querySelectorAll(".g-sec[id]")];
  const list = document.querySelector("[data-toc-list]");
  const toc = document.querySelector("[data-toc]");
  const tocBtn = document.querySelector("[data-toc-toggle]");
  const current = document.querySelector("[data-toc-current]");
  // Sections with data-part="Sailing" / "Parents" get a group label in the contents (venue guides)
  let part = null;
  list.innerHTML = secs.map(s => {
    const p = s.dataset.part, head = p && p !== part ? `<li class="toc-part" aria-hidden="true">${p}</li>` : "";
    part = p || part;
    return `${head}<li><a href="#${s.id}">${s.querySelector("h2").textContent}</a></li>`;
  }).join("");
  const links = [...list.querySelectorAll("a")];
  const setOpen = open => { toc.classList.toggle("is-open", open); tocBtn.setAttribute("aria-expanded", open); };
  tocBtn.addEventListener("click", () => setOpen(!toc.classList.contains("is-open")));
  links.forEach(a => a.addEventListener("click", () => setOpen(false)));

  /* Reading time (approx 220 wpm) */
  const words = document.querySelector("[data-guide]").textContent.trim().split(/\s+/).length;
  const rt = document.querySelector("[data-readtime]");
  if (rt) rt.textContent = `${Math.max(1, Math.round(words / 220))} min`;

  /* Scroll-spy + progress, one rAF-throttled scroll handler */
  const bar = document.querySelector("[data-progress]");
  const body = document.querySelector("[data-guide]");
  let active = -1;
  const update = () => {

    const line = window.innerHeight * 0.3;
    let idx = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) idx = i; });
    if (idx !== active) {
      active = idx;
      links.forEach((a, i) => a.classList.toggle("is-active", i === idx));
      current.textContent = links[idx].textContent;
    }
    const r = body.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
    bar.style.transform = `scaleX(${p})`;
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  if (reduce || document.hidden) return;

  /* Title word reveal */
  const title = document.querySelector("[data-split]");
  if (title) {
    title.innerHTML = title.textContent.split(" ").map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(" ");
    title.classList.add("is-split");
  }

  /* Section reveals (only those below the fold) */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  secs.forEach(s => { if (s.getBoundingClientRect().top > window.innerHeight) { s.classList.add("pre"); io.observe(s); } });
})();
