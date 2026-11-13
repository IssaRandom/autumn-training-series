/* Venue guides hub: nav, reveals, and "next event here" lines from data/events.js. */
(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const C = window.BTSCal;

  /* Nav (same behaviour as beta.js / advice.js) */
  const nav = document.querySelector("[data-nav]"), toggle = document.querySelector("[data-nav-toggle]");
  toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
  nav.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }));
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  /* Reveals */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });

  /* Next event at each venue (matches the event's venue text) */
  if (!C) return;
  const MATCH = {
    weymouth: (window.BTS_VENUES || []).find(v => v.id === "weymouth")?.match || /WPNSA|Weymouth|Portland/i,
    poole: /Poole|Parkstone/i,
    hayling: /Hayling/i,
    rutland: /Rutland/i,
    grafham: /Grafham/i,
    pwllheli: /Pwllheli/i,
    warsash: /Warsash|Stokes Bay/i,
    vilamoura: /Vilamoura/i,
    largs: /Largs/i
  };
  const events = (window.BTS_EVENTS || []).filter(e => !e.optional && !e.placeholder && e.type !== "deadline" && C.parse(e.end) >= C.today && e.venue && !/\//.test(e.venue));
  const days = e => Math.round((C.parse(e.start) - C.today) / 864e5);
  const when = e => { const d = days(e); return d <= 0 ? "on now" : d === 1 ? "tomorrow" : d < 14 ? `in ${d} days` : d < 70 ? `in ${Math.round(d / 7)} weeks` : `in ${Math.round(d / 30.4)} months`; };
  document.querySelectorAll("[data-venue]").forEach(card => {
    const re = MATCH[card.dataset.venue], out = card.querySelector("[data-next-event]");
    if (!re || !out) return;
    const here = events.filter(e => re.test(e.venue)).sort((a, b) => C.parse(a.start) - C.parse(b.start));
    if (!here.length) return;
    const e = here[0], more = here.length - 1;
    const range = C.esc(C.range(e).replace(/ \d{4}/g, ""));
    out.innerHTML = card.classList.contains("feature")
      ? `<span>Next here: <b>${C.esc(e.name)}</b> · ${range} · ${when(e)}${more ? ` · +${more} more this season` : ""}</span><a href="../calendar/#event=${encodeURIComponent(e.id)}">Calendar →</a>`
      : `<span>Next here: <b>${C.esc(e.name)}</b>, ${when(e)}</span>`;
    out.hidden = false;
  });
})();
