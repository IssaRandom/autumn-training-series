/* Advice directory + under-construction pages: nav toggle, year, title reveal. */
(() => {
  "use strict";
  const nav = document.querySelector("[data-nav]"), toggle = document.querySelector("[data-nav-toggle]");
  if (nav && toggle) toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) return;
  const title = document.querySelector("[data-split]");
  if (title) {
    title.innerHTML = title.textContent.split(" ").map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(" ");
    title.classList.add("is-split");
  }
})();
