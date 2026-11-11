/* BTS online booking (beta): talks to the Apps Script web app (apps-script/Code.gs).
   Every call is fetch(POST) with a text/plain JSON body, which avoids a CORS preflight that Apps Script can't answer.
   The session token lives in localStorage for 90 days (the server only keeps its hash).
   Exposes window.BTSBook. Needs booking/config.js first. */
(function () {
  "use strict";
  const CFG = window.BTS_BOOKING || {};
  const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const params = new URLSearchParams(location.search);
  // localhost uses the mock unless ?live=1 is passed, so local testing never writes to the real sheet by accident.
  // The choice lasts for the tab (sessionStorage) so links between account/ and book/ keep it; ?live=0 goes back.
  let liveLocal = false;
  try {
    if (params.has("live")) sessionStorage.setItem("bts-book-live", params.get("live") === "1" ? "1" : "");
    liveLocal = sessionStorage.getItem("bts-book-live") === "1";
  } catch (e) { liveLocal = params.get("live") === "1"; }
  const mode = LOCAL ? (liveLocal && CFG.api ? "live" : "mock") : CFG.api ? "live" : "off";

  const TOKEN = "bts-book-token";
  const EMAIL = "bts-book-email";
  const CAMPS = "bts-book-camps";
  const store = {
    get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } },
    set(k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) { /* private mode */ } },
  };

  let mockReady = null;
  function loadMock() {
    if (window.BTS_MOCK) return Promise.resolve();
    if (!mockReady) {
      mockReady = new Promise((res, rej) => {
        const s = document.createElement("script");
        const me = document.querySelector('script[src*="booking/api.js"]');
        s.src = me ? me.src.replace(/api\.js.*$/, "mock.js") : "/beta/booking/mock.js";
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    return mockReady;
  }

  class BookingError extends Error {
    constructor(message, code) { super(message); this.code = code || ""; }
  }

  async function call(action, data) {
    if (mode === "off") throw new BookingError("Online booking isn't open yet. Please use the booking form.", "OFF");
    const body = Object.assign({ action, token: store.get(TOKEN) }, data || {});
    let out;
    try {
      if (mode === "mock") {
        await loadMock();
        out = await window.BTS_MOCK(body);
      } else {
        const res = await fetch(CFG.api, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), redirect: "follow" });
        out = await res.json();
      }
    } catch (e) {
      throw new BookingError("We couldn't reach the booking system. Check your connection and try again.", "NET");
    }
    if (!out || !out.ok) {
      if (out && out.code === "AUTH") store.set(TOKEN, "");
      throw new BookingError((out && out.error) || "Something went wrong. Please try again.", out && out.code);
    }
    return out.data;
  }

  /* Public camp list (places left, price today). Cached for 2 minutes per tab so the calendar and pages share it. */
  async function camps(fresh) {
    if (!fresh) {
      try {
        const c = JSON.parse(sessionStorage.getItem(CAMPS) || "null");
        if (c && Date.now() - c.t < 120000) return c.list;
      } catch (e) { /* ignore */ }
    }
    const list = await call("camps");
    try { sessionStorage.setItem(CAMPS, JSON.stringify({ t: Date.now(), list })); } catch (e) { /* ignore */ }
    return list;
  }

  /* ---------- formatting ---------- */
  const D = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parse = iso => { const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const day = s => { if (!s) return ""; const d = parse(s); return `${D[d.getDay()]} ${d.getDate()} ${M[d.getMonth()]}`; };
  const dayYear = s => { if (!s) return ""; const d = parse(s); return `${day(s)} ${d.getFullYear()}`; };
  const range = (a, b) => {
    const s = parse(a), e = parse(b || a);
    if (+s === +e) return dayYear(a);
    if (s.getFullYear() !== e.getFullYear()) return `${s.getDate()} ${M[s.getMonth()]} ${s.getFullYear()} – ${e.getDate()} ${M[e.getMonth()]} ${e.getFullYear()}`;
    if (s.getMonth() === e.getMonth()) return `${s.getDate()}–${e.getDate()} ${M[e.getMonth()]} ${e.getFullYear()}`;
    return `${s.getDate()} ${M[s.getMonth()]} – ${e.getDate()} ${M[e.getMonth()]} ${e.getFullYear()}`;
  };
  const dueText = s => (s && iso(parse(s)) === iso(today()) ? "today" : day(s));
  const money = n => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: Number(n) % 1 ? 2 : 0 })}`;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const placesText = c => (c.places_left === null || c.places_left === undefined ? "" : c.full ? "Full · waitlist open" : c.places_left === 1 ? "1 place left" : `${c.places_left} places left`);

  window.BTSBook = {
    mode,
    cfg: CFG,
    call,
    camps,
    BookingError,
    get token() { return store.get(TOKEN); },
    get email() { return store.get(EMAIL); },
    get signedIn() { return !!store.get(TOKEN); },
    async requestCode(email) { store.set(EMAIL, email.trim().toLowerCase()); return call("requestCode", { email }); },
    async verifyCode(email, code) {
      const r = await call("verifyCode", { email, code });
      store.set(TOKEN, r.token); store.set(EMAIL, r.email);
      return r;
    },
    async signOut() {
      try { await call("signOut"); } catch (e) { /* signing out locally is enough */ }
      // Forget the email too, so the next person on a shared device doesn't see it prefilled.
      store.set(TOKEN, ""); store.set(EMAIL, "");
    },
    fmt: { parse, iso, today, day, dayYear, range, dueText, money, esc, placesText },
  };
})();
