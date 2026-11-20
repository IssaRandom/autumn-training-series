/* Commonwealth Youth Games guide: deadline countdown, birth-year checker, road timeline reveal. */
(() => {
  // Days left until the Expression of Interest closes
  const dl = document.querySelector("[data-deadline]");
  if (dl) {
    const left = dl.querySelector("[data-deadline-left]");
    const ms = new Date(dl.dataset.deadline) - Date.now();
    const days = Math.ceil(ms / 864e5);
    left.textContent = ms <= 0 ? "Closed" : days === 1 ? "1 day left" : days + " days left";
  }

  // Birth-year checker (ages as at 31 Dec 2027)
  const ac = document.querySelector("[data-agecheck]");
  if (ac) {
    const out = ac.querySelector("[data-agecheck-out]");
    const btns = [...ac.querySelectorAll("[data-by]")];
    const cols = { 2009: 2, 2010: 3, 2011: 4, 2012: 5, 2013: 6, 2014: 7 };
    const cells = [...ac.querySelectorAll(".agecheck__grid i")];
    const say = y => {
      const age = 2027 - y, opti = y === 2012 || y === 2013, ilca = y >= 2010 && y <= 2013;
      if (opti) return `Born in ${y}, you’re ${age} on 31 Dec 2027. You can go for <b>Optimist</b> or <b>ILCA 4</b>, but you choose one event on the form.`;
      if (ilca) return `Born in ${y}, you’re ${age} on 31 Dec 2027. You can go for <b>ILCA 4</b>. Optimist is for 2012 and 2013 only.`;
      if (y < 2010) return `Born in ${y}, you’re ${age} on 31 Dec 2027, which is too old for the sailing events this time.`;
      return `Born in ${y}, you’re ${age} on 31 Dec 2027, which is too young for Malta 2027.`;
    };
    btns.forEach(b => b.addEventListener("click", () => {
      const y = +b.dataset.by, on = b.getAttribute("aria-pressed") !== "true";
      btns.forEach(x => x.setAttribute("aria-pressed", x === b && on ? "true" : "false"));
      ac.classList.toggle("has-pick", on);
      cells.forEach((c, i) => c.classList.toggle("is-pick", on && (i % 6) + 2 === cols[y]));
      out.innerHTML = on ? say(y) : "Optimist: born 2012 or 2013 (aged 14–15). ILCA 4: born 2010 to 2013 (aged 14–17).";
    }));
    btns.forEach(b => b.setAttribute("aria-pressed", "false"));
  }

  // Road to Malta: steps rise in one by one as they scroll into view (replays, like the other guides)
  const road = document.querySelector(".road");
  if (road && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    road.dataset.ready = "";
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("is-in", e.isIntersecting)), { rootMargin: "0px 0px -12% 0px" });
    road.querySelectorAll(".road__step").forEach(s => io.observe(s));
  }
})();
