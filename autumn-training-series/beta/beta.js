/* Beyond the Shift /beta — homepage behaviour. */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 820px)").matches;
  const C = window.BTSCal;
  const events = (window.BTS_EVENTS || []).filter(e => !e.optional);

  /* ---------- Nav ---------- */
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const setSolid = () => nav.classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.6);
  setSolid();
  window.addEventListener("scroll", setSolid, { passive: true });
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }));
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Next 3 trainings ---------- */
  const list = document.querySelector("[data-next-trainings]");
  if (list && C) {
    const next = events.filter(e => e.type === "bts-camp" && C.parse(e.end) >= C.today).sort((a, b) => C.parse(a.start) - C.parse(b.start)).slice(0, 3);
    list.innerHTML = next.length ? next.map(e => `
      <li class="reveal"><a class="training" href="/">
        <span class="training-date">${C.esc(C.range(e).replace(/ \d{4}/g, ""))}</span>
        <span><span class="training-name">${C.esc(e.name)}</span><br><span class="training-venue">${C.esc(e.venue)} · ${C.esc(C.rigText(e))}</span></span>
        <span class="arrow" aria-hidden="true"></span>
      </a></li>`).join("") : `<li class="training">New dates coming soon.</li>`;
  }

  /* ---------- Calendar teaser: 8-week strip from this Monday ---------- */
  const strip = document.querySelector("[data-teaser-scroll]");
  if (strip && C) {
    const start = C.addDays(C.today, -C.wd(C.today));
    const n = 56, end = C.addDays(start, n - 1);
    const inRange = events.filter(e => C.parse(e.end) >= start && C.parse(e.start) <= end);
    let head = "", i = 0;
    while (i < n) {
      const d = C.addDays(start, i);
      const left = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate() + 1;
      const span = Math.min(left, n - i);
      head += `<div class="teaser-month" style="--span:${span}">${span >= 3 ? C.MONTHS_LONG[d.getMonth()] : ""}</div>`;
      i += span;
    }
    strip.innerHTML = `<div class="teaser-head">${head}</div>` + C.row({ start, n, events: inRange, minLanes: 2, cls: reduce ? "" : "animate" });
    strip.addEventListener("click", ev => {
      const bar = ev.target.closest(".cal-bar");
      if (bar) window.location.href = `calendar/#event=${encodeURIComponent(bar.dataset.id)}`;
    });
  }

  /* ---------- Reveals ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".reveal").forEach((el, idx) => { el.style.transitionDelay = `${(idx % 5) * 70}ms`; io.observe(el); });

  /* ---------- Motion (GSAP) ---------- */
  if (reduce || !window.gsap) return;
  const gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  if (window.Lenis && !small) {
    const lenis = new window.Lenis({ lerp: 0.12 });
    lenis.on("scroll", () => window.ScrollTrigger && window.ScrollTrigger.update());
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", ev => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) { ev.preventDefault(); lenis.scrollTo(target, { offset: -68 }); }
    }));
  }

  // Hero intro
  gsap.from("[data-split-lines] .line > span", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.09, delay: 0.15 });
  gsap.from("[data-hero-fade]", { y: 24, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1, delay: 0.55 });

  // Hero scroll: scrub video if a source is set, otherwise slow zoom on the poster.
  const hero = document.querySelector("[data-hero]");
  const video = hero.querySelector("[data-hero-video]");
  const src = small ? (video.dataset.srcMobile || video.dataset.src) : video.dataset.src;
  const st = { trigger: hero, start: "top top", end: small ? "bottom top" : "+=120%", scrub: true, pin: !small };
  if (src) {
    video.src = src; video.hidden = false;
    video.addEventListener("loadedmetadata", () => {
      hero.querySelector("[data-hero-poster]").hidden = true;
      gsap.to(video, { currentTime: video.duration || 1, ease: "none", scrollTrigger: st });
    }, { once: true });
  } else {
    gsap.fromTo("[data-hero-poster]", { scale: 1.12 }, { scale: 1, yPercent: 6, ease: "none", scrollTrigger: st });
  }
  gsap.to(".hero-copy", { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: small ? "60% top" : "+=70%", scrub: true } });

  // Philosophy: words light up as you scroll
  const q = document.querySelector("[data-split-words]");
  if (q) {
    const wrapWords = node => Array.from(node.childNodes).forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
        });
        ch.replaceWith(frag);
      } else wrapWords(ch);
    });
    wrapWords(q);
    gsap.to(q.querySelectorAll(".w"), { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: q, start: "top 80%", end: "bottom 45%", scrub: true } });
  }

  // Parallax on coach photos
  gsap.utils.toArray(".coach img").forEach(img => gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: "none", scrollTrigger: { trigger: img.parentElement, scrub: true } }));
})();
