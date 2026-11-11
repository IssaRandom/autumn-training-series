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

  /* Greedy lane packing: longest-first within same start keeps big blocks on top lanes. */
  function pack(segs) {
    segs.sort((a, b) => a.c - b.c || b.s - a.s);
    const ends = [];
    segs.forEach(g => {
      let lane = ends.findIndex(end => end < g.c);
      if (lane === -1) { lane = ends.length; ends.push(-1); }
      ends[lane] = g.c + g.s - 1;
      g.l = lane;
    });
    return ends.length;
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
      const cl = ["cal-cell", inside ? "" : "is-pad", w > 4 ? "is-we" : "", +d === +today ? "is-today" : "", d < today ? "is-past" : ""].join(" ").replace(/\s+/g, " ").trim();
      cells += `<div class="${cl}"${inside ? ` data-date="${iso(d)}"` : ""}>${inside ? `<span class="cal-num">${String(d.getDate()).padStart(2, "0")}</span>` : ""}</div>`;
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

  window.BTSCal = { DAY, MONTHS, MONTHS_LONG, WD, parse, iso, addDays, diff, wd, today, esc, range, rigText, row, ics };
})();
