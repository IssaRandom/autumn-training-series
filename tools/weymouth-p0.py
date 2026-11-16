"""Weymouth venue guide, P0 fixes (WEYMOUTH-DESIGN-PLAN.md section 4, 16 Nov 2026).

Exact-string patches, so they can wait until another session has finished with the same files.
Each patch must match exactly once (or already be applied); otherwise nothing is written.

  python tools/weymouth-p0.py --check          # dry run against the real files
  python tools/weymouth-p0.py                  # apply to the real files
  python tools/weymouth-p0.py --html A --css B --js C   # apply to copies (preview)
"""
import argparse
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / "autumn-training-series" / "venues"

HTML = [
    # 1. Hero lede is our draft -> yellow marker, draft kept in a comment for James
    ("hero lede",
     """        <!-- [PLACEHOLDER] lede: rewrite from James/Kai voice note -->
        <p class="g-lede draft">The venue guide we wanted when we started sailing here: what each wind direction really does in the harbour and the bay, how to set up the boat for it, and everything parents need for the weekend.</p>""",
     """        <!-- EDIT LATER: James's own lede. Our draft (not used): "The venue guide we wanted when we started sailing here: what each wind
             direction really does in the harbour and the bay, how to set up the boat for it, and everything parents need for the weekend." -->
        <p class="g-lede"><span class="wip">We’re still working on this</span></p>"""),

    # 2. Takeaways: ours -> James & Kai's three lines from the notes
    ("takeaways",
     """        <!-- KEY TAKEAWAYS [PLACEHOLDER] -->
        <div class="takeaways">
          <p class="takeaways-title">The short version</p>
          <ul>
            <li>Same wind direction, different answer: the harbour and the bay sail like two venues.</li>
            <li>In a north-easterly in the bay, the top left has paid more often than not.</li>
            <li>In a south-westerly the swell decides your technique, tack by tack.</li>
            <li>Arrive the night before: registration and the slipway get busy early.</li>
          </ul>
        </div>""",
     """        <!-- KEY TAKEAWAYS: James & Kai's three lines (WEYMOUTH-NOTES.md, "What we add that nobody else publishes", 16 Nov).
             Our earlier draft lines were removed in P0 (16 Nov). -->
        <div class="takeaways">
          <p class="takeaways-title">What we add that nobody else publishes</p>
          <ul>
            <li>The nuance of the swell (how it wraps round the Bill and the harbour wall).</li>
            <li>Exact position of the left-hand bend in the harbour.</li>
            <li>Persistent-shift blocks in the harbour northerly.</li>
          </ul>
        </div>"""),

    # 3. "At a glance" paragraph is ours
    ("at a glance para",
     """          <p class="draft"><!-- [DRAFT, ours] -->WPNSA sits on Osprey Quay inside Portland Harbour. Most ILCA events race either inside the harbour walls (flat water, bendy breeze) or out in Weymouth Bay (more swell, steadier pressure). Knowing which one you’re in changes almost everything.</p>""",
     """          <!-- EDIT LATER: intro in James's words. Our draft (not used): "WPNSA sits on Osprey Quay inside Portland Harbour. Most ILCA events race
               either inside the harbour walls (flat water, bendy breeze) or out in Weymouth Bay (more swell, steadier pressure). Knowing which one
               you’re in changes almost everything." -->
          <p><span class="wip">We’re still working on this</span></p>"""),

    # 4. Stat tiles: tide range and most common breeze are ours, unchecked
    ("stat tide",
     """<div class="stat"><span class="stat-num">~2 m</span><span class="stat-label">Spring tide range <span class="verify">check</span></span></div>""",
     """<div class="stat"><!-- EDIT LATER: spring tide range from the tide tables (our guess was ~2 m) --><span class="stat-num"><span class="wip">To add</span></span><span class="stat-label">Spring tide range</span></div>"""),
    ("stat breeze",
     """<div class="stat"><span class="stat-num">SW</span><span class="stat-label">Most common breeze</span></div>""",
     """<div class="stat"><!-- EDIT LATER: most common breeze from the wind stats (our guess was SW) --><span class="stat-num"><span class="wip">To add</span></span><span class="stat-label">Most common breeze</span></div>"""),

    # 5. Dangling map reference: there are no pins yet (P2 builds them)
    ("pin 3",
     """too high. See pin 3 on the map.</p>""",
     """too high. <!-- EDIT LATER: the map pins arrive in P2; show this again then --><span class="todo">See pin 3 on the map.</span></p>"""),

    # 6. Bay W technique table: not in the 16 Nov notes
    ("bay table source",
     """                <p class="wind-watch"><b>Watch for</b> the swell angle changing as you get closer to Portland.</p>""",
     """                <p class="todo">Where is this table from? It isn’t in the 16 Nov notes (shuffle back about 3 inches, etc.).</p>
                <p class="wind-watch"><b>Watch for</b> the swell angle changing as you get closer to Portland.</p>"""),

    # 7. Harbour tide line is ours
    ("tide weak",
     """          <p class="draft"><!-- [PLACEHOLDER, ours] -->Inside the harbour the tide is weak.</p>""",
     """          <p class="todo">Inside the harbour: what does the tide do? (Our guess was “the tide is weak”.)</p>"""),

    # 8. Changing card is invented
    ("changing card",
     """            <div class="mini-card draft"><h3>Changing</h3><p><!-- [PLACEHOLDER] -->Changing rooms and showers in the main building. Hot water runs out after racing.</p></div>""",
     """            <!-- EDIT LATER: anything worth saying about changing rooms and showers? Our draft (not used): "Changing rooms and showers in the main
                 building. Hot water runs out after racing." -->
            <div class="mini-card todo"><h3>Changing</h3><p>Changing rooms and showers: anything worth saying?</p></div>"""),

    # 9. Parents' timeline: left to the other session (it was editing these lines with James's answers, 16 Nov)

    # 10. Checklist lines 1 and 3 are ours; line 2 is James's
    ("checklist 1",
     """            <li>Folding chair, flask and a proper coat: the quay is “bracing”.</li>""",
     """            <li class="todo">Folding chair, flask and a proper coat: the quay is “bracing”. (Ours: keep?)</li>"""),
    ("checklist 3",
     """            <li>Spare kit and a towel for the drive home.</li>""",
     """            <li class="todo">Spare kit and a towel for the drive home. (Ours: keep?)</li>"""),

    # 11. Ending: booking goes to the new booking system
    ("ending booking",
     """<p class="soft-cta">We train at WPNSA through the winter. <a href="/coaching/">See our coaching</a>""",
     """<p class="soft-cta">We train at WPNSA through the winter. <a href="../../book/">See our coaching</a>"""),

    # 12. Beats rhythm_check should count
    ("beat plan walk", """<div class="pw" data-plan-walk>""", """<div class="pw" data-plan-walk data-beat="map">"""),
    ("beat recs", """<div class="recs" data-recs>""", """<div class="recs" data-recs data-beat="map">"""),
    ("beat calc", """<form class="calc" data-calc onsubmit="return false">""", """<form class="calc" data-calc data-beat="calc" onsubmit="return false">"""),
]

