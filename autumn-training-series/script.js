(() => {
  "use strict";

  const BOOKING_URL = "https://forms.gle/X7offBwNaL24wZ4t7";

  const events = {
    ats1: { date:"19–20 September 2026", venue:"WPNSA", price:"£180", title:"Autumn Training Series #1", intro:"Strip sailing back to its foundations and build repeatable technique before the winter training period.", focus:"Speed runs, tacks, gybes, mark roundings and core boat handling.", expect:["High-intensity on-water sessions","Structured technical repetition","Onshore video analysis","Personalised post-camp summary"], deadline:"Bookings normally close 29 August 2026. A £20 late fee may apply after the deadline." },
    ats2: { date:"26–27 September 2026", venue:"Poole Yacht Club", price:"£180", title:"Autumn Training Series #2", intro:"Apply core technique when boat-on-boat pressure reduces time and attention, revealing the areas that need focused work.", focus:"Technical execution under pressure, boat-on-boat interactions and turning conscious skills into automatic processes.", expect:["Pressure-based boat-handling drills","Targeted work on individual weaknesses","Onshore video analysis","Personalised post-camp summary"], deadline:"Bookings normally close 5 September 2026. A £20 late fee may apply after the deadline." },
    ats3: { date:"3–4 October 2026", venue:"WPNSA", price:"£180", title:"Autumn Training Series #3", intro:"Build a dependable starting toolbox in a controlled training environment before autumn qualification events.", focus:"Start-line manoeuvres, time-on-distance, line awareness and consistent technical execution.", expect:["Repeated starting sequences","Time-on-distance practice","Line-awareness drills","Video review and individual feedback"], deadline:"Bookings normally close 12 September 2026. A £20 late fee may apply after the deadline." },
    ats4: { date:"10–11 October 2026", venue:"Poole Yacht Club", price:"£180", title:"Autumn Training Series #4", intro:"Put speed and starting skills into a competitive setting, with detailed work on controlling space before the gun.", focus:"Start-line positioning, holding a lane and boat-on-boat control during the final three minutes.", expect:["Close boat-on-boat exercises","Position-holding practice","Start-line decision-making","Video review and individual feedback"], deadline:"Bookings normally close 19 September 2026. A £20 late fee may apply after the deadline." },
    race1: { date:"19–22 October 2026", venue:"WPNSA", price:"£360", title:"October Race Camp", intro:"Turn lessons from the National Opens into practical changes before the final qualification event of the season.", focus:"Strategic and tactical decision-making around the racecourse, with opportunities to refine race execution.", expect:["Race-scenario training","Strategy and tactical exercises","Event-learning review","Video analysis and individual feedback"], deadline:"Bookings normally close 28 September 2026. A £20 late fee may apply after the deadline." },
    race2: { date:"26–30 October 2026", venue:"Poole Yacht Club", price:"£450", title:"October Race Camp", intro:"Review autumn event performance, address immediate development opportunities and shape a focused winter programme.", focus:"A varied training week guided by the specific developmental needs of the sailors attending.", expect:["Performance review","Targeted technical and racecraft sessions","Winter priority setting","Video analysis and individual feedback"], deadline:"Bookings normally close 5 October 2026. A £20 late fee may apply after the deadline." },
    ats5: { date:"7–8 November 2026", venue:"Poole Yacht Club", price:"£180", title:"Autumn Training Series #5", intro:"Consolidate the autumn programme by returning to the technical fundamentals that will underpin winter development.", focus:"Speed runs, tacks, gybes, mark roundings, boat handling and clear priorities for the winter.", expect:["Technical consolidation","High-quality repetition","Winter foundation work","Video analysis and individual feedback"], deadline:"Bookings normally close 17 October 2026. A £20 late fee may apply after the deadline." },
    winterChristmas: { date:"19–23 December 2026", venue:"Poole Yacht Club", price:"", title:"Winter Training Series - Christmas Camp", intro:"A five-day winter training block at Poole Yacht Club, continuing the technical and race-development work from the autumn series.", focus:"A structured winter block for ILCA 4 and ILCA 6 sailors, with the detailed daily focus shaped around the group and conditions.", expect:["High-quality winter water time","Technical and racecraft development","Video analysis","Individual feedback"], deadline:"Booking interest is now open. Full camp and pricing information will follow." },
    winterNY1: { date:"27–30 December 2026", venue:"Poole Yacht Club", price:"", title:"Winter Training Series - New Year's Camp #1", intro:"Four days of focused training between Christmas and New Year at Poole Yacht Club.", focus:"Maintain momentum through the holiday period with purposeful technical work, racing exercises and winter development.", expect:["Four-day training block","Technical repetition","Racecraft exercises","Video analysis and feedback"], deadline:"Booking interest is now open. Full camp and pricing information will follow." },
    winterNY2: { date:"31 December 2026–3 January 2027", venue:"Poole Yacht Club", price:"", title:"Winter Training Series - New Year's Camp #2", intro:"A second four-day New Year training block at Poole Yacht Club, carrying winter development into 2027.", focus:"Technical development and race execution with a programme adapted to the sailors attending and the conditions.", expect:["Four-day training block","Speed and boat-handling work","Race scenarios","Video analysis and feedback"], deadline:"Booking interest is now open. Full camp and pricing information will follow." },
    winter9: { date:"13–14 February 2027", venue:"Poole Yacht Club", price:"", title:"Winter Training Series #9", intro:"A focused weekend block at Poole Yacht Club as the winter programme moves towards the spring season.", focus:"Consolidating winter gains through technical training, starts and race-focused exercises.", expect:["Two-day training block","Technical development","Starting and racecraft work","Video analysis and feedback"], deadline:"Booking interest is now open. Full camp and pricing information will follow." },
    winterFebruary: { date:"15–19 February 2027", venue:"Poole Yacht Club", price:"", title:"Winter Training Series - February Training Camp", intro:"A five-day February training camp at Poole Yacht Club for a concentrated mid-winter development block.", focus:"A varied programme combining technical work, speed, starts and racecraft across a full training week.", expect:["Five-day training block","Speed and technique","Starts and racecraft","Video analysis and feedback"], deadline:"Booking interest is now open. Full camp and pricing information will follow." },
    winter10: { date:"20–21 February 2027", venue:"Poole Yacht Club", price:"", title:"Winter Training Series #10", intro:"The final listed winter weekend at Poole Yacht Club, following directly on from the February Training Camp.", focus:"Consolidate the week’s learning and sharpen race execution ahead of the spring season.", expect:["Two-day training block","Technical consolidation","Race-focused training","Video analysis and feedback"], deadline:"Booking interest is now open. Full camp and pricing information will follow." }
  };

  document.title = "Autumn & Winter Training Series | ILCA 4 & 6 Coaching";
  const heroTitle = document.querySelector("#hero-title");
  if (heroTitle) heroTitle.innerHTML = "Autumn &amp;<br>Winter Training<br>Series";
  const eyebrow = document.querySelector(".hero .eyebrow");
  if (eyebrow) eyebrow.innerHTML = 'ILCA 4 &amp; 6 <span>·</span> 2026/27 Training';
  const heroMeta = document.querySelector(".hero-meta");
  if (heroMeta) heroMeta.innerHTML = '<strong>September 2026–February 2027</strong><span>WPNSA and Poole Yacht Club</span>';
  const heroCopy = document.querySelector(".hero-copy");
  if (heroCopy) heroCopy.textContent = "New winter training dates are now live, extending the programme through Christmas, New Year and February.";
  const datesHeading = document.querySelector("#dates .section-kicker");
  if (datesHeading) datesHeading.textContent = "Autumn + Winter 2026/27";
  const datesTitle = document.querySelector("#dates h2");
  if (datesTitle) datesTitle.textContent = "Training dates";

  const list = document.querySelector(".event-list");
  if (list && !document.querySelector('[data-event="winterChristmas"]')) {
    const divider = document.createElement("div");
    divider.className = "winter-date-divider";
    divider.innerHTML = '<span>Winter 2026/27</span><strong>6 new dates added</strong>';
    list.appendChild(divider);
    const winterCards = [
      ["winterChristmas","DEC","19–23","Winter Training Series","Christmas Camp"],
      ["winterNY1","DEC","27–30","Winter Training Series","New Year’s Camp #1"],
      ["winterNY2","DEC/JAN","31–3","Winter Training Series","New Year’s Camp #2"],
      ["winter9","FEB","13–14","Winter Training Series #9","Poole Yacht Club"],
      ["winterFebruary","FEB","15–19","Winter Training Series","February Training Camp"],
      ["winter10","FEB","20–21","Winter Training Series #10","Poole Yacht Club"]
    ];
    winterCards.forEach(([key,month,date,title,subtitle]) => {
      const article = document.createElement("article");
      article.className = "event-card winter-event-card";
      article.setAttribute("role","listitem");
      article.dataset.event = key;
      article.innerHTML = `<button class="event-trigger" type="button" aria-expanded="false" aria-controls="detail-${key}"><span class="event-date"><small>${month}</small>${date}</span><span class="event-main"><strong>${title}</strong><small>Poole Yacht Club · ${subtitle}</small><span class="event-availability"><small>ILCA 4 <strong>Spaces available</strong></small><small>ILCA 6 <strong>Spaces available</strong></small></span></span><span class="event-price winter-new-pill">NEW</span><span class="event-arrow" aria-hidden="true">→</span></button><div class="mobile-event-detail" id="detail-${key}"></div>`;
      list.appendChild(article);
    });
  }

  const injectedStyles = document.createElement("style");
  injectedStyles.textContent = `.winter-date-divider{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:26px 0 4px;padding:13px 16px;border-left:4px solid var(--blue-600);background:var(--ice);text-transform:uppercase}.winter-date-divider span{font-size:.78rem;font-weight:850;letter-spacing:.08em}.winter-date-divider strong{color:var(--blue-600);font-size:.72rem;letter-spacing:.08em}.winter-event-card{border-color:#bfd0ee}.winter-new-pill{min-width:44px;padding:6px 8px;border-radius:999px;color:var(--white);background:var(--blue-600);font-size:.66rem;line-height:1;text-align:center}.event-availability{display:flex;flex-wrap:wrap;gap:5px 14px;margin-top:7px}.event-availability small{font-size:.69rem}.event-availability strong{font-weight:850}@media(max-width:860px){.event-card.is-selected .event-availability,.event-card.is-selected .event-availability small,.event-card.is-selected .event-availability strong{color:var(--ink)!important}}@media(max-width:620px){.winter-date-divider{align-items:flex-start;flex-direction:column;gap:2px}.event-availability{display:grid;gap:2px}.winter-new-pill{min-width:38px;font-size:.58rem}}`;
  document.head.appendChild(injectedStyles);

  const detailMarkup = (event, includeTitle = true) => `<div class="camp-topline"><span>${event.date}</span>${event.price ? `<strong>${event.price}</strong>` : `<strong>NEW DATE</strong>`}</div>${includeTitle ? `<h3>${event.title}</h3>` : ""}<p class="camp-venue">${event.venue}</p><p>${event.intro}</p><h4>Main focus</h4><p>${event.focus}</p><ul>${event.expect.map(item=>`<li>${item}</li>`).join("")}</ul><p class="camp-suitable"><strong>Suitable for:</strong> ILCA 4 and 6 sailors, primarily those racing nationally with international aspirations.</p><p class="camp-deadline">${event.deadline}</p><a class="button button-full" href="${BOOKING_URL}" target="_blank" rel="noopener noreferrer">Book this camp <span aria-hidden="true">↗</span></a>`;

  const cards=[...document.querySelectorAll(".event-card")];
  const desktopDetail=document.querySelector("[data-camp-detail]");
  const WHATSAPP_URL="https://chat.whatsapp.com/Ela5XJPNzAq9mNSzR45p3q";
  const isUnavailable=card=>card.classList.contains("is-unavailable");
  const isRedacted=card=>card.classList.contains("is-redacted");
  function selectEvent(card){
    if(!card||isUnavailable(card))return;
    const event=events[card.dataset.event]; if(!event)return;
    cards.forEach(item=>{const selected=item===card;const trigger=item.querySelector(".event-trigger");const mobileDetail=item.querySelector(".mobile-event-detail");item.classList.toggle("is-selected",selected);if(trigger)trigger.setAttribute("aria-expanded",String(selected));if(mobileDetail)mobileDetail.innerHTML=selected?detailMarkup(event,false):"";});
    if(desktopDetail)desktopDetail.innerHTML=detailMarkup(event);
  }
  cards.forEach(card=>{const trigger=card.querySelector(".event-trigger");if(!trigger)return;trigger.addEventListener("click",()=>{if(isRedacted(card)){window.open(WHATSAPP_URL,"_blank","noopener,noreferrer");return;}selectEvent(card);});});
  const firstAvailableCard=cards.find(card=>!isUnavailable(card));if(firstAvailableCard)selectEvent(firstAvailableCard);

  const header=document.querySelector("[data-header]");const menuButton=document.querySelector(".menu-toggle");const nav=document.querySelector(".primary-nav");const backToTop=document.querySelector(".back-to-top");
  if(menuButton&&nav){const navLinks=[...nav.querySelectorAll('a[href^="#"]')];function closeMenu(){menuButton.setAttribute("aria-expanded","false");nav.classList.remove("is-open");document.body.classList.remove("menu-open");const label=menuButton.querySelector(".sr-only");if(label)label.textContent="Open menu";}menuButton.addEventListener("click",()=>{const isOpen=menuButton.getAttribute("aria-expanded")==="true";menuButton.setAttribute("aria-expanded",String(!isOpen));nav.classList.toggle("is-open",!isOpen);document.body.classList.toggle("menu-open",!isOpen);const label=menuButton.querySelector(".sr-only");if(label)label.textContent=isOpen?"Open menu":"Close menu";});navLinks.forEach(link=>link.addEventListener("click",closeMenu));document.addEventListener("keydown",event=>{if(event.key==="Escape"){closeMenu();menuButton.focus();}});const observedSections=navLinks.map(link=>document.querySelector(link.getAttribute("href"))).filter(Boolean);const updateActiveNav=()=>{if(!observedSections.length)return;let current=observedSections[0];observedSections.forEach(section=>{if(section.getBoundingClientRect().top<=window.innerHeight*.35)current=section;});navLinks.forEach(link=>link.classList.toggle("is-active",link.getAttribute("href")===`#${current.id}`));};const onScroll=()=>{if(header)header.classList.toggle("is-scrolled",window.scrollY>20);if(backToTop)backToTop.hidden=window.scrollY<700;updateActiveNav();};onScroll();window.addEventListener("scroll",onScroll,{passive:true});}
  if(backToTop)backToTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(reduceMotion||!("IntersectionObserver" in window)){document.querySelectorAll(".reveal").forEach(item=>item.classList.add("is-visible"));}else{const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");revealObserver.unobserve(entry.target);}});},{threshold:.12});document.querySelectorAll(".reveal").forEach(item=>revealObserver.observe(item));}
})();