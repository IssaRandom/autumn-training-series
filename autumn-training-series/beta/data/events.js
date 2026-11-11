/* Beyond the Shift /beta — season event data (single source for homepage + calendar).
   Snapshot 11 Nov 2026 — see .claude/skills/bts-calendar/events-2026-27.md for sources.
   BTS camps are DUPLICATED from the live `camps` array in ../../script.js (winter-dates-update branch).
   Keep both in sync until beta goes live.
   short = label used when the bar is narrow. rigs: [] = open to all rigs / allocated by ranking. status: confirmed | provisional.
   optional: true = hidden unless the "Masters & women's" filter is on. */
window.BTS_EVENTS = [
  /* ---- Beyond the Shift training ---- */
  { id: "ats1", name: "Autumn Series #1", short: "ATS 1", start: "2026-09-19", end: "2026-09-20", venue: "WPNSA", rigs: [4, 6], type: "bts-camp", note: "Technical foundations" },
  { id: "ats2", name: "Autumn Series #2", short: "ATS 2", start: "2026-09-26", end: "2026-09-27", venue: "Poole Yacht Club", rigs: [4, 6], type: "bts-camp", note: "Execution under pressure" },
  { id: "ats3", name: "Autumn Series #3", short: "ATS 3", start: "2026-10-03", end: "2026-10-04", venue: "WPNSA", rigs: [4, 6], type: "bts-camp", note: "Starting & line awareness" },
  { id: "ats4", name: "Autumn Series #4", short: "ATS 4", start: "2026-10-10", end: "2026-10-11", venue: "Poole Yacht Club", rigs: [4, 6], type: "bts-camp", note: "Start-line positioning & control" },
  { id: "race1", name: "October Race Camp", short: "Race camp", start: "2026-10-19", end: "2026-10-22", venue: "WPNSA", rigs: [4, 6], type: "bts-camp", note: "Strategy and tactics" },
  { id: "race2", name: "October Race Camp", short: "Race camp", start: "2026-10-26", end: "2026-10-30", venue: "Poole Yacht Club", rigs: [4, 6], type: "bts-camp", note: "Review and development" },
  { id: "ats5", name: "Autumn Series #5", short: "ATS 5", start: "2026-11-07", end: "2026-11-08", venue: "Poole Yacht Club", rigs: [4, 6], type: "bts-camp", note: "Winter foundations" },
  { id: "winterChristmas", name: "Christmas Camp", short: "Xmas camp", start: "2026-12-19", end: "2026-12-23", venue: "Poole Yacht Club", rigs: [4, 6], type: "bts-camp", note: "Winter Training Series · £450 · book by 28 Nov" },
  { id: "winterNY1", name: "New Year’s Camp #1", short: "NY camp 1", start: "2026-12-27", end: "2026-12-30", venue: "Poole Yacht Club", rigs: [4, 6], type: "bts-camp", note: "Winter Training Series · £360 · book by 6 Dec" },
  { id: "winterNY2", name: "New Year’s Camp #2", short: "NY camp 2", start: "2026-12-31", end: "2027-01-03", venue: "Poole Yacht Club", rigs: [4, 6], type: "bts-camp", note: "Winter Training Series · £360 · book by 10 Dec" },
  { id: "winter9", name: "Winter Series #9", short: "WTS 9", start: "2027-02-13", end: "2027-02-14", venue: "Poole Yacht Club", rigs: [4, 6], type: "bts-camp", note: "Weekend block · £180" },
  { id: "winterFebruary", name: "February Training Camp", short: "Feb camp", start: "2027-02-15", end: "2027-02-19", venue: "Poole Yacht Club", rigs: [4, 6], type: "bts-camp", note: "Five-day block · £450" },
  { id: "winter10", name: "Winter Series #10", short: "WTS 10", start: "2027-02-20", end: "2027-02-21", venue: "Poole Yacht Club", rigs: [4, 6], type: "bts-camp", note: "Weekend block · £180" },

  /* ---- ILCA UK training ---- */
  { id: "nt-w1", name: "National Training W1", short: "NT W1", start: "2026-11-14", end: "2026-11-15", venue: "WPNSA", rigs: [], type: "ilca-uk-training", note: "Places by ranking", url: "https://portal.ilca.uk/events" },
  { id: "rot-w3", name: "Regional Open Training W3", short: "Regional W3", start: "2026-11-21", end: "2026-11-22", venue: "Royal Harwich / Poole YC / South Shields / Draycote", rigs: [], type: "ilca-uk-training", url: "https://portal.ilca.uk/events" },
  { id: "rot-w4", name: "Regional Open Training W4", short: "Regional W4", start: "2026-12-05", end: "2026-12-06", venue: "Royal Harwich / WPNSA / South Shields / Draycote", rigs: [], type: "ilca-uk-training", url: "https://portal.ilca.uk/events" },
  { id: "nt-w2", name: "National Training W2", short: "NT W2", start: "2026-12-12", end: "2026-12-13", venue: "WPNSA", rigs: [], type: "ilca-uk-training", url: "https://portal.ilca.uk/events" },
  { id: "nt-w3", name: "National Training W3", short: "NT W3", start: "2027-01-09", end: "2027-01-10", venue: "WPNSA", rigs: [], type: "ilca-uk-training", url: "https://portal.ilca.uk/events" },
  { id: "rot-w5", name: "Regional Open Training W5", short: "Regional W5", start: "2027-01-16", end: "2027-01-17", venue: "Island Barn / WPNSA / Hollingworth Lake / Bartley", rigs: [], type: "ilca-uk-training", url: "https://portal.ilca.uk/events" },
  { id: "nt-w4", name: "National Training W4", short: "NT W4", start: "2027-02-13", end: "2027-02-14", venue: "WPNSA", rigs: [], type: "ilca-uk-training", url: "https://portal.ilca.uk/events" },
  { id: "rot-w6", name: "Regional Open Training W6", short: "Regional W6", start: "2027-02-27", end: "2027-02-28", venue: "Brightlingsea / WPNSA / South Shields / Draycote", rigs: [], type: "ilca-uk-training", url: "https://portal.ilca.uk/events" },
  { id: "nt-w5", name: "National Training W5", short: "NT W5", start: "2027-03-06", end: "2027-03-07", venue: "WPNSA", rigs: [], type: "ilca-uk-training", url: "https://portal.ilca.uk/events" },
  { id: "skills-week", name: "ILCA Skills Week", short: "Skills Week", start: "2027-07-28", end: "2027-08-01", venue: "WPNSA", rigs: [], type: "ilca-uk-training", url: "https://portal.ilca.uk/events" },

  /* ---- National Opens (rigs per NOR — 2026 had single-rig NOs) ---- */
  { id: "no1", name: "National Open 1 (Rooster)", short: "NO1", start: "2027-03-13", end: "2027-03-14", venue: "WPNSA", rigs: [4, 6, 7], type: "national-open", url: "https://portal.ilca.uk/event/2026-NO6-1" },
  { id: "no2", name: "National Open 2 (Ovington)", short: "NO2", start: "2027-03-20", end: "2027-03-21", venue: "WPNSA", rigs: [4, 6, 7], type: "national-open", checkNor: true, url: "https://portal.ilca.uk/events" },
  { id: "no3", name: "National Open 3 (Sailingfast)", short: "NO3", start: "2027-04-24", end: "2027-04-25", venue: "Hayling Island SC", rigs: [4, 6, 7], type: "national-open", checkNor: true, url: "https://portal.ilca.uk/events" },
  { id: "no4", name: "National Open 4", short: "NO4", start: "2027-10-09", end: "2027-10-10", venue: "Warsash SC", rigs: [4, 6, 7], type: "national-open", checkNor: true, url: "https://portal.ilca.uk/events" },
  { id: "no5", name: "National Open 5", short: "NO5", start: "2027-10-16", end: "2027-10-17", venue: "WPNSA", rigs: [4, 6, 7], type: "national-open", checkNor: true, url: "https://portal.ilca.uk/events" },
  { id: "no6", name: "National Open 6", short: "NO6", start: "2027-10-23", end: "2027-10-24", venue: "WPNSA", rigs: [4, 6, 7], type: "national-open", checkNor: true, url: "https://portal.ilca.uk/events" },

  /* ---- Championships ---- */
  { id: "nationals", name: "ILCA UK Open & National Championships", short: "Nationals", start: "2027-08-07", end: "2027-08-13", venue: "Largs SC", rigs: [4, 6, 7], type: "championship", url: "https://portal.ilca.uk/events" },
  { id: "inlands", name: "Inland Championships", short: "Inlands", start: "2027-11-06", end: "2027-11-07", venue: "Rutland SC", rigs: [4, 6, 7], type: "championship", url: "https://portal.ilca.uk/events" },

  /* ---- International ---- */
  { id: "u21-worlds", name: "ILCA U21 Worlds", short: "U21 Worlds", start: "2027-01-10", end: "2027-01-17", venue: "Sandringham, Australia", rigs: [6, 7], type: "international", url: "https://events.ilcasailing.org/" },
  { id: "i6-youth-euros", name: "ILCA 6 Youth Europeans", short: "6 Youth Euros", start: "2027-03-22", end: "2027-03-29", venue: "Hyères, France", rigs: [6], type: "international", status: "provisional", url: "https://www.eurilca.eu/" },
  { id: "senior-euros", name: "ILCA Senior Europeans", short: "Senior Euros", start: "2027-05-15", end: "2027-05-22", venue: "Murcia, Spain", rigs: [6, 7], type: "international", status: "provisional", url: "https://www.eurilca.eu/" },
  { id: "i4-youth-worlds", name: "ILCA 4 Youth Worlds", short: "4 Youth Worlds", start: "2027-06-22", end: "2027-06-30", venue: "Qinhuangdao, China", rigs: [4], type: "international", note: "Charter training 17–21 Jun", url: "https://events.ilcasailing.org/" },
  { id: "i4-youth-euros", name: "ILCA 4 Youth Europeans", short: "4 Youth Euros", start: "2027-07-24", end: "2027-07-31", venue: "Quiberon, France", rigs: [4], type: "international", status: "provisional", url: "https://www.eurilca.eu/" },
  { id: "i6-mens-worlds", name: "ILCA 6 Men’s Worlds", short: "6 Men’s Worlds", start: "2027-08-13", end: "2027-08-20", venue: "Volos, Greece", rigs: [6], type: "international", url: "https://events.ilcasailing.org/" },
  { id: "i6-youth-worlds", name: "ILCA 6 Youth Worlds", short: "6 Youth Worlds", start: "2027-08-21", end: "2027-08-29", venue: "Volos, Greece", rigs: [6], type: "international", url: "https://events.ilcasailing.org/" },
  { id: "u21-euros", name: "ILCA U21 Europeans", short: "U21 Euros", start: "2027-10-02", end: "2027-10-09", venue: "Athens (Kalamaki), Greece", rigs: [6, 7], type: "international", status: "provisional", url: "https://www.eurilca.eu/" },

  /* ---- Deadlines & milestones ---- */
  { id: "dl-i4yw-open", name: "ILCA 4 Youth Worlds applications open", short: "4YW open", start: "2026-12-24", end: "2026-12-24", rigs: [4], type: "deadline" },
  { id: "dl-i4yw-rank", name: "ILCA 4 Youth Worlds ranking close", short: "4YW ranking", start: "2027-02-22", end: "2027-02-22", rigs: [4], type: "deadline", note: "Initial-ranking close = ranking date" },
  { id: "dl-i6yw-open", name: "ILCA 6 Youth Worlds applications open", short: "6YW open", start: "2027-02-22", end: "2027-02-22", rigs: [6], type: "deadline" },
  { id: "dl-i4yw-offers", name: "ILCA 4 Youth Worlds first offers", short: "4YW offers", start: "2027-03-01", end: "2027-03-01", rigs: [4], type: "deadline" },
  { id: "dl-i6yw-rank", name: "ILCA 6 Youth Worlds ranking close", short: "6YW ranking", start: "2027-04-23", end: "2027-04-23", rigs: [6], type: "deadline", note: "Initial-ranking close = ranking date" },
  { id: "dl-i6yw-offers", name: "ILCA 6 Youth Worlds offers", short: "6YW offers", start: "2027-04-30", end: "2027-04-30", rigs: [6], type: "deadline" },
  { id: "dl-i4yw-entries", name: "ILCA 4 Youth Worlds entries close", short: "4YW entries", start: "2027-05-23", end: "2027-05-23", rigs: [4], type: "deadline" },
  { id: "dl-i6yw-entries", name: "ILCA 6 Youth Worlds entries close", short: "6YW entries", start: "2027-07-22", end: "2027-07-22", rigs: [6], type: "deadline" },

  /* ---- Optional: masters & women's (hidden by default) ---- */
  { id: "wg-train-1", name: "Women & Girls Training", short: "W&G", start: "2026-12-04", end: "2026-12-04", venue: "Parkstone YC", rigs: [], type: "ilca-uk-training", optional: true },
  { id: "masters-inlands-26", name: "Masters Inlands", short: "Masters", start: "2026-12-05", end: "2026-12-06", venue: "TBC", rigs: [], type: "championship", optional: true },
  { id: "wg-train-2", name: "Women & Girls Training", short: "W&G", start: "2026-12-12", end: "2026-12-12", venue: "Parkstone YC", rigs: [], type: "ilca-uk-training", optional: true },
  { id: "wg-train-3", name: "Women & Girls Training", short: "W&G", start: "2027-02-19", end: "2027-02-19", venue: "Parkstone YC", rigs: [], type: "ilca-uk-training", optional: true },
  { id: "masters-nats", name: "Masters Nationals", short: "Masters Nats", start: "2027-06-25", end: "2027-06-27", venue: "TBC", rigs: [], type: "championship", optional: true },
  { id: "wg-regatta", name: "Women & Girls Regatta", short: "W&G Regatta", start: "2027-07-03", end: "2027-07-04", venue: "Rutland SC", rigs: [], type: "championship", optional: true },
  { id: "tideway-masters", name: "Tideway Masters", short: "Tideway", start: "2027-09-11", end: "2027-09-12", venue: "Parkstone YC", rigs: [], type: "championship", optional: true },
  { id: "masters-inlands-27", name: "Masters Inlands", short: "Masters", start: "2027-10-30", end: "2027-10-31", venue: "TBC", rigs: [], type: "championship", optional: true }
];

window.BTS_TYPES = {
  "bts-camp":         { label: "BTS training",      short: "BTS" },
  "national-open":    { label: "National Opens",    short: "NO" },
  "championship":     { label: "Championships",     short: "Champs" },
  "ilca-uk-training": { label: "ILCA UK training",  short: "Training" },
  "international":    { label: "International",     short: "Intl" },
  "deadline":         { label: "Deadlines",         short: "Deadline" }
};
