(() => {
  "use strict";

  const BOOKING_URL = "https://forms.gle/X7offBwNaL24wZ4t7";
  const events = {
    ats1: {
      date: "19–20 September 2026",
      venue: "WPNSA",
      price: "£180",
      title: "Autumn Training Series #1",
      intro: "Strip sailing back to its foundations and build repeatable technique before the winter training period.",
      focus: "Speed runs, tacks, gybes, mark roundings and core boat handling.",
      expect: ["High-intensity on-water sessions", "Structured technical repetition", "Onshore video analysis", "Personalised post-camp summary"],
      deadline: "Bookings normally close 29 August 2026. A £20 late fee may apply after the deadline."
    },
    ats2: {
      date: "26–27 September 2026",
      venue: "Poole Yacht Club",
      price: "£180",
      title: "Autumn Training Series #2",
      intro: "Apply core technique when boat-on-boat pressure reduces time and attention, revealing the areas that need focused work.",
      focus: "Technical execution under pressure, boat-on-boat interactions and turning conscious skills into automatic processes.",
      expect: ["Pressure-based boat-handling drills", "Targeted work on individual weaknesses", "Onshore video analysis", "Personalised post-camp summary"],
      deadline: "Bookings normally close 5 September 2026. A £20 late fee may apply after the deadline."
    },
    ats3: {
      date: "3–4 October 2026",
      venue: "WPNSA",
      price: "£180",
      title: "Autumn Training Series #3",
      intro: "Build a dependable starting toolbox in a controlled training environment before autumn qualification events.",
      focus: "Start-line manoeuvres, time-on-distance, line awareness and consistent technical execution.",
      expect: ["Repeated starting sequences", "Time-on-distance practice", "Line-awareness drills", "Video review and individual feedback"],
      deadline: "Bookings normally close 12 September 2026. A £20 late fee may apply after the deadline."
    },
    ats4: {
      date: "10–11 October 2026",
      venue: "Poole Yacht Club",
      price: "£180",
      title: "Autumn Training Series #4",
      intro: "Put speed and starting skills into a competitive setting, with detailed work on controlling space before the gun.",
      focus: "Start-line positioning, holding a lane and boat-on-boat control during the final three minutes.",
      expect: ["Close boat-on-boat exercises", "Position-holding practice", "Start-line decision-making", "Video review and individual feedback"],
      deadline: "Bookings normally close 19 September 2026. A £20 late fee may apply after the deadline."
    },
    race1: {
      date: "19–22 October 2026",
      venue: "WPNSA",
      price: "£360",
      title: "October Race Camp",
      intro: "Turn lessons from the National Opens into practical changes before the final qualification event of the season.",
      focus: "Strategic and tactical decision-making around the racecourse, with opportunities to refine race execution.",
      expect: ["Race-scenario training", "Strategy and tactical exercises", "Event-learning review", "Video analysis and individual feedback"],
      deadline: "Bookings normally close 28 September 2026. A £20 late fee may apply after the deadline."
    },
    race2: {
      date: "26–30 October 2026",
      venue: "Poole Yacht Club",
      price: "£450",
      title: "October Race Camp",
      intro: "Review autumn event performance, address immediate development opportunities and shape a focused winter programme.",
      focus: "A varied training week guided by the specific developmental needs of the sailors attending.",
      expect: ["Performance review", "Targeted technical and racecraft sessions", "Winter priority setting", "Video analysis and individual feedback"],
      deadline: "Bookings normally close 5 October 2026. A £20 late fee may apply after the deadline."
    },
    ats5: {
      date: "7–8 November 2026",
      venue: "Poole Yacht Club",
      price: "£180",
      title: "Autumn Training Series #5",
      intro: "Consolidate the autumn programme by returning to the technical fundamentals that will underpin winter development.",
      focus: "Speed runs, tacks, gybes, mark roundings, boat handling and clear priorities for the winter.",
      expect: ["Technical consolidation", "High-quality repetition", "Winter foundation work", "Video analysis and individual feedback"],
      deadline: "Bookings normally close 17 October 2026. A £20 late fee may apply after the deadline."
    }
  };

  const detailMarkup = (event, includeTitle = true) => `
    <div class="camp-topline"><span>${event.date}</span><strong>${event.price}</strong></div>
    ${includeTitle ? `<h3>${event.title}</h3>` : ""}
    <p class="camp-venue">${event.venue}</p>
    <p>${event.intro}</p>
    <h4>Main focus</h4>
    <p>${event.focus}</p>
    <ul>${event.expect.map(item => `<li>${item}</li>`).join("")}</ul>
    <p class="camp-suitable"><strong>Suitable for:</strong> ILCA 4 and 6 sailors, primarily those racing nationally with international aspirations.</p>
    <p class="camp-deadline">${event.deadline}</p>
    <a class="button button-full" href="${BOOKING_URL}" target="_blank" rel="noopener noreferrer">Book this camp <span aria-hidden="true">↗</span></a>
  `;

  const cards = [...document.querySelectorAll(".event-card")];
  const desktopDetail = document.querySelector("[data-camp-detail]");

  function selectEvent(card) {
    const event = events[card.dataset.event];
    if (!event) return;
    cards.forEach(item => {
      const selected = item === card;
      item.classList.toggle("is-selected", selected);
      item.querySelector(".event-trigger").setAttribute("aria-expanded", String(selected));
      const mobileDetail = item.querySelector(".mobile-event-detail");
      mobileDetail.innerHTML = selected ? detailMarkup(event, false) : "";
    });
    desktopDetail.innerHTML = detailMarkup(event);
  }

  cards.forEach(card => card.querySelector(".event-trigger").addEventListener("click", () => selectEvent(card)));
  selectEvent(cards[0]);

  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];

  function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuButton.querySelector(".sr-only").textContent = "Open menu";
  }

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
    menuButton.querySelector(".sr-only").textContent = isOpen ? "Open menu" : "Close menu";
  });
  navLinks.forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenu();
      menuButton.focus();
    }
  });

  const backToTop = document.querySelector(".back-to-top");
  const observedSections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const updateActiveNav = () => {
    let current = observedSections[0];
    observedSections.forEach(section => {
      if (section.getBoundingClientRect().top <= window.innerHeight * .35) current = section;
    });
    navLinks.forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === `#${current.id}`));
  };

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
    backToTop.hidden = window.scrollY < 700;
    updateActiveNav();
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(item => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(item => revealObserver.observe(item));
  }
})();
