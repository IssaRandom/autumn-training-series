/* BTS calendar engine — shared by /beta/ (teaser strip) and /beta/calendar/.
   A "row" is a run of consecutive day cells. Year view = one 37-cell row per month
   (weekday-aligned, like a year planner); Months view = 7-cell week rows; teaser = N-day strip.
   Bars are positioned in % of the row so zoom only changes a CSS variable (no re-render). */
(function () {
  "use strict";
  const DAY = 864e5;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WD = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const parse = iso => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const diff = (a, b) => Math.round((a - b) / DAY);
  const wd = d => (d.getDay() + 6) % 7; // Monday = 0
  const today = (() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); })();
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function range(e) {
    const s = parse(e.start), t = parse(e.end);
    const sameMonth = s.getMonth() === t.getMonth() && s.getFullYear() === t.getFullYear();
    if (+s === +t) return `${s.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()}`;
    if (sameMonth) return `${s.getDate()}–${t.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()}`;
    if (s.getFullYear() === t.getFullYear()) return `${s.getDate()} ${MONTHS[s.getMonth()]} – ${t.getDate()} ${MONTHS[t.getMonth()]} ${t.getFullYear()}`;
    return `${s.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()} – ${t.getDate()} ${MONTHS[t.getMonth()]} ${t.getFullYear()}`;
  }
  const rigText = e => (e.rigs && e.rigs.length ? e.rigs.map(r => `ILCA ${r}`).join(" · ") : "All rigs");

  /* Lane packing. BTS training is placed first so it always sits on the top lane,
     then championships, then everything else (by start, longest first). */
  const PRIORITY = { "bts-camp": 0, championship: 1 };
  function pack(segs) {
    const pr = g => PRIORITY[g.e.type] ?? 2;
    segs.sort((a, b) => pr(a) - pr(b) || a.c - b.c || b.s - a.s);
    const lanes = [];
    segs.forEach(g => {
      const end = g.c + g.s - 1;
      let lane = lanes.findIndex(L => L.every(([c, e]) => e < g.c || c > end));
      if (lane === -1) { lane = lanes.length; lanes.push([]); }
      lanes[lane].push([g.c, end]);
      g.l = lane;
    });
    return lanes.length;
  }

  /* Render one row.
     opts: start (Date of cell 0), n (cells), visStart/visEnd (Dates shown; outside = padding),
           events, minLanes, label (optional row header html), cls, animate */
  function row(opts) {
    const { start, n, events } = opts;
    const visStart = opts.visStart || start, visEnd = opts.visEnd || addDays(start, n - 1);
    const rowEnd = addDays(start, n - 1);
    const lo = visStart > start ? visStart : start, hi = visEnd < rowEnd ? visEnd : rowEnd;
    let cells = "";
    for (let i = 0; i < n; i++) {
      const d = addDays(start, i);
      const inside = d >= visStart && d <= visEnd;
      const w = wd(d);
      const cl = ["cal-cell", inside ? "" : "is-pad", w > 4 ? "is-we" : "", w === 0 ? "is-mon" : "", +d === +today ? "is-today" : "", d < today ? "is-past" : ""].join(" ").replace(/\s+/g, " ").trim();
      cells += `<div class="${cl}"${inside ? ` data-date="${iso(d)}"` : ""}>${inside ? `<span class="cal-num">${d.getDate()}</span>` : ""}</div>`;
    }
    const segs = [];
    events.forEach(e => {
      const es = parse(e.start), ee = parse(e.end);
      const s = es > lo ? es : lo, t = ee < hi ? ee : hi;
      if (s > t) return;
      segs.push({ e, c: diff(s, start), s: diff(t, s) + 1, cl: es < s, cr: ee > t });
    });
    const lanes = Math.max(opts.minLanes || 0, pack(segs));
    const bars = segs.map((g, i) => {
      const e = g.e, past = parse(e.end) < today;
      const cls = ["cal-bar", `t-${e.type}`, g.cl ? "cont-l" : "", g.cr ? "cont-r" : "", past ? "is-past" : "", e.status === "provisional" ? "is-prov" : ""].join(" ").replace(/\s+/g, " ").trim();
      const label = `${e.name}, ${range(e)}${e.venue ? ", " + e.venue : ""}`;
      return `<button type="button" class="${cls}" style="--c:${g.c};--s:${g.s};--l:${g.l};--i:${i}" data-id="${esc(e.id)}" aria-label="${esc(label)}" title="${esc(label)}"><span class="full">${esc(e.name)}</span><span class="short" aria-hidden="true">${esc(e.short || e.name)}</span></button>`;
    }).join("");
    return `<div class="cal-row ${opts.cls || ""}" style="--n:${n};--lanes:${lanes}">${opts.label || ""}<div class="cal-track"><div class="cal-cells">${cells}</div><div class="cal-bars">${bars}</div></div></div>`;
  }

  /* .ics for one event (all-day, DTEND exclusive) */
  function ics(e) {
    const f = d => iso(d).replace(/-/g, "");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Beyond the Shift//Season calendar//EN", "BEGIN:VEVENT",
      `UID:${e.id}@beyondtheshift.co.uk`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${f(parse(e.start))}`, `DTEND;VALUE=DATE:${f(addDays(parse(e.end), 1))}`,
      `SUMMARY:${e.name}`, e.venue ? `LOCATION:${e.venue}` : "", `DESCRIPTION:${[rigText(e), e.note, e.url].filter(Boolean).join(" — ")}`,
      "END:VEVENT", "END:VCALENDAR"].filter(Boolean);
    return lines.join("\r\n");
  }

  /* Google Calendar "add event" link (all-day, end exclusive) */
  function gcal(e) {
    const f = d => iso(d).replace(/-/g, "");
    const q = new URLSearchParams({ action: "TEMPLATE", text: e.name, dates: `${f(parse(e.start))}/${f(addDays(parse(e.end), 1))}`,
      details: [rigText(e), e.note, e.url].filter(Boolean).join(" — "), location: e.venue || "" });
    return `https://calendar.google.com/calendar/render?${q}`;
  }

  /* Reminder the day before a closing date: a 15-minute timed event at 09:00 UK time with an alarm.
     r = { id, title, details, date (ISO day of the reminder), url } */
  function reminderIcs(r) {
    const d = iso(parse(r.date)).replace(/-/g, "");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Beyond the Shift//Season calendar//EN", "BEGIN:VEVENT",
      `UID:remind-${r.id}@beyondtheshift.co.uk`, `DTSTAMP:${stamp}`,
      `DTSTART:${d}T090000`, `DTEND:${d}T091500`,
      `SUMMARY:${r.title}`, `DESCRIPTION:${[r.details, r.url].filter(Boolean).join(" — ")}`, r.url ? `URL:${r.url}` : "",
      "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${r.title}`, "TRIGGER:PT0M", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
  }
  function reminderGcal(r) {
    const d = iso(parse(r.date)).replace(/-/g, "");
    const q = new URLSearchParams({ action: "TEMPLATE", text: r.title, dates: `${d}T090000/${d}T091500`, ctz: "Europe/London",
      details: [r.details, r.url].filter(Boolean).join("\n\n") });
    return `https://calendar.google.com/calendar/render?${q}`;
  }
  function download(name, text) {
    const blob = new Blob([text], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  window.BTSCal = { DAY, MONTHS, MONTHS_LONG, WD, parse, iso, addDays, diff, wd, today, esc, range, rigText, row, ics, gcal, reminderIcs, reminderGcal, download };
})();
