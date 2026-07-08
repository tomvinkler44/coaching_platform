/* 5Careers — Admin panel (demo build)
   Hash router + localStorage store, mirroring portal.js conventions.
   Practice mode: sample data only. `BACKEND` wire points live in code
   comments, never in user-facing copy. */

(function () {
  "use strict";

  var KEY = "fc_admin_v1";

  var SEED = {
    coaches: [
      { id: 1, name: "Marcus Ellington", av: 0, move: "Consulting → AI Transformation", status: "live", complete: 80, bookings: 14, conv: "44%", featured: true },
      { id: 2, name: "Aisha Rahman", av: 1, move: "Corporate Law → AI Governance", status: "live", complete: 100, bookings: 11, conv: "38%", featured: true },
      { id: 3, name: "David Okafor", av: 2, move: "Print Media → UX Design", status: "live", complete: 90, bookings: 7, conv: "31%", featured: false },
      { id: 4, name: "Lena Hofmann", av: 3, move: "Marketing → AI-Powered Marketing", status: "live", complete: 95, bookings: 9, conv: "41%", featured: false },
      { id: 5, name: "Raj Patel", av: 4, move: "Engineering → Renewable Energy", status: "live", complete: 70, bookings: 5, conv: "27%", featured: false },
      { id: 6, name: "Sofia Marchetti", av: 5, move: "Teaching → Learning Design", status: "live", complete: 85, bookings: 8, conv: "35%", featured: false },
      { id: 7, name: "James Whitfield", av: 6, move: "Banking → Sustainability / ESG", status: "paused", complete: 60, bookings: 0, conv: "—", featured: false },
      { id: 8, name: "Priya Nair", av: 7, move: "Operations → Data & Analytics", status: "live", complete: 100, bookings: 12, conv: "39%", featured: false }
    ],
    applications: [
      { id: 1, name: "Helena Brandt", av: 3, move: "HR Director → People & AI Transformation", note: "ICF PCC. 14 yrs in HR, guided ~30 transitions in-house. Applied 2 days ago.",
        checks: { credential: true, references: false, interview: false }, status: "open" },
      { id: 2, name: "Victor Okonkwo", av: 2, move: "Software Engineering → AI Product Coaching", note: "No ICF credential — 9 yrs engineering management, strong outcomes doc. Applied 4 days ago.",
        checks: { credential: false, references: false, interview: false }, status: "open" },
      { id: 3, name: "Marta Silva", av: 5, move: "Nursing → Health-tech & Care Coordination", note: "ICF ACC. 11 yrs clinical, pivoted herself in 2024. Applied 1 week ago.",
        checks: { credential: true, references: true, interview: false }, status: "open" }
    ],
    flags: [
      { id: 1, coach: "Raj Patel", client: "Tom B.", when: "Today 09:41", status: "open",
        text: "This is easier off the app — just Venmo me directly and we'll do the rest over WhatsApp.", match: ["Venmo", "WhatsApp"] },
      { id: 2, coach: "David Okafor", client: "Anna B.", when: "Yesterday 17:20", status: "open",
        text: "Here's my personal email: david.o@gmail.com — send the portfolio there.", match: ["david.o@gmail.com"] }
    ],
    rematches: [
      { id: 1, client: "Sara Lindqvist", coach: "Raj Patel", type: "rematch", when: "Today", status: "open",
        reason: "“Great person, but he specializes in climate moves and I've decided on L&D. Want someone closer to my direction.”" },
      { id: 2, client: "Ben Otieno", coach: "James Whitfield", type: "refund", when: "2 days ago", status: "open",
        reason: "“The first paid session didn't feel like a fit and the coach has since paused his practice.”" }
    ],
    circles: [
      { id: 1, name: "Circle #3 — Validating → Data & AI", day: "Tuesdays 18:00 GMT", mod: 8, members: 6, cap: 6, waitlist: 4 },
      { id: 2, name: "Circle #4 — Exploring → AI-era roles", day: "Wednesdays 18:00 GMT", mod: 1, members: 5, cap: 6, waitlist: 2 },
      { id: 3, name: "Circle #5 — Actively applying", day: "Thursdays 19:00 GMT", mod: 4, members: 4, cap: 6, waitlist: 7 }
    ],
    revenue: {
      months: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      gmv: [6100, 7500, 5200, 9300, 11100, 10000, 12700, 14000]
    },
    settings: { split: 25, guaranteeDays: 7, manualApprove: true, autoFilter: true }
  };

  var S;
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { S = null; } if (!S) S = JSON.parse(JSON.stringify(SEED)); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  load();

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function money(n) { return "$" + Number(Math.round(n)).toLocaleString("en-US"); }
  function av(n) { return "assets/coaches/coach-" + ((n % 8) + 1) + ".svg"; }
  function coachById(id) { return S.coaches.find(function (c) { return c.id === id; }); }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3000);
  }

  function tile(label, num, delta, up) {
    return '<div class="stat"><span class="s-label">' + esc(label) + '</span><div class="s-num">' + esc(num) + '</div><div class="s-delta' + (up ? " up" : "") + '">' + esc(delta) + "</div></div>";
  }

  var VIEWS = {};

  /* ------------------------------------------------------------ overview */
  VIEWS.overview = {
    title: "Overview",
    sub: "The whole platform at a glance: what needs a decision from you, and how the marketplace is doing.",
    html: function () {
      var apps = S.applications.filter(function (a) { return a.status === "open"; }).length;
      var flags = S.flags.filter(function (f) { return f.status === "open"; }).length;
      var rem = S.rematches.filter(function (r) { return r.status === "open"; }).length;
      var live = S.coaches.filter(function (c) { return c.status === "live"; }).length;
      var gmv = S.revenue.gmv[S.revenue.gmv.length - 1];
      var attention = [];
      if (apps) attention.push('<div class="brow"><div class="b-who"><strong>' + apps + ' coach application' + (apps > 1 ? "s" : "") + ' waiting for review</strong><span>Vet credentials and references before they go live</span></div><a class="btn btn-primary btn-sm" href="#/applications">Review</a></div>');
      if (flags) attention.push('<div class="brow"><div class="b-who"><strong>' + flags + ' flagged message' + (flags > 1 ? "s" : "") + '</strong><span>Possible attempts to take clients off-platform</span></div><a class="btn btn-primary btn-sm" href="#/flags">Review</a></div>');
      if (rem) attention.push('<div class="brow"><div class="b-who"><strong>' + rem + ' rematch / refund request' + (rem > 1 ? "s" : "") + '</strong><span>Right-Fit Guarantee — respond within ' + S.settings.guaranteeDays + ' days</span></div><a class="btn btn-primary btn-sm" href="#/rematches">Handle</a></div>');
      return '<div class="pgrid cols-4">' +
        tile("Live coaches", live, S.coaches.length - live + " paused") +
        tile("Bookings this month", "66", "+12% vs May", true) +
        tile("Client payments (June)", money(gmv), "all coaches combined", true) +
        tile("5Careers share (25%)", money(gmv * S.settings.split / 100), "before costs") +
        "</div>" +
        '<div class="pgrid cols-2" style="margin-top:1rem">' +
        '<div class="pcard"><div class="pcard-head"><h2>Needs a decision from you</h2></div>' +
        (attention.length ? attention.join("") : '<p class="pmuted">All clear — nothing waiting.</p>') + "</div>" +
        '<div class="pcard"><div class="pcard-head"><h2>Marketplace health</h2></div>' +
        '<div class="brow"><div class="b-who"><strong>Roster completeness</strong><span>Average profile completeness across live coaches</span></div><strong>' +
        Math.round(S.coaches.filter(function (c) { return c.status === "live"; }).reduce(function (a, c) { return a + c.complete; }, 0) / live) + "%</strong></div>" +
        '<div class="brow"><div class="b-who"><strong>Circles</strong><span>' + S.circles.length + " running · " + S.circles.reduce(function (a, c) { return a + c.waitlist; }, 0) + ' people on waitlists</span></div><a class="linkbtn" href="#/circles">Manage</a></div>' +
        '<div class="brow"><div class="b-who"><strong>Featured coaches</strong><span>Shown first on the public site</span></div><a class="linkbtn" href="#/coaches">' + S.coaches.filter(function (c) { return c.featured; }).length + " featured</a></div>" +
        "</div></div>";
    }
  };

  /* ------------------------------------------------------------ applications */
  VIEWS.applications = {
    title: "Coach applications",
    sub: "New coaches can’t go live until you’ve verified their credentials, checked references, and done the interview. Approve adds them to the public roster.",
    html: function () {
      var open = S.applications.filter(function (a) { return a.status === "open"; });
      var closed = S.applications.filter(function (a) { return a.status !== "open"; });
      var CHECKS = { credential: "Credential verified (e.g. ICF) — or waived with a written reason", references: "Two references from people they coached through a transition", interview: "Vetting interview done" };
      function card(a) {
        var allDone = a.checks.credential && a.checks.references && a.checks.interview;
        return '<div class="app-card" data-app="' + a.id + '">' +
          '<div class="app-head"><img src="' + av(a.av) + '" width="46" height="46" alt="" />' +
          '<span class="a-name"><strong>' + esc(a.name) + "</strong><span>Wants to coach: " + esc(a.move) + "</span></span>" +
          (a.status === "open" ? '<span class="pill warn">Waiting on you</span>' : a.status === "approved" ? '<span class="pill ok">Approved · live</span>' : '<span class="pill flag">Not approved</span>') +
          "</div>" +
          '<p class="pmuted" style="margin-top:.7rem">' + esc(a.note) + "</p>" +
          (a.status === "open"
            ? '<ul class="vet-list">' + Object.keys(CHECKS).map(function (k) {
                return '<li><input type="checkbox" id="chk' + a.id + k + '" data-check="' + k + '" data-app="' + a.id + '"' + (a.checks[k] ? " checked" : "") + ' /><label for="chk' + a.id + k + '">' + CHECKS[k] + "</label></li>";
              }).join("") + "</ul>" +
              '<div class="app-actions">' +
              '<button class="btn btn-primary btn-sm" data-approve="' + a.id + '"' + (allDone ? "" : " disabled title=\"Complete all three checks first\"") + ">Approve &amp; put live</button>" +
              '<button class="btn btn-ghost btn-sm" data-reject="' + a.id + '">Turn down</button>' +
              (allDone ? "" : '<span class="app-note">Approve unlocks when all three checks are ticked.</span>') +
              "</div>"
            : "") +
          "</div>";
      }
      return (open.length ? open.map(card).join("") : '<div class="pcard"><div class="pempty">No applications waiting. New ones land here from the “Apply to join” form on the public site.</div></div>') +
        (closed.length ? '<h2 style="font-family:var(--display);font-size:1.1rem;margin:1.4rem 0 .7rem">Decided</h2>' + closed.map(card).join("") : "");
    },
    bind: function (root) {
      $all("[data-check]", root).forEach(function (cb) {
        cb.addEventListener("change", function () {
          var a = S.applications.find(function (x) { return x.id === +cb.getAttribute("data-app"); });
          if (a) { a.checks[cb.getAttribute("data-check")] = cb.checked; save(); render(); }
        });
      });
      $all("[data-approve]", root).forEach(function (b) {
        b.addEventListener("click", function () {
          var a = S.applications.find(function (x) { return x.id === +b.getAttribute("data-approve"); });
          if (!a) return;
          if (!window.confirm("Approve " + a.name + " and put her/him live on the public roster?\n\nThey’ll be emailed a welcome and their profile becomes bookable.")) return;
          a.status = "approved";
          S.coaches.push({ id: Date.now(), name: a.name, av: a.av, move: a.move, status: "live", complete: 40, bookings: 0, conv: "—", featured: false });
          save(); toast(a.name + " approved and added to the roster. (Practice — no real email.)"); render();
        });
      });
      $all("[data-reject]", root).forEach(function (b) {
        b.addEventListener("click", function () {
          var a = S.applications.find(function (x) { return x.id === +b.getAttribute("data-reject"); });
          if (!a) return;
          if (!window.confirm("Turn down " + a.name + "’s application?\n\nThey’ll be emailed a polite no with the option to reapply in 6 months.")) return;
          a.status = "rejected"; save(); toast(a.name + "’s application turned down. (Practice — no real email.)"); render();
        });
      });
    }
  };

  /* ------------------------------------------------------------ flags */
  VIEWS.flags = {
    title: "Message flags",
    sub: "Messages the filter caught that look like attempts to move clients off-platform. Decide: harmless, a warning, or suspend.",
    html: function () {
      var open = S.flags.filter(function (f) { return f.status === "open"; });
      var closed = S.flags.filter(function (f) { return f.status !== "open"; });
      function card(f) {
        var text = esc(f.text);
        f.match.forEach(function (m) { text = text.split(esc(m)).join("<mark>" + esc(m) + "</mark>"); });
        return '<div class="pcard" style="margin-bottom:1rem">' +
          '<div class="pcard-head"><h2>' + esc(f.coach) + " → " + esc(f.client) + "</h2>" +
          (f.status === "open" ? '<span class="pill warn">Waiting on you</span>' : f.status === "dismissed" ? '<span class="pill">Marked harmless</span>' : f.status === "warned" ? '<span class="pill warn">Warning sent</span>' : '<span class="pill flag">Coach suspended</span>') + "</div>" +
          '<div class="flag-msg">' + text + "</div>" +
          '<p class="flag-meta">Blocked before sending · ' + esc(f.when) + "</p>" +
          (f.status === "open"
            ? '<div class="app-actions">' +
              '<button class="btn btn-ghost btn-sm" data-dismiss="' + f.id + '">Harmless — dismiss</button>' +
              '<button class="btn btn-ghost btn-sm" data-warn="' + f.id + '">Send a warning</button>' +
              '<button class="btn btn-primary btn-sm" data-suspend="' + f.id + '">Suspend coach</button>' +
              "</div>"
            : "") +
          "</div>";
      }
      return (open.length ? open.map(card).join("") : '<div class="pcard"><div class="pempty">No open flags. The filter blocks contact details and payment handles in chat, and anything it catches lands here.</div></div>') +
        (closed.length ? '<h2 style="font-family:var(--display);font-size:1.1rem;margin:1.4rem 0 .7rem">Decided</h2>' + closed.map(card).join("") : "");
    },
    bind: function (root) {
      function act(attr, fn) {
        $all("[" + attr + "]", root).forEach(function (b) {
          b.addEventListener("click", function () {
            var f = S.flags.find(function (x) { return x.id === +b.getAttribute(attr); });
            if (f) fn(f);
          });
        });
      }
      act("data-dismiss", function (f) { f.status = "dismissed"; save(); toast("Marked harmless — no action taken."); render(); });
      act("data-warn", function (f) {
        if (!window.confirm("Send " + f.coach + " a formal warning?\n\nThey’ll be emailed the platform policy: taking clients off-platform means removal. The warning is logged on their record.")) return;
        f.status = "warned"; save(); toast("Warning sent to " + f.coach + " and logged. (Practice — no real email.)"); render();
      });
      act("data-suspend", function (f) {
        if (!window.confirm("Suspend " + f.coach + "?\n\nTheir profile is hidden from the public site immediately, upcoming sessions are paused, and they’re emailed the reason. You can reinstate them from the Coaches page.")) return;
        f.status = "suspended";
        var c = S.coaches.find(function (x) { return x.name === f.coach; });
        if (c) c.status = "paused";
        save(); toast(f.coach + " suspended and hidden from the site. (Practice — no real email.)"); render();
      });
    }
  };

  /* ------------------------------------------------------------ rematches */
  VIEWS.rematches = {
    title: "Rematch & refunds",
    sub: "Right-Fit Guarantee requests: a client’s first paid session wasn’t the fit they hoped. Rematch them with another coach, or refund the session.",
    html: function () {
      var open = S.rematches.filter(function (r) { return r.status === "open"; });
      var closed = S.rematches.filter(function (r) { return r.status !== "open"; });
      function card(r) {
        return '<div class="pcard" style="margin-bottom:1rem">' +
          '<div class="pcard-head"><h2>' + esc(r.client) + ' <span class="pmuted" style="font-weight:400;font-size:.9rem">was with ' + esc(r.coach) + "</span></h2>" +
          (r.status === "open" ? '<span class="pill warn">Waiting on you · asked ' + esc(r.when) + "</span>" : r.status === "rematched" ? '<span class="pill ok">Rematched</span>' : '<span class="pill ok">Refunded</span>') + "</div>" +
          '<p class="pmuted" style="margin-top:.5rem">' + esc(r.reason) + "</p>" +
          (r.status === "open"
            ? '<div class="app-actions">' +
              '<button class="btn btn-primary btn-sm" data-rematch="' + r.id + '">Rematch with another coach</button>' +
              '<button class="btn btn-ghost btn-sm" data-refund="' + r.id + '">Refund the session</button>' +
              "</div>"
            : "") +
          "</div>";
      }
      return (open.length ? open.map(card).join("") : '<div class="pcard"><div class="pempty">No open requests. Clients can ask for a rematch or refund within ' + S.settings.guaranteeDays + ' days of their first paid session.</div></div>') +
        (closed.length ? '<h2 style="font-family:var(--display);font-size:1.1rem;margin:1.4rem 0 .7rem">Decided</h2>' + closed.map(card).join("") : "");
    },
    bind: function (root) {
      $all("[data-rematch]", root).forEach(function (b) {
        b.addEventListener("click", function () {
          var r = S.rematches.find(function (x) { return x.id === +b.getAttribute("data-rematch"); });
          if (!r) return;
          if (!window.confirm("Rematch " + r.client + "?\n\nThey’ll be emailed a shortlist of 3 coaches that fit their direction, with a free intro call for each. " + r.coach + " is notified kindly.")) return;
          r.status = "rematched"; save(); toast(r.client + " sent a fresh shortlist. (Practice — no real email.)"); render();
        });
      });
      $all("[data-refund]", root).forEach(function (b) {
        b.addEventListener("click", function () {
          var r = S.rematches.find(function (x) { return x.id === +b.getAttribute("data-refund"); });
          if (!r) return;
          if (!window.confirm("Refund " + r.client + "’s session?\n\nThe session amount goes back to their card in 5–10 days. The coach’s share is deducted from their next payout.")) return;
          r.status = "refunded"; save(); toast(r.client + " refunded. (Practice — no real money moved.)"); render();
        });
      });
    }
  };

  /* ------------------------------------------------------------ coaches */
  VIEWS.coaches = {
    title: "Coaches",
    sub: "Everyone on the roster. Pause hides a coach from the public site; Feature shows them first. Stars and status change the live site immediately.",
    html: function () {
      return '<div class="pcard"><table class="ptable"><thead><tr><th>Coach</th><th>Guides moves like</th><th>Status</th><th>Profile</th><th>Bookings (June)</th><th>Call → client</th><th>Featured</th><th></th></tr></thead><tbody>' +
        S.coaches.map(function (c) {
          return "<tr>" +
            '<td><span class="coach-cell"><img src="' + av(c.av) + '" width="34" height="34" alt="" /><span><strong>' + esc(c.name) + "</strong></span></span></td>" +
            '<td class="pmuted">' + esc(c.move) + "</td>" +
            "<td>" + (c.status === "live" ? '<span class="pill ok">Live</span>' : '<span class="pill flag">Paused · hidden</span>') + "</td>" +
            '<td><span class="mini-meter"><span style="width:' + c.complete + '%"></span></span> <span class="pmuted" style="font-size:.78rem">' + c.complete + "%</span></td>" +
            "<td>" + c.bookings + "</td><td>" + esc(c.conv) + "</td>" +
            '<td><button class="feature-star' + (c.featured ? " on" : "") + '" data-feature="' + c.id + '" aria-pressed="' + c.featured + '" aria-label="Feature ' + esc(c.name) + '">★</button></td>' +
            '<td><span class="rowbtns">' +
            (c.status === "live" ? '<button class="linkbtn" data-pause="' + c.id + '">Pause</button>' : '<button class="linkbtn" data-resume="' + c.id + '">Put live</button>') +
            "</span></td></tr>";
        }).join("") + "</tbody></table>" +
        '<p class="pmini" style="margin-top:.8rem">New coaches join this list when you approve their <a href="#/applications">application</a>. Low profile completeness? They see the same number with a to-do list in their own portal.</p></div>';
    },
    bind: function (root) {
      $all("[data-feature]", root).forEach(function (b) {
        b.addEventListener("click", function () {
          var c = coachById(+b.getAttribute("data-feature")); if (!c) return;
          c.featured = !c.featured; save();
          toast(c.name + (c.featured ? " is now featured — shown first on the public site" : " is no longer featured")); render();
        });
      });
      $all("[data-pause]", root).forEach(function (b) {
        b.addEventListener("click", function () {
          var c = coachById(+b.getAttribute("data-pause")); if (!c) return;
          if (!window.confirm("Pause " + c.name + "?\n\nTheir profile is hidden from the public site and they can’t receive new bookings. Existing clients keep their sessions. The coach is emailed.")) return;
          c.status = "paused"; save(); toast(c.name + " paused and hidden from the site. (Practice — no real email.)"); render();
        });
      });
      $all("[data-resume]", root).forEach(function (b) {
        b.addEventListener("click", function () {
          var c = coachById(+b.getAttribute("data-resume")); if (!c) return;
          if (!window.confirm("Put " + c.name + " live again?\n\nTheir profile reappears on the public site and they can receive bookings.")) return;
          c.status = "live"; save(); toast(c.name + " is live again."); render();
        });
      });
    }
  };

  /* ------------------------------------------------------------ circles */
  VIEWS.circles = {
    title: "Circles",
    sub: "The weekly small groups. Keep them at 4–6 members, one coach each. Waitlists tell you when to open the next one.",
    html: function () {
      var mods = S.coaches.filter(function (c) { return c.status === "live"; });
      return '<div class="pgrid cols-3">' + S.circles.map(function (ci) {
        var mod = coachById(ci.mod);
        return '<div class="circle-card"><h3>' + esc(ci.name) + "</h3>" +
          '<p class="cap-note">' + esc(ci.day) + "</p>" +
          '<div class="brow"><div class="b-who"><strong>' + ci.members + " / " + ci.cap + ' members</strong><span>' + (ci.waitlist ? ci.waitlist + " waiting to join" : "no waitlist") + "</span></div>" +
          (ci.members >= ci.cap ? '<span class="pill warn">Full</span>' : '<span class="pill ok">Open</span>') + "</div>" +
          '<div class="brow"><div class="b-who"><strong>Run by</strong><span>' + (mod ? esc(mod.name) : "—") + "</span></div></div>" +
          "</div>";
      }).join("") + "</div>" +
        '<form class="pcard pform" id="circleForm" style="margin-top:1rem"><h2>Open a new Circle</h2>' +
        '<p class="pmuted" style="margin-top:.3rem">13 people are on waitlists — enough for two new Circles.</p>' +
        '<div class="frow"><div><label class="flabel" for="ciName">Name</label><input id="ciName" placeholder="e.g. Circle #6 — Exploring → Sustainability" required /></div>' +
        '<div><label class="flabel" for="ciDay">Day &amp; time</label><input id="ciDay" placeholder="e.g. Mondays 18:00 GMT" required /></div></div>' +
        '<div class="frow"><div><label class="flabel" for="ciMod">Run by</label><select id="ciMod">' +
        mods.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + "</option>"; }).join("") + "</select></div>" +
        '<div><label class="flabel" for="ciCap">Max members</label><input id="ciCap" type="number" min="4" max="8" value="6" /></div></div>' +
        '<div style="text-align:right"><button class="btn btn-primary" type="submit">Open Circle &amp; invite from waitlist</button></div></form>';
    },
    bind: function (root) {
      $("#circleForm", root).addEventListener("submit", function (e) {
        e.preventDefault();
        var name = $("#ciName", root).value.trim(); if (!name) return;
        S.circles.push({ id: Date.now(), name: name, day: $("#ciDay", root).value.trim() || "TBC", mod: +$("#ciMod", root).value, members: 0, cap: +$("#ciCap", root).value || 6, waitlist: 0 });
        save(); toast("Circle opened — waitlisted members get an invitation. (Practice — no real email.)"); render();
      });
    }
  };

  /* ------------------------------------------------------------ revenue */
  VIEWS.revenue = {
    title: "Revenue",
    sub: "What clients paid across all coaches, and the 25% share that runs the platform. Coach payouts go out automatically every two weeks.",
    html: function () {
      var e = S.revenue, split = S.settings.split / 100;
      var vals = e.gmv.map(function (v) { return v * split; });
      var maxV = Math.max.apply(null, vals);
      var W = 560, H = 200, pad = { l: 8, r: 8, t: 24, b: 22 };
      var iw = (W - pad.l - pad.r) / vals.length;
      var barW = Math.min(34, iw - 10);
      var bars = vals.map(function (v, i) {
        var h = Math.max(4, (v / maxV) * (H - pad.t - pad.b));
        var x = pad.l + i * iw + (iw - barW) / 2;
        var y = H - pad.b - h, r = 4;
        var d = "M" + x + " " + (H - pad.b) + " V" + (y + r) + " Q" + x + " " + y + " " + (x + r) + " " + y +
          " H" + (x + barW - r) + " Q" + (x + barW) + " " + y + " " + (x + barW) + " " + (y + r) + " V" + (H - pad.b) + " Z";
        var label = i === vals.length - 1 ? '<text class="dlabel" x="' + (x + barW / 2) + '" y="' + (y - 7) + '" text-anchor="middle">' + money(v) + "</text>" : "";
        return '<path class="bar" d="' + d + '" fill="#d97746" data-i="' + i + '"></path>' + label +
          '<text x="' + (x + barW / 2) + '" y="' + (H - 7) + '" text-anchor="middle">' + e.months[i] + "</text>";
      }).join("");
      var grid = [0.25, 0.5, 0.75].map(function (f) {
        var y = H - pad.b - f * (H - pad.t - pad.b);
        return '<line class="grid" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y + '" y2="' + y + '"></line>';
      }).join("");
      var gmvNow = e.gmv[e.gmv.length - 1];
      return '<div class="pgrid cols-3">' +
        tile("Client payments (June)", money(gmvNow), "all coaches combined", true) +
        tile("5Careers share (June)", money(gmvNow * split), S.settings.split + "% of every booking") +
        tile("Paid to coaches (June)", money(gmvNow * (1 - split)), "sent automatically, twice a month") +
        "</div>" +
        '<div class="pcard" style="margin-top:1rem"><div class="pcard-head"><h2>Platform share, month by month</h2></div>' +
        '<div class="chart-wrap"><svg class="chart-svg" viewBox="0 0 ' + W + " " + H + '" width="100%" role="img" aria-label="Bar chart of monthly platform revenue">' + grid + bars + "</svg>" +
        '<div class="chart-tip" id="chartTip" hidden></div></div>' +
        '<details open style="margin-top:.6rem"><summary class="linkbtn" style="font-size:.82rem">Month by month, as a list</summary><table class="ptable" style="margin-top:.6rem"><thead><tr><th>Month</th><th>Client payments</th><th>5Careers share</th></tr></thead><tbody>' +
        e.months.map(function (m, i) { return "<tr><td>" + m + "</td><td>" + money(e.gmv[i]) + "</td><td>" + money(vals[i]) + "</td></tr>"; }).join("") + "</tbody></table></details></div>";
    },
    bind: function (root) {
      var tip = $("#chartTip", root), e = S.revenue, split = S.settings.split / 100;
      $all(".bar", root).forEach(function (bar) {
        bar.addEventListener("mousemove", function (ev) {
          var i = +bar.getAttribute("data-i");
          var wrap = bar.closest(".chart-wrap").getBoundingClientRect();
          tip.textContent = e.months[i] + " · " + money(e.gmv[i] * split) + " (of " + money(e.gmv[i]) + ")";
          tip.style.left = (ev.clientX - wrap.left) + "px";
          tip.style.top = (ev.clientY - wrap.top) + "px";
          tip.hidden = false;
        });
        bar.addEventListener("mouseleave", function () { tip.hidden = true; });
      });
    }
  };

  /* ------------------------------------------------------------ settings */
  VIEWS.settings = {
    title: "Platform settings",
    sub: "The rules the marketplace runs on. Changes apply to new bookings only — never retroactively.",
    html: function () {
      var s = S.settings;
      return '<div class="pgrid cols-2">' +
        '<form class="pcard pform" id="platForm"><h2>Money &amp; guarantee</h2>' +
        '<div class="frow"><div><label class="flabel" for="stSplit">5Careers share of each booking (%)</label><input id="stSplit" type="number" min="10" max="40" value="' + s.split + '" /><p class="fhint">Coaches keep the rest. Industry range is 25–40%.</p></div>' +
        '<div><label class="flabel" for="stDays">Right-Fit Guarantee window (days)</label><input id="stDays" type="number" min="3" max="30" value="' + s.guaranteeDays + '" /><p class="fhint">How long after a first paid session a client can ask for a rematch or refund.</p></div></div>' +
        '<div style="text-align:right"><button class="btn btn-primary btn-sm" type="submit">Save</button></div></form>' +
        '<div class="pcard"><h2>Safety &amp; quality</h2>' +
        '<div class="brow"><div class="b-who"><strong>Manual approval for new coaches</strong><span>No coach goes live without the three vetting checks</span></div><input type="checkbox" data-tgl="manualApprove"' + (s.manualApprove ? " checked" : "") + ' aria-label="Manual approval" /></div>' +
        '<div class="brow"><div class="b-who"><strong>Message filter</strong><span>Block contact details and payment handles in chat, and flag them here</span></div><input type="checkbox" data-tgl="autoFilter"' + (s.autoFilter ? " checked" : "") + ' aria-label="Message filter" /></div>' +
        '<p class="pmini" style="margin-top:.8rem">Flags land in <a href="#/flags">Message flags</a>. Switching the filter off is not recommended — it’s what keeps sessions (and your revenue) on the platform.</p></div></div>';
    },
    bind: function (root) {
      $("#platForm", root).addEventListener("submit", function (e) {
        e.preventDefault();
        var sp = Math.min(40, Math.max(10, +$("#stSplit", root).value || 25));
        var gd = Math.min(30, Math.max(3, +$("#stDays", root).value || 7));
        if (sp !== S.settings.split && !window.confirm("Change the platform share to " + sp + "%?\n\nApplies to new bookings only. All coaches are emailed 30 days before it takes effect.")) return;
        S.settings.split = sp; S.settings.guaranteeDays = gd; save();
        toast("Saved — share " + sp + "%, guarantee window " + gd + " days."); render();
      });
      $all("[data-tgl]", root).forEach(function (cb) {
        cb.addEventListener("change", function () {
          var k = cb.getAttribute("data-tgl");
          if (k === "autoFilter" && !cb.checked && !window.confirm("Turn the message filter off?\n\nCoaches and clients will be able to swap contact details in chat, which usually means bookings move off-platform.")) { cb.checked = true; return; }
          S.settings[k] = cb.checked; save(); toast("Saved.");
        });
      });
    }
  };

  /* ------------------------------------------------------------ router */
  function route() {
    var r = (location.hash || "#/overview").replace(/^#\//, "");
    return VIEWS[r] ? r : "overview";
  }

  function render() {
    var r = route(), v = VIEWS[r];
    $("#viewTitle").textContent = v.title;
    var subEl = $("#viewSub"); if (subEl) subEl.textContent = v.sub || "";
    document.title = v.title + " — Admin — 5Careers";
    var root = $("#view");
    root.innerHTML = v.html();
    if (v.bind) v.bind(root);
    $all(".pnav a").forEach(function (a) {
      if (a.getAttribute("data-route") === r) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    var na = S.applications.filter(function (a) { return a.status === "open"; }).length;
    var nf = S.flags.filter(function (f) { return f.status === "open"; }).length;
    var nr = S.rematches.filter(function (x) { return x.status === "open"; }).length;
    var ba = $("#badgeApps"); if (ba) { ba.textContent = na; ba.hidden = !na; }
    var bf = $("#badgeFlags"); if (bf) { bf.textContent = nf; bf.hidden = !nf; }
    var br = $("#badgeRematch"); if (br) { br.textContent = nr; br.hidden = !nr; }
  }

  window.addEventListener("hashchange", function () { render(); $("#view").focus(); });

  var reset = $("#demoReset");
  if (reset) reset.addEventListener("click", function () {
    if (!window.confirm("Start the practice examples over?\n\nThis clears everything you’ve changed in the admin panel and restores the original examples.")) return;
    localStorage.removeItem(KEY); load(); render(); toast("Examples restored");
  });

  render();
})();