# patches whose target text may already have been removed by James's answers in another session
OPTIONAL = {"tide weak", "changing card", "pw gap desktop", "takeaways", "at a glance para", "stat tide", "checklist 1", "checklist 3"}  # pw gap desktop: other session set its own tighter gap (16vh), keep theirs

CSS = [
    # Plan walk: only slide up with the nav while the plan is actually stuck (it slid over the heading on desktop)
    ("pw stuck desktop",
     """.venue-page.nav-hid .pw-on .pw-stage { transform: translateY(calc(-1 * var(--nav-h) + 8px)); }""",
     """.venue-page.nav-hid .pw-on .pw-stage.is-stuck { transform: translateY(calc(-1 * var(--nav-h) + 8px)); }"""),
    ("pw stuck phone",
     """  .venue-page.nav-hid .pw-on .pw-stage { transform: translateY(calc(-1 * var(--nav-h))); }""",
     """  .venue-page.nav-hid .pw-on .pw-stage.is-stuck { transform: translateY(calc(-1 * var(--nav-h))); }"""),
    # Plan walk: tighter steps (James: no big gaps)
    ("pw gap phone",
     """.pw-on .pw-steps { gap: 26vh; padding-bottom: 16vh; }""",
     """.pw-on .pw-steps { gap: 12vh; padding-bottom: 10vh; }"""),
    ("pw gap desktop",
     """  .pw-on .pw-steps { gap: 36vh; padding: 14vh 0 22vh; }""",
     """  .pw-on .pw-steps { gap: 18vh; padding: 8vh 0 14vh; }"""),
]

JS = [
    ("pw is-stuck",
     """    steps.forEach(s => s.addEventListener("click", () => focus(s.dataset.focus)));
  }""",
     """    steps.forEach(s => s.addEventListener("click", () => focus(s.dataset.focus)));
    /* stuck = the walk has scrolled past the pin line and the plan hasn't reached its end yet; only then does it slide up with the nav */
    const stage = $(".pw-stage", walk);
    const stuck = () => {
      const r = walk.getBoundingClientRect(), t = parseFloat(getComputedStyle(stage).top) || 0;
      stage.classList.toggle("is-stuck", r.top < t && r.bottom > t + stage.offsetHeight + 1);
    };
    window.addEventListener("scroll", stuck, { passive: true });
    window.addEventListener("resize", stuck);
    stuck();
  }"""),
]


def patch(path, patches, check):
    text = path.read_bytes().decode("utf-8")  # keep the file's own line endings
    out, problems = text, []
    crlf = "\r\n" in text
    for name, old, new in patches:
        if crlf:  # venues.css / venues.js are CRLF, index.html is LF
            old, new = old.replace("\n", "\r\n"), new.replace("\n", "\r\n")
        n_old, n_new = out.count(old), out.count(new)
        if n_old == 1:
            out = out.replace(old, new)
        elif n_old == 0 and n_new >= 1:
            print(f"  = {name}: already applied")
        elif n_old == 0 and name in OPTIONAL:
            print(f"  - {name}: gone already (handled elsewhere), skipped")
        else:
            problems.append(f"{name}: found {n_old} times")
    if problems:
        print(f"FAIL {path}:")
        for p in problems:
            print("  x", p)
        return False
    if out != text and not check:
        path.write_bytes(out.encode("utf-8"))
    print(f"ok   {path} ({'would change' if check else 'changed'}: {out != text})")
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", default=ROOT / "weymouth" / "index.html", type=pathlib.Path)
    ap.add_argument("--css", default=ROOT / "venues.css", type=pathlib.Path)
    ap.add_argument("--js", default=ROOT / "venues.js", type=pathlib.Path)
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    # dry-run everything first so a half-applied state is impossible
    ok = all(patch(p, ps, True) for p, ps in ((a.html, HTML), (a.css, CSS), (a.js, JS)))
    if not ok:
        sys.exit(1)
    if not a.check:
        for p, ps in ((a.html, HTML), (a.css, CSS), (a.js, JS)):
            patch(p, ps, False)


if __name__ == "__main__":
    main()
