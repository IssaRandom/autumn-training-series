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
    const next = events.filter(e => e.type === "bts-camp" && !e.placeholder && C.parse(e.end) >= C.today).sort((a, b) => C.parse(a.start) - C.parse(b.start)).slice(0, 3);
    list.innerHTML = next.length ? next.map(e => `
      <li class="reveal"><a class="training" href="/">
        <span class="training-date">${C.esc(C.range(e).replace(/ \d{4}/g, ""))}</span>
        <span><span class="training-name">${C.esc(e.name)}</span><br><span class="training-venue">${C.esc(e.venue)} · ${C.esc(C.rigText(e))}</span></span>
        <span class="arrow" aria-hidden="true"></span>
      </a></li>`).join("") : `<li class="training">New dates coming soon.</li>`;
    /* Online booking (beta): link open camps to /beta/book/ and show places left. */
    const BK = window.BTSBook;
    if (BK && BK.mode !== "off") BK.camps().then(camps => {
      next.forEach((e, i) => {
        const c = camps.find(x => x.camp_id === e.id);
        const a = list.querySelectorAll("a.training")[i];
        if (!c || !a) return;
        a.href = `book/?camp=${encodeURIComponent(e.id)}`;
        const p = BK.fmt.placesText(c);
        a.querySelector(".arrow").removeAttribute("aria-hidden");
        a.querySelector(".arrow").innerHTML = `${p ? `<span class="places${c.full ? " is-full" : ""}">${C.esc(p)}</span> ` : ""}<span class="beta-tag">Book · Beta</span>`;
      });
    }).catch(() => {});
  }

  /* ---------- Hero "Next camps" strip (live .next-camps), from events.js ---------- */
  const nextWrap = document.querySelector("[data-next-camps]"), nextRow = document.querySelector("[data-next-camps-row]");
  if (nextWrap && nextRow && C) {
    const up = events.filter(e => e.type === "bts-camp" && !e.placeholder && C.parse(e.end) >= C.today).sort((a, b) => C.parse(a.start) - C.parse(b.start)).slice(0, 3);
    const when = e => {
      const s = C.parse(e.start), days = Math.round((s - C.today) / 864e5);
      if (days <= 0) return "On the water now";
      if (days === 1) return "Starts tomorrow";
      return days < 14 ? `Starts in ${days} days` : `Starts in ${Math.round(days / 7)} weeks`;
    };
    if (up.length) {
      nextRow.innerHTML = up.map(e => {
        const s = C.parse(e.start), en = C.parse(e.end);
        const dd = +s === +en ? `${s.getDate()}` : `${s.getDate()}–${en.getDate()}`;
        return `<a class="next-camp" href="calendar/#event=${encodeURIComponent(e.id)}"><span class="next-camp-date">${C.MONTHS_LONG[s.getMonth()].slice(0, 3)}<b>${dd}</b></span><span class="next-camp-body"><strong>${C.esc(e.name)}</strong><small>${C.esc(e.venue)} · ${when(e)}</small></span></a>`;
      }).join("");
      nextWrap.hidden = false;
    }
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

  // Hero: CSS-only entrance copied from the live site (beta.css "Hero"). No pin or scrub: pinning added
  // 120% of spacer after load, which made anchor links from other pages land, then jump.

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
})();
