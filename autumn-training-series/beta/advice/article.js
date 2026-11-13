/* Article-design patterns for long advice guides. Pairs with article.css. No dependencies.
   - one-off reveals for bands (18), charts (13), figure cards (03) and the finish line (12)
   - diagram that builds (16): the item nearest the reading line lights up its part
   - phone contents pill: "n of N" count, and steps aside while the diagram is pinned */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reveals: CSS only hides things under no-preference, and only once .js-art is set */
  if ("IntersectionObserver" in window && !reduce) {
    document.documentElement.classList.add("js-art");
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll(".band, .chart, .fig, .finish").forEach(el => io.observe(el));
  }

  /* Diagram that builds */
  const diag = document.querySelector("[data-diag]");
  const items = diag ? [...diag.querySelectorAll("[data-diag-item]")] : [];
  const stage = diag && diag.querySelector(".diag-stage");
  const cap = diag && diag.querySelector("[data-diag-cap]");
  const dots = diag ? [...diag.querySelectorAll(".dots i")] : [];
  const names = items.map(li => (li.querySelector("strong") || li).textContent.replace(/\s*→\s*$/, "").trim());
  let step = 0;
  const setStep = n => {
    if (n === step) return;
    step = n;
    if (n) diag.dataset.step = n; else delete diag.dataset.step;
    items.forEach((li, i) => li.classList.toggle("is-on", i + 1 === n));
    dots.forEach((d, i) => d.classList.toggle("on", i < n));
    writeCap(n);
  };
  function writeCap(n) {   /* text nodes only: no HTML built from page text */
    if (!cap) return;
    const num = document.createElement("span");
    num.className = "n";
    num.textContent = n ? `${n} / ${items.length}` : `${items.length} parts`;
    cap.replaceChildren(num, document.createTextNode(n ? names[n - 1] : "Scroll to step through"));
  }

  /* Phone pill count */
  const pill = document.querySelector("[data-toc-toggle]");
  const links = [...document.querySelectorAll("[data-toc-list] a")];
  let count = null;
  if (pill && links.length) {
    count = document.createElement("span");
    count.className = "toc-count";
    count.setAttribute("aria-hidden", "true");
    pill.querySelector(".toc-chev").before(count);
  }

  const phone = window.matchMedia("(max-width: 900px)");
  const update = () => {
    if (count) {
      const i = links.findIndex(a => a.classList.contains("is-active"));
      count.textContent = `${Math.max(1, i + 1)} of ${links.length}`;
    }
    if (!diag) return;
    const sr = stage.getBoundingClientRect(), dr = diag.getBoundingClientRect();
    const line = sr.bottom + (window.innerHeight - sr.bottom) * 0.35;
    let n = 0;
    items.forEach((li, i) => { if (li.getBoundingClientRect().top <= line) n = i + 1; });
    if (dr.bottom < sr.bottom + 40) n = items.length;
    setStep(n);
    const stuckAt = parseFloat(getComputedStyle(stage).top) || 0;   // stage is pinned once its section has scrolled past that line
    const pinned = phone.matches && dr.top < stuckAt - 1 && dr.bottom > sr.bottom + 60;
    document.body.classList.toggle("diag-pinned", pinned);
  };
  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  writeCap(0);
  update();
})();
