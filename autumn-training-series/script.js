(() => {
  "use strict";

  const BOOKING_URL = "https://forms.gle/X7offBwNaL24wZ4t7";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE_OUT = "cubic-bezier(.16,1,.3,1)";

  /* ---------------------------------------------------------
     CAMP DATA — the single source of truth for the schedule.
     A camp is treated as completed automatically once its end date has passed,
     and the list is always ordered soonest first.
     spaces: [ILCA 4, ILCA 6] remaining, or null for "Spaces available".
     --------------------------------------------------------- */
  const camps = [
    {key:"ats1",start:"2026-09-19",end:"2026-09-20",month:"SEP",days:"19–20",short:"Autumn Series #1",venue:"WPNSA",focus:"Technical foundations",season:"autumn",price:"£180",spaces:[6,6],
      date:"19–20 September 2026",title:"Autumn Training Series #1",intro:"Strip sailing back to its foundations and build repeatable technique before the winter training period.",detailFocus:"Speed runs, tacks, gybes, mark roundings and core boat handling.",expect:["High-intensity on-water sessions","Structured technical repetition","Onshore video analysis","Personalised post-camp summary"],deadline:"Bookings normally close three weeks before the camp."},
    {key:"ats2",start:"2026-09-26",end:"2026-09-27",month:"SEP",days:"26–27",short:"Autumn Series #2",venue:"Poole Yacht Club",focus:"Execution under pressure",season:"autumn",price:"£180",spaces:[3,5],
      date:"26–27 September 2026",title:"Autumn Training Series #2",intro:"Apply core technique when boat-on-boat pressure reduces time and attention, revealing the areas that need focused work.",detailFocus:"Technical execution under pressure, boat-on-boat interactions and turning conscious skills into automatic processes.",expect:["Pressure-based boat-handling drills","Targeted work on individual weaknesses","Onshore video analysis","Personalised post-camp summary"],deadline:"Bookings normally close three weeks before the camp."},
    {key:"ats3",start:"2026-10-03",end:"2026-10-04",month:"OCT",days:"3–4",short:"Autumn Series #3",venue:"WPNSA",focus:"Starting & line awareness",season:"autumn",price:"£180",spaces:[3,3],
      date:"3–4 October 2026",title:"Autumn Training Series #3",intro:"Build a dependable starting toolbox in a controlled training environment before autumn qualification events.",detailFocus:"Start-line manoeuvres, time-on-distance, line awareness and consistent technical execution.",expect:["Repeated starting sequences","Time-on-distance practice","Line-awareness drills","Video review and individual feedback"],deadline:"Last chance to book — limited spaces remaining."},
    {key:"ats4",start:"2026-10-10",end:"2026-10-11",month:"OCT",days:"10–11",short:"Autumn Series #4",venue:"Poole Yacht Club",focus:"Start-line positioning & control",season:"autumn",price:"£180",spaces:[2,1],
      date:"10–11 October 2026",title:"Autumn Training Series #4",intro:"Put speed and starting skills into a competitive setting, with detailed work on controlling space before the gun.",detailFocus:"Start-line positioning, holding a lane and boat-on-boat control during the final three minutes.",expect:["Close boat-on-boat exercises","Position-holding practice","Start-line decision-making","Video review and individual feedback"],deadline:"Last chance to book — limited spaces remaining."},
    {key:"race1",start:"2026-10-19",end:"2026-10-22",month:"OCT",days:"19–22",short:"October Race Camp",venue:"WPNSA",focus:"Strategy and tactics",season:"autumn",price:"£360",spaces:[7,2],
      date:"19–22 October 2026",title:"October Race Camp",intro:"Turn lessons from the National Opens into practical changes before the final qualification event of the season.",detailFocus:"Strategic and tactical decision-making around the racecourse, with opportunities to refine race execution.",expect:["Race-scenario training","Strategy and tactical exercises","Event-learning review","Video analysis and individual feedback"],deadline:"Bookings remain open subject to availability."},
    {key:"race2",start:"2026-10-26",end:"2026-10-30",month:"OCT",days:"26–30",short:"October Race Camp",venue:"Poole Yacht Club",focus:"Review and development",season:"autumn",price:"£450",spaces:[2,3],
      date:"26–30 October 2026",title:"October Race Camp",intro:"Review autumn event performance, address immediate development opportunities and shape a focused winter programme.",detailFocus:"A varied training week guided by the specific developmental needs of the sailors attending.",expect:["Performance review","Targeted technical and racecraft sessions","Winter priority setting","Video analysis and individual feedback"],deadline:"Bookings remain open subject to availability."},
    {key:"ats5",start:"2026-11-07",end:"2026-11-08",month:"NOV",days:"7–8",short:"Autumn Series #5",venue:"Poole Yacht Club",focus:"Winter foundations",season:"autumn",price:"£180",spaces:[6,3],
      date:"7–8 November 2026",title:"Autumn Training Series #5",intro:"Consolidate the autumn programme by returning to the technical fundamentals that will underpin winter development.",detailFocus:"Speed runs, tacks, gybes, mark roundings, boat handling and clear priorities for the winter.",expect:["Technical consolidation","High-quality repetition","Winter foundation work","Video analysis and individual feedback"],deadline:"Bookings remain open subject to availability."},
    {key:"winterChristmas",start:"2026-12-19",end:"2026-12-23",month:"DEC",days:"19–23",short:"Winter Training Series",venue:"Poole Yacht Club",focus:"Christmas Camp",season:"winter",price:"",spaces:null,
      date:"19–23 December 2026",title:"Winter Training Series - Christmas Camp",intro:"A five-day winter training block at Poole Yacht Club, continuing the technical and race-development work from the autumn series.",detailFocus:"A structured winter block for ILCA 4 and ILCA 6 sailors, with the detailed daily focus shaped around the group and conditions.",expect:["High-quality winter water time","Technical and racecraft development","Video analysis","Individual feedback"],deadline:"Booking interest is now open. Full camp and pricing information will follow."},
    {key:"winterNY1",start:"2026-12-27",end:"2026-12-30",month:"DEC",days:"27–30",short:"Winter Training Series",venue:"Poole Yacht Club",focus:"New Year’s Camp #1",season:"winter",price:"",spaces:null,
      date:"27–30 December 2026",title:"Winter Training Series - New Year's Camp #1",intro:"Four days of focused training between Christmas and New Year at Poole Yacht Club.",detailFocus:"Maintain momentum through the holiday period with purposeful technical work, racing exercises and winter development.",expect:["Four-day training block","Technical repetition","Racecraft exercises","Video analysis and feedback"],deadline:"Booking interest is now open. Full camp and pricing information will follow."},
    {key:"winterNY2",start:"2026-12-31",end:"2027-01-03",month:"DEC/JAN",days:"31–3",short:"Winter Training Series",venue:"Poole Yacht Club",focus:"New Year’s Camp #2",season:"winter",price:"",spaces:null,
      date:"31 December 2026–3 January 2027",title:"Winter Training Series - New Year's Camp #2",intro:"A second four-day New Year training block at Poole Yacht Club, carrying winter development into 2027.",detailFocus:"Technical development and race execution with a programme adapted to the sailors attending and the conditions.",expect:["Four-day training block","Speed and boat-handling work","Race scenarios","Video analysis and feedback"],deadline:"Booking interest is now open. Full camp and pricing information will follow."},
    {key:"winter9",start:"2027-02-13",end:"2027-02-14",month:"FEB",days:"13–14",short:"Winter Training Series #9",venue:"Poole Yacht Club",focus:"Weekend block",season:"winter",price:"",spaces:null,
      date:"13–14 February 2027",title:"Winter Training Series #9",intro:"A focused weekend block at Poole Yacht Club as the winter programme moves towards the spring season.",detailFocus:"Consolidating winter gains through technical training, starts and race-focused exercises.",expect:["Two-day training block","Technical development","Starting and racecraft work","Video analysis and feedback"],deadline:"Booking interest is now open. Full camp and pricing information will follow."},
    {key:"winterFebruary",start:"2027-02-15",end:"2027-02-19",month:"FEB",days:"15–19",short:"Winter Training Series",venue:"Poole Yacht Club",focus:"February Training Camp",season:"winter",price:"",spaces:null,
      date:"15–19 February 2027",title:"Winter Training Series - February Training Camp",intro:"A five-day February training camp at Poole Yacht Club for a concentrated mid-winter development block.",detailFocus:"A varied programme combining technical work, speed, starts and racecraft across a full training week.",expect:["Five-day training block","Speed and technique","Starts and racecraft","Video analysis and feedback"],deadline:"Booking interest is now open. Full camp and pricing information will follow."},
    {key:"winter10",start:"2027-02-20",end:"2027-02-21",month:"FEB",days:"20–21",short:"Winter Training Series #10",venue:"Poole Yacht Club",focus:"Weekend block",season:"winter",price:"",spaces:null,
      date:"20–21 February 2027",title:"Winter Training Series #10",intro:"The final listed winter weekend at Poole Yacht Club, following directly on from the February Training Camp.",detailFocus:"Consolidate the week’s learning and sharpen race execution ahead of the spring season.",expect:["Two-day training block","Technical consolidation","Race-focused training","Video analysis and feedback"],deadline:"Booking interest is now open. Full camp and pricing information will follow."}
  ];

  const DAY = 864e5;
  const startOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const parseDay = iso => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
  const today = startOfDay(new Date());
  const isCompleted = camp => parseDay(camp.end) < today;
  const isRunning = camp => parseDay(camp.start) <= today && !isCompleted(camp);
  const daysUntil = camp => Math.round((parseDay(camp.start) - today) / DAY);
  const bySoonest = (a, b) => parseDay(a.start) - parseDay(b.start);

  const upcoming = camps.filter(camp => !isCompleted(camp)).sort(bySoonest);
  const completed = camps.filter(isCompleted).sort(bySoonest);
  const campByKey = Object.fromEntries(camps.map(camp => [camp.key, camp]));

  const countdown = camp => {
    if (isRunning(camp)) return "On the water now";
    const days = daysUntil(camp);
    if (days === 1) return "Starts tomorrow";
    if (days < 14) return `Starts in ${days} days`;
    return `Starts in ${Math.round(days / 7)} weeks`;
  };
  const availabilityMarkup = spaces => {
    if (!spaces) return `<span class="event-availability"><small>ILCA 4 <strong>Spaces available</strong></small><small>ILCA 6 <strong>Spaces available</strong></small></span>`;
    const item = (cls, n) => n < 3 ? `<small class="low-spaces">${cls} <strong>${n} ${n === 1 ? "space" : "spaces"} remaining</strong></small>` : `<small>${cls} <strong>Spaces available</strong></small>`;
    return `<span class="event-availability">${item("ILCA 4", spaces[0])}${item("ILCA 6", spaces[1])}</span>`;
  };

  /* ---------- Schedule list ---------- */
  const list = document.querySelector("[data-event-list]");
  if (list) {
    const nextKey = upcoming[0] && upcoming[0].key;
    let seasonShown = upcoming[0] && upcoming[0].season;
    const parts = [];
    upcoming.forEach((camp, index) => {
      if (camp.season !== seasonShown && camp.season === "winter") parts.push(`<div class="winter-date-divider" role="presentation"><span>Winter 2026/27</span><strong>6 new dates added</strong></div>`);
      seasonShown = camp.season;
      const isNext = camp.key === nextKey;
      const flag = isNext ? `<span class="next-label">Next up · ${countdown(camp)}</span>` : "";
      const price = camp.price ? `<span class="event-price">${camp.price}</span>` : `<span class="event-price winter-new-pill">NEW</span>`;
      parts.push(`<article class="event-card${isNext ? " is-next" : ""}${camp.season === "winter" ? " winter-event-card" : ""}" role="listitem" data-event="${camp.key}" style="--i:${index}"><button class="event-trigger" type="button" aria-expanded="false" aria-controls="detail-${camp.key}"><span class="event-date"><small>${camp.month}</small>${camp.days}</span><span class="event-main"><strong>${camp.short}</strong><small>${camp.venue} · ${camp.focus}</small>${flag}${availabilityMarkup(camp.spaces)}</span>${price}<span class="event-arrow" aria-hidden="true">→</span></button><div class="mobile-event-detail" id="detail-${camp.key}"></div></article>`);
    });
    if (completed.length) {
      const chips = completed.map(camp => `<li><span class="done-date">${camp.month} ${camp.days}</span><span class="done-name">${camp.short}</span><span class="done-venue">${camp.venue === "Poole Yacht Club" ? "Poole YC" : camp.venue}</span></li>`).join("");
      parts.push(`<div class="completed-strip" role="listitem"><p class="completed-strip-label"><span aria-hidden="true">✓</span> ${completed.length} ${completed.length === 1 ? "camp" : "camps"} completed</p><ul aria-label="Completed camps">${chips}</ul></div>`);
    }
    list.innerHTML = parts.join("");
  }

  /* ---------- Hero: soonest camps right at the top ---------- */
  const nextWrap = document.querySelector("[data-next-camps]");
  const nextRow = document.querySelector("[data-next-camps-row]");
  if (nextWrap && nextRow && upcoming.length) {
    nextRow.innerHTML = upcoming.slice(0, 3).map(camp => {
      const low = camp.spaces && Math.min(...camp.spaces) < 3 ? `<em>Few spaces left</em>` : "";
      return `<a class="next-camp" href="#dates" data-select="${camp.key}"><span class="next-camp-date">${camp.month}<b>${camp.days}</b></span><span class="next-camp-body"><strong>${camp.short}</strong><small>${camp.venue} · ${countdown(camp)}</small>${low}</span></a>`;
    }).join("");
    nextWrap.hidden = false;
  }

  /* ---------- Camp detail ---------- */
  const detailMarkup = (camp, includeTitle = true) => `<div class="camp-topline"><span>${camp.date}</span>${camp.price ? `<strong>${camp.price}</strong>` : `<strong>NEW DATE</strong>`}</div>${includeTitle ? `<h3>${camp.title}</h3>` : ""}<p class="camp-venue">${camp.venue}</p><p>${camp.intro}</p><h4>Main focus</h4><p>${camp.detailFocus}</p><ul>${camp.expect.map(item => `<li>${item}</li>`).join("")}</ul><p class="camp-suitable"><strong>Suitable for:</strong> ILCA 4 and 6 sailors, primarily those racing nationally with international aspirations.</p><p class="camp-deadline">${camp.deadline}</p><a class="button button-full" href="${BOOKING_URL}" target="_blank" rel="noopener noreferrer">Book this camp <span aria-hidden="true">↗</span></a>`;

  const cards = [...document.querySelectorAll(".event-card[data-event]")];
  const desktopDetail = document.querySelector("[data-camp-detail]");
  const animate = (el, frames, options) => { if (!reduceMotion && el && el.animate) el.animate(frames, {easing: EASE_OUT, fill: "both", ...options}); };
  // Below 861px the detail opens inline as an accordion; above it, in the sticky side panel
  const inlineDetail = window.matchMedia("(max-width: 860px)");

  function setSelected(card) {
    const camp = card && campByKey[card.dataset.event];
    cards.forEach(item => {
      const selected = item === card;
      const trigger = item.querySelector(".event-trigger");
      const mobileDetail = item.querySelector(".mobile-event-detail");
      item.classList.toggle("is-selected", selected);
      if (trigger) trigger.setAttribute("aria-expanded", String(selected));
      if (mobileDetail) mobileDetail.innerHTML = selected ? detailMarkup(camp, false) : "";
    });
    if (camp && desktopDetail) desktopDetail.innerHTML = detailMarkup(camp);
  }

  function selectEvent(card, {animateChange = true} = {}) {
    if (!card || !campByKey[card.dataset.event]) return;
    const isOpen = card.classList.contains("is-selected");
    if (!inlineDetail.matches) {
      if (isOpen) return;
      setSelected(card);
      // Panel swap: content settles in from the right, like a fresh page of the brief
      if (animateChange) animate(desktopDetail, [{opacity: 0, transform: "translateX(14px)"}, {opacity: 1, transform: "none"}], {duration: 380});
      return;
    }
    // Accordion: tapping an open card closes it. Closing a card above shortens the page,
    // so pin the tapped card to where it was on screen instead of letting it jump away.
    const before = card.getBoundingClientRect().top;
    setSelected(isOpen ? null : card);
    const shift = card.getBoundingClientRect().top - before;
    if (shift) window.scrollBy(0, shift);
    const mobileDetail = card.querySelector(".mobile-event-detail");
    if (!isOpen && animateChange && mobileDetail) {
      animate(mobileDetail, [{height: "0px", opacity: 0}, {height: `${mobileDetail.scrollHeight}px`, opacity: 1}], {duration: 420, fill: "none"});
    }
  }
  cards.forEach(card => {
    const trigger = card.querySelector(".event-trigger");
    if (trigger) trigger.addEventListener("click", () => selectEvent(card));
  });
  // Desktop always shows a camp in the panel; on phones the list starts collapsed so every date is scannable
  const ensureSelection = () => { if (!inlineDetail.matches && cards[0] && !cards.some(card => card.classList.contains("is-selected"))) setSelected(cards[0]); };
  ensureSelection();
  if (inlineDetail.addEventListener) inlineDetail.addEventListener("change", ensureSelection);

  document.querySelectorAll("[data-select]").forEach(link => link.addEventListener("click", event => {
    const card = document.querySelector(`.event-card[data-event="${link.dataset.select}"]`);
    if (!card) return;
    event.preventDefault();
    if (!card.classList.contains("is-selected")) setSelected(card);
    card.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
    card.classList.remove("is-pinged");
    void card.offsetWidth;
    card.classList.add("is-pinged");
  }));

  /* ---------- Navigation ---------- */
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const backToTop = document.querySelector(".back-to-top");
  if (menuButton && nav) {
    const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
    const label = menuButton.querySelector(".sr-only");
    const closeMenu = () => { menuButton.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); document.body.classList.remove("menu-open"); if (label) label.textContent = "Open menu"; };
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
      if (label) label.textContent = isOpen ? "Open menu" : "Close menu";
    });
    navLinks.forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => { if (event.key === "Escape" && nav.classList.contains("is-open")) { closeMenu(); menuButton.focus(); } });
    // Sections in page order (the nav lists FAQs before Booking, the page does not)
    const observedSections = [...new Set(navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean))]
      .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    const updateActiveNav = () => {
      if (!observedSections.length) return;
      let current = observedSections[0];
      observedSections.forEach(section => { if (section.getBoundingClientRect().top <= window.innerHeight * .35) current = section; });
      navLinks.forEach(link => link.classList.toggle("is-active", !link.classList.contains("button") && link.getAttribute("href") === `#${current.id}`));
    };
    // The header steps out of the way while reading down the page and returns on any scroll up
    const hero = document.querySelector(".hero");
    let lastY = window.scrollY;
    const updateHeader = () => {
      const y = window.scrollY;
      const pastHero = y > (hero ? hero.offsetHeight * .6 : 400);
      const delta = y - lastY;
      if (!pastHero || delta < -6) document.body.classList.remove("header-hidden");
      else if (delta > 6 && !document.body.classList.contains("menu-open")) document.body.classList.add("header-hidden");
      if (Math.abs(delta) > 6 || !pastHero) lastY = y;
      if (header) header.classList.toggle("is-scrolled", y > 20);
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateHeader();
        if (backToTop) backToTop.hidden = window.scrollY < 700;
        updateActiveNav();
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {passive: true});
    // Keyboard users tabbing into the hidden header bring it straight back
    if (header) header.addEventListener("focusin", () => document.body.classList.remove("header-hidden"));
  }
  if (backToTop) backToTop.addEventListener("click", () => window.scrollTo({top: 0, behavior: reduceMotion ? "auto" : "smooth"}));

  // Sticky mobile CTA: step aside while a booking button is already on screen
  const mobileCta = document.querySelector("[data-mobile-cta]");
  const ctaZones = [...document.querySelectorAll(".hero, #booking, .final-cta")];
  if (mobileCta && ctaZones.length && "IntersectionObserver" in window) {
    const visibleZones = new Set();
    const ctaObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visibleZones.add(entry.target); else visibleZones.delete(entry.target); });
      mobileCta.classList.toggle("is-hidden", visibleZones.size > 0);
    }, {threshold: .35});
    ctaZones.forEach(zone => ctaObserver.observe(zone));
  }

  /* ---------- Scroll reveals ---------- */
  const revealItems = document.querySelectorAll(".reveal, .event-list");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(item => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); } });
    }, {threshold: .12, rootMargin: "0px 0px -6% 0px"});
    revealItems.forEach(item => revealObserver.observe(item));
  }
})();
