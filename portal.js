/* 5Careers — Coach Portal (demo build)
   Single-file front-end app: hash router + localStorage store.
   Everything here is demo-mode: no backend, no real payments/emails.
   Wire points for the real build are marked with `BACKEND:`. */

(function () {
  "use strict";

  /* ------------------------------------------------------------ store */
  var KEY = "fc_portal_v1";

  var SEED = {
    profile: {
      name: "Marcus Ellington", headline: "ICF PCC · 18 yrs in strategy",
      location: "London · GMT", langs: "English",
      bio: "Eighteen years in strategy and management consulting before moving into AI enablement. Marcus helps senior operators reposition hard-won judgment for roles being reshaped by AI.",
      from: "corp", to: "ai", challenges: ["salary", "exit", "identity"],
      videoName: "", published: true
    },
    bookings: [
      { id: 1, when: "Thu 10:00", type: "chemistry", who: "Elena Voss", note: "Ops director, exploring AI adoption roles", status: "pending" },
      { id: 2, when: "Thu 15:30", type: "chemistry", who: "Tom Baker", note: "PM at a bank, wants out before the next re-org", status: "pending" },
      { id: 3, when: "Fri 09:00", type: "taster", who: "Priya Shah", note: "Pivot Strategy Audit (60 min) — $150", status: "confirmed" },
      { id: 4, when: "Fri 14:00", type: "session", who: "Daniel Kim", note: "Session 4 of 8 — positioning narrative", status: "confirmed" },
      { id: 5, when: "Mon 11:00", type: "session", who: "Sara Lindqvist", note: "Session 2 of 8 — target-role scoring", status: "confirmed" },
      { id: 6, when: "Last Tue", type: "chemistry", who: "Ben Otieno", note: "Became a client ✓", status: "past" }
    ],
    clients: [
      { id: 1, name: "Daniel Kim", stage: "Actively applying", plan: "8-session package · 4 done", av: 3,
        notes: "Strong consulting story. Next: quantify AI-adoption wins at current employer.",
        msgs: [
          { me: false, t: "Reworked my LinkedIn headline like we discussed — feels much sharper.", when: "Tue 09:12" },
          { me: true, t: "It reads really well. Bring two target JDs on Friday and we'll map your narrative against them.", when: "Tue 09:40" }
        ] },
      { id: 2, name: "Sara Lindqvist", stage: "Validating", plan: "8-session package · 1 done", av: 4,
        notes: "Testing L&D vs. AI-enablement directions. Runway: ~12 months.",
        msgs: [
          { me: false, t: "The informational interview went great — she said my ops background is exactly what they lack.", when: "Mon 17:05" },
          { me: true, t: "That's your evidence. Add it to the validation log and let's score both directions on Monday.", when: "Mon 18:22" }
        ] },
      { id: 3, name: "Ben Otieno", stage: "Exploring", plan: "Taster booked", av: 5,
        notes: "Finance ops, 15 yrs. Anxious about starting over — lead with repositioning frame.",
        msgs: [ { me: false, t: "Looking forward to the audit session. Should I prep anything?", when: "Wed 08:30" } ] }
    ],
    offers: {
      chemistry: { on: true },
      taster: { on: true, title: "Pivot Strategy Audit", mins: 60, price: 150 },
      packages: [
        { id: 1, on: true, name: "The 90-Day Pivot", sessions: 8, price: 1120, note: "$140/session, billed as a package" },
        { id: 2, on: true, name: "Single session", sessions: 1, price: 160, note: "Pay as you go" }
      ]
    },
    feed: [
      { t: "Reading an AI-era job description", p: "YouTube · 6 min" },
      { t: "Why your experience is leverage, not baggage", p: "LinkedIn · 4 min" }
    ],
    magnet: { title: "The Senior Pivot Playbook", desc: "A 12-page guide to repositioning 15+ years of experience for AI-era roles.", file: "senior-pivot-playbook.pdf" },
    leads: [
      { name: "Elena Voss", email: "elena.v@example.com", when: "Today", stage: "Exploring" },
      { name: "Marcus Reid", email: "m.reid@example.com", when: "Yesterday", stage: "Validating" },
      { name: "Anna Bailey", email: "anna.b@example.com", when: "2 days ago", stage: "Exploring" },
      { name: "Josh Tran", email: "josh.t@example.com", when: "4 days ago", stage: "Actively applying" }
    ],
    cases: [
      { id: 1, title: "Consulting director → Head of AI Enablement", before: "A consulting director watching the work commoditize as clients adopted AI.", pivot: "Repackaged change-management expertise around AI adoption programs.", after: "Joined a SaaS firm as Head of AI Enablement — a ~22% comp increase.", consent: true }
    ],
    circle: {
      name: "Circle #4 — Exploring → AI-era roles", day: "Wednesdays 18:00 GMT",
      prompt: "What's one assumption about your target role you can test with a 30-minute conversation this week?",
      members: [
        { name: "Elena V.", role: "Ops director", done: true, av: 4 },
        { name: "Tom B.", role: "Banking PM", done: true, av: 5 },
        { name: "Ana R.", role: "HR lead", done: false, av: 2 },
        { name: "Chris M.", role: "Retail manager", done: false, av: 7 },
        { name: "Dana W.", role: "Journalist", done: true, av: 6 }
      ]
    },
    earnings: {
      months: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      values: [1150, 1420, 980, 1760, 2100, 1890, 2400, 2650],
      balance: 830, nextPayout: "Fri, Jul 4",
      payouts: [
        { when: "Jun 20", amount: 1240, status: "Paid" },
        { when: "Jun 6", amount: 980, status: "Paid" },
        { when: "May 23", amount: 1105, status: "Paid" }
      ]
    },
    stats: { views: 148, viewsDelta: "+23% vs last month", plays: 62, chem: 9, conv: "44%" },
    settings: { emailBookings: true, emailLeads: true, emailCircle: false, calendar: false, stripe: false }
  };

  var S; /* live state */
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { S = null; } if (!S) S = JSON.parse(JSON.stringify(SEED)); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  load();

  /* ------------------------------------------------------------ helpers */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function money(n) { return "$" + Number(n).toLocaleString("en-US"); }
  function av(n) { return "assets/coaches/coach-" + ((n % 8) + 1) + ".svg"; }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  var CH = { ageBias: "40+ age bias", gap: "Returning after a gap", exit: "Executive exit / severance", salary: "Salary negotiation", runway: "Financial runway", nontech: "Breaking into tech", identity: "Identity & confidence" };
  var FROMS = { corp: "Corporate & management", lawfin: "Law & finance", creative: "Marketing, media & creative", eng: "Engineering & technical", edu: "Education & public sector" };
  var TOS = { ai: "Work with AI", data: "Data & analytics", marketing: "AI-era marketing", design: "Design & UX", sustainability: "Sustainability & climate", ld: "Learning & development" };

  /* completeness: the nudge that powers matching quality */
  function completeness() {
    var p = S.profile, score = 0, missing = [];
    function add(ok, label, pts) { if (ok) score += pts; else missing.push(label); }
    add(!!p.bio, "bio", 15); add(!!p.from && !!p.to, "From → To specialty", 20);
    add(p.challenges.length >= 2, "at least 2 roadblock tags", 15);
    add(!!p.videoName, "60-sec intro video", 20);
    add(S.cases.length > 0, "a case study", 15);
    add(!!S.magnet.title, "a lead magnet", 15);
    return { score: score, missing: missing };
  }

  /* anti-poaching filter (BACKEND: run server-side too; this is the UX demo) */
  var POACH = /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b|\+?\d[\d\s().-]{7,}\d|venmo|paypal|zelle|whatsapp|cash\s?app/i;

  /* ------------------------------------------------------------ views */
  var VIEWS = {};

  VIEWS.dashboard = {
    title: "Dashboard",
    html: function () {
      var c = completeness();
      var pending = S.bookings.filter(function (b) { return b.status === "pending"; });
      var upcoming = S.bookings.filter(function (b) { return b.status === "confirmed"; });
      return '' +
        '<div class="pgrid cols-4">' +
        tile("Profile views", S.stats.views, S.stats.viewsDelta, true) +
        tile("Intro video plays", S.stats.plays, "since posted") +
        tile("Chemistry calls", S.stats.chem, "this month") +
        tile("Call → client rate", S.stats.conv, "rolling 90 days") +
        "</div>" +

        '<div class="pgrid cols-2" style="margin-top:1rem">' +
        '<div class="pcard"><div class="pcard-head"><h2>Needs your attention</h2></div>' +
        (pending.length ? pending.map(function (b) { return brow(b, true); }).join("") : '<p class="pmuted">Nothing pending — nice.</p>') +
        (c.score < 100 ? '<div style="margin-top:1.1rem"><div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:.4rem"><strong>Profile completeness</strong><span>' + c.score + "%</span></div>" +
          '<div class="meter"><span style="width:' + c.score + '%"></span></div>' +
          '<p class="fhint" style="margin-top:.45rem">Missing: ' + esc(c.missing.join(", ")) + ". Complete profiles surface in more searches.</p></div>" : "") +
        "</div>" +
        '<div class="pcard"><div class="pcard-head"><h2>This week</h2><a class="linkbtn" href="#/bookings">All bookings</a></div>' +
        (upcoming.length ? upcoming.map(function (b) { return brow(b, false); }).join("") : '<p class="pmuted">No sessions booked.</p>') +
        "</div></div>" +

        '<div class="pgrid cols-2" style="margin-top:1rem">' +
        '<div class="pcard"><div class="pcard-head"><h2>New leads from your guide</h2><a class="linkbtn" href="#/leads">All leads</a></div>' +
        S.leads.slice(0, 3).map(function (l) {
          return '<div class="brow"><div class="b-who"><strong>' + esc(l.name) + "</strong><span>" + esc(l.email) + " · " + esc(l.stage) + '</span></div><span class="b-when">' + esc(l.when) + "</span></div>";
        }).join("") + "</div>" +
        '<div class="pcard"><div class="pcard-head"><h2>' + esc(S.circle.name) + '</h2><a class="linkbtn" href="#/circle">Open</a></div>' +
        '<p class="pmuted">' + S.circle.members.filter(function (m) { return m.done; }).length + " of " + S.circle.members.length + " members checked in · next session " + esc(S.circle.day) + "</p>" +
        '<p style="margin-top:.7rem;font-size:.9rem"><strong>This week’s prompt:</strong> ' + esc(S.circle.prompt) + "</p></div></div>";
    },
    bind: bindBookingActions
  };

  function tile(label, num, delta, up) {
    return '<div class="stat"><span class="s-label">' + esc(label) + '</span><div class="s-num">' + esc(num) + '</div><div class="s-delta' + (up ? " up" : "") + '">' + esc(delta) + "</div></div>";
  }

  function brow(b, actionable) {
    var typePill = b.type === "chemistry" ? '<span class="pill info">Chemistry · free 15m</span>'
      : b.type === "taster" ? '<span class="pill warn">Taster</span>' : '<span class="pill ok">Session</span>';
    return '<div class="brow" data-id="' + b.id + '">' +
      '<span class="b-when">' + esc(b.when) + "</span>" +
      '<div class="b-who"><strong>' + esc(b.who) + "</strong><span>" + esc(b.note) + "</span></div>" + typePill +
      (actionable ? '<div class="b-actions"><button class="btn btn-primary btn-sm" data-accept="' + b.id + '">Accept</button><button class="btn btn-ghost btn-sm" data-decline="' + b.id + '">Decline</button></div>' : "") +
      "</div>";
  }

  function bindBookingActions(root) {
    $all("[data-accept]", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var b = S.bookings.find(function (x) { return x.id === +btn.getAttribute("data-accept"); });
        if (b) { b.status = "confirmed"; save(); toast("Accepted — added to your schedule"); render(); }
      });
    });
    $all("[data-decline]", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var b = S.bookings.find(function (x) { return x.id === +btn.getAttribute("data-decline"); });
        if (b) { b.status = "declined"; save(); toast("Declined — the client will be notified"); render(); }
      });
    });
  }

  VIEWS.bookings = {
    title: "Bookings",
    html: function () {
      var tab = VIEWS.bookings.tab || "upcoming";
      var groups = {
        upcoming: S.bookings.filter(function (b) { return b.status === "confirmed"; }),
        pending: S.bookings.filter(function (b) { return b.status === "pending"; }),
        past: S.bookings.filter(function (b) { return b.status === "past" || b.status === "declined"; })
      };
      var list = groups[tab];
      return '<div class="ptabs">' + ["upcoming", "pending", "past"].map(function (t) {
        var n = groups[t].length;
        return '<button class="chip' + (t === tab ? " active" : "") + '" data-tab="' + t + '" aria-pressed="' + (t === tab) + '">' + t[0].toUpperCase() + t.slice(1) + (n ? " · " + n : "") + "</button>";
      }).join("") + "</div>" +
        '<div class="pcard">' + (list.length ? list.map(function (b) { return brow(b, b.status === "pending"); }).join("") : '<div class="pempty">Nothing here.</div>') + "</div>" +
        '<p class="pmini" style="margin-top:.8rem">BACKEND: syncs with the coach’s Google/Outlook calendar (Cal.com) so clients only ever see real availability.</p>';
    },
    bind: function (root) {
      $all("[data-tab]", root).forEach(function (b) {
        b.addEventListener("click", function () { VIEWS.bookings.tab = b.getAttribute("data-tab"); render(); });
      });
      bindBookingActions(root);
    }
  };

  VIEWS.clients = {
    title: "Clients & messages",
    html: function () {
      var sel = VIEWS.clients.sel || S.clients[0].id;
      var c = S.clients.find(function (x) { return x.id === sel; }) || S.clients[0];
      return '<div class="clients-grid">' +
        '<div class="pgrid">' + S.clients.map(function (x) {
          return '<button class="client-item" data-client="' + x.id + '" aria-current="' + (x.id === c.id) + '">' +
            '<img src="' + av(x.av) + '" width="36" height="36" alt="" /><span class="cm"><strong>' + esc(x.name) + "</strong><span>" + esc(x.stage) + " · " + esc(x.plan) + "</span></span></button>";
        }).join("") + "</div>" +

        '<div class="pcard"><div class="pcard-head"><h2>' + esc(c.name) + '</h2><span class="pill info">' + esc(c.stage) + "</span></div>" +
        '<label class="flabel" for="cNotes" style="font-size:.84rem;font-weight:600">Private notes</label>' +
        '<textarea id="cNotes" style="width:100%;font:inherit;padding:.7em .9em;border:1px solid var(--line);border-radius:10px;background:var(--paper);min-height:70px">' + esc(c.notes) + "</textarea>" +
        '<div style="text-align:right;margin-top:.5rem"><button class="btn btn-ghost btn-sm" id="saveNotes">Save notes</button></div>' +
        '<h2 style="margin-top:1.2rem">Messages</h2>' +
        '<div class="chat" id="chatLog">' + c.msgs.map(function (m) {
          return '<div class="msg' + (m.me ? " me" : "") + '">' + esc(m.t) + '<span class="m-when">' + esc(m.when) + "</span></div>";
        }).join("") + "</div>" +
        '<form class="chatbox" id="chatForm"><input type="text" id="chatInput" placeholder="Write a message…" aria-label="Message" style="font:inherit;padding:.7em .9em;border:1px solid var(--line);border-radius:10px;background:var(--paper)" /><button class="btn btn-primary btn-sm" type="submit">Send</button></form>' +
        '<p class="comms-flag" id="commsFlag" hidden></p>' +
        '<p class="pmini" style="margin-top:.7rem">Messages stay on-platform. Sharing emails, phone numbers or payment handles is blocked to keep everyone protected (and it’s how the platform stays free to browse).</p>' +
        "</div></div>";
    },
    bind: function (root) {
      $all("[data-client]", root).forEach(function (b) {
        b.addEventListener("click", function () { VIEWS.clients.sel = +b.getAttribute("data-client"); render(); });
      });
      var sel = VIEWS.clients.sel || S.clients[0].id;
      var c = S.clients.find(function (x) { return x.id === sel; }) || S.clients[0];
      var saveBtn = $("#saveNotes", root);
      if (saveBtn) saveBtn.addEventListener("click", function () { c.notes = $("#cNotes", root).value; save(); toast("Notes saved"); });
      var form = $("#chatForm", root);
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault();
        var inp = $("#chatInput", root), flag = $("#commsFlag", root);
        var txt = (inp.value || "").trim(); if (!txt) return;
        if (POACH.test(txt)) {
          flag.textContent = "⚠ This message looks like it contains contact or payment details, so it wasn’t sent. Keep the conversation on-platform — it protects you and the client.";
          flag.hidden = false; return;
        }
        flag.hidden = true;
        c.msgs.push({ me: true, t: txt, when: "Now" }); save(); render();
      });
    }
  };

  VIEWS.circle = {
    title: "My Circle",
    html: function () {
      var done = S.circle.members.filter(function (m) { return m.done; }).length;
      return '<div class="pgrid cols-2">' +
        '<div class="pcard"><div class="pcard-head"><h2>' + esc(S.circle.name) + '</h2><span class="pill ok">' + done + "/" + S.circle.members.length + ' checked in</span></div>' +
        '<p class="pmuted">Meets ' + esc(S.circle.day) + " · 45 min · wins, blockers, one commitment each</p>" +
        S.circle.members.map(function (m, i) {
          return '<div class="circle-member"><img src="' + av(m.av) + '" width="34" height="34" alt="" /><span class="cm-name"><strong>' + esc(m.name) + "</strong><span>" + esc(m.role) + "</span></span>" +
            (m.done ? '<span class="pill ok">Checked in</span>' : '<button class="btn btn-ghost btn-sm" data-nudge="' + i + '">Nudge</button>') + "</div>";
        }).join("") + "</div>" +
        '<div class="pcard"><h2>This week’s prompt</h2>' +
        '<p class="pmuted" style="margin-top:.3rem">Sent to the Circle before each session. Keep it one question, action-oriented.</p>' +
        '<textarea id="promptBox" style="width:100%;margin-top:.8rem;font:inherit;padding:.75em .9em;border:1px solid var(--line);border-radius:10px;background:var(--paper);min-height:90px">' + esc(S.circle.prompt) + "</textarea>" +
        '<div style="text-align:right;margin-top:.6rem"><button class="btn btn-primary btn-sm" id="savePrompt">Send to Circle</button></div>' +
        '<p class="pmini" style="margin-top:1rem">Facilitation guide: open with wins (10m) → blockers (20m) → one commitment each (10m) → close (5m). Your job is traffic control, not coaching everyone at once.</p>' +
        "</div></div>";
    },
    bind: function (root) {
      $all("[data-nudge]", root).forEach(function (b) {
        b.addEventListener("click", function () { toast("Nudge sent (demo)"); });
      });
      var sp = $("#savePrompt", root);
      if (sp) sp.addEventListener("click", function () { S.circle.prompt = $("#promptBox", root).value; save(); toast("Prompt sent to your Circle (demo)"); });
    }
  };

  VIEWS.profile = {
    title: "Public profile",
    html: function () {
      var p = S.profile, c = completeness();
      function opts(map, cur) { return Object.keys(map).map(function (k) { return '<option value="' + k + '"' + (k === cur ? " selected" : "") + ">" + esc(map[k]) + "</option>"; }).join(""); }
      return '<div class="pcard" style="margin-bottom:1rem"><div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.45rem"><strong>Profile completeness — ' + c.score + '%</strong><span class="pmuted">' + (c.missing.length ? "Missing: " + esc(c.missing.join(", ")) : "Complete ✓") + "</span></div>" +
        '<div class="meter"><span style="width:' + c.score + '%"></span></div>' +
        '<p class="fhint" style="margin-top:.5rem">Your From → To specialty and roadblock tags power the site’s search and matchmaker — the more honest and specific, the better your matches.</p></div>' +

        '<form class="pform pcard" id="profForm">' +
        '<div class="frow"><div><label class="flabel" for="pfName">Name</label><input id="pfName" value="' + esc(p.name) + '" /></div>' +
        '<div><label class="flabel" for="pfHead">Headline</label><input id="pfHead" value="' + esc(p.headline) + '" /></div></div>' +
        '<div class="frow"><div><label class="flabel" for="pfLoc">Location & timezone</label><input id="pfLoc" value="' + esc(p.location) + '" /></div>' +
        '<div><label class="flabel" for="pfLang">Languages</label><input id="pfLang" value="' + esc(p.langs) + '" /></div></div>' +
        '<div><label class="flabel" for="pfBio">Bio</label><textarea id="pfBio">' + esc(p.bio) + "</textarea></div>" +
        '<div class="frow"><div><label class="flabel" for="pfFrom">Clients coming from</label><select id="pfFrom">' + opts(FROMS, p.from) + "</select></div>" +
        '<div><label class="flabel" for="pfTo">Heading toward</label><select id="pfTo">' + opts(TOS, p.to) + "</select></div></div>" +
        '<div><span class="flabel">Roadblocks you specialize in</span><div class="chiprow" id="pfCh">' +
        Object.keys(CH).map(function (k) {
          var on = p.challenges.indexOf(k) !== -1;
          return '<button type="button" class="chip' + (on ? " active" : "") + '" data-ch="' + k + '" aria-pressed="' + on + '">' + esc(CH[k]) + "</button>";
        }).join("") + '</div><p class="fhint">Pick 2–4. These map to the "Biggest roadblock" filter clients use.</p></div>' +
        '<div style="display:flex;gap:.7rem;justify-content:flex-end"><button class="btn btn-primary" type="submit">Save profile</button></div>' +
        "</form>";
    },
    bind: function (root) {
      var p = S.profile;
      $all("#pfCh .chip", root).forEach(function (b) {
        b.addEventListener("click", function () {
          var k = b.getAttribute("data-ch"), i = p.challenges.indexOf(k);
          if (i === -1) p.challenges.push(k); else p.challenges.splice(i, 1);
          b.classList.toggle("active"); b.setAttribute("aria-pressed", b.classList.contains("active"));
        });
      });
      $("#profForm", root).addEventListener("submit", function (e) {
        e.preventDefault();
        p.name = $("#pfName", root).value; p.headline = $("#pfHead", root).value;
        p.location = $("#pfLoc", root).value; p.langs = $("#pfLang", root).value;
        p.bio = $("#pfBio", root).value; p.from = $("#pfFrom", root).value; p.to = $("#pfTo", root).value;
        save(); toast("Profile saved — changes go live after review"); render();
      });
    }
  };

  VIEWS.offers = {
    title: "Offers & pricing",
    html: function () {
      var o = S.offers;
      return '<div class="pgrid cols-2">' +
        '<div class="pcard"><div class="pcard-head"><h2>Chemistry call</h2><span class="pill ok">Always free · required</span></div>' +
        '<p class="pmuted">Every 5Careers coach offers a free 15-minute chemistry call. It’s the platform’s front door — and your best-converting asset.</p></div>' +

        '<div class="pcard"><div class="pcard-head"><h2>Taster session</h2><label style="font-size:.82rem;display:flex;gap:.4rem;align-items:center"><input type="checkbox" id="tOn"' + (o.taster.on ? " checked" : "") + " /> Active</label></div>" +
        '<div class="pform"><div><label class="flabel" for="tTitle">Title</label><input id="tTitle" value="' + esc(o.taster.title) + '" /></div>' +
        '<div class="frow"><div><label class="flabel" for="tMins">Length (min)</label><input id="tMins" type="number" min="30" step="15" value="' + o.taster.mins + '" /></div>' +
        '<div><label class="flabel" for="tPrice">Price (USD)</label><input id="tPrice" type="number" min="0" step="5" value="' + o.taster.price + '" /></div></div>' +
        '<p class="fhint">A single low-cost session lets a hesitant client experience your value before a package. Coaches with a taster convert ~2× more chemistry calls.</p>' +
        '<div style="text-align:right"><button class="btn btn-primary btn-sm" id="saveTaster">Save taster</button></div></div></div></div>' +

        '<div class="pcard" style="margin-top:1rem"><div class="pcard-head"><h2>Packages</h2></div><table class="ptable"><thead><tr><th>Name</th><th>Sessions</th><th>Price</th><th>Note</th><th>Active</th></tr></thead><tbody>' +
        o.packages.map(function (pk, i) {
          return "<tr><td><strong>" + esc(pk.name) + "</strong></td><td>" + pk.sessions + "</td><td>" + money(pk.price) + "</td><td class=\"pmuted\">" + esc(pk.note) + '</td><td><input type="checkbox" data-pkg="' + i + '"' + (pk.on ? " checked" : "") + " /></td></tr>";
        }).join("") + "</tbody></table>" +
        '<p class="pmini" style="margin-top:.8rem">Platform split: you keep 75%, 5Careers takes 25% for client acquisition, scheduling, video, payments and support. BACKEND: Stripe Connect handles the split automatically.</p></div>';
    },
    bind: function (root) {
      var o = S.offers;
      var st = $("#saveTaster", root);
      if (st) st.addEventListener("click", function () {
        o.taster.title = $("#tTitle", root).value;
        o.taster.mins = +$("#tMins", root).value || 60;
        o.taster.price = +$("#tPrice", root).value || 0;
        o.taster.on = $("#tOn", root).checked;
        save(); toast("Taster updated");
      });
      $all("[data-pkg]", root).forEach(function (cb) {
        cb.addEventListener("change", function () { o.packages[+cb.getAttribute("data-pkg")].on = cb.checked; save(); toast("Package updated"); });
      });
    }
  };

  VIEWS.content = {
    title: "Video & content",
    html: function () {
      var p = S.profile;
      return '<div class="pgrid cols-2">' +
        '<div class="pcard"><h2>60-second intro (“vibe check”)</h2>' +
        '<p class="pmuted" style="margin-top:.3rem">The first thing prospects see on your profile. Voice, energy, empathy — 60 seconds, no script-reading.</p>' +
        '<div style="margin-top:1rem;border:2px dashed var(--line);border-radius:12px;padding:1.6rem;text-align:center">' +
        (p.videoName ? '<p><strong>' + esc(p.videoName) + '</strong></p><p class="pill ok" style="margin-top:.5rem">Uploaded · in review</p>' : '<p class="pmuted">No video yet</p>') +
        '<div style="margin-top:.9rem"><label class="btn btn-ghost btn-sm" style="cursor:pointer">' + (p.videoName ? "Replace video" : "Upload video") + '<input type="file" id="vidFile" accept="video/*" hidden /></label></div></div>' +
        '<p class="pmini" style="margin-top:.8rem">Tips: natural light, look at the lens, answer “who do I help make what move, and how?” BACKEND: store + transcode (e.g. Mux), then it plays on your public profile.</p></div>' +

        '<div class="pcard"><h2>“See them in action” feed</h2>' +
        '<p class="pmuted" style="margin-top:.3rem">Link your best public content — it shows on your profile so prospects can watch you teach.</p>' +
        '<div style="margin-top:.9rem">' + S.feed.map(function (f, i) {
          return '<div class="brow"><div class="b-who"><strong>' + esc(f.t) + "</strong><span>" + esc(f.p) + '</span></div><button class="linkbtn" data-delfeed="' + i + '">Remove</button></div>';
        }).join("") + "</div>" +
        '<form class="pform" id="feedForm" style="margin-top:1rem"><div class="frow"><div><label class="flabel" for="fTitle">Title</label><input id="fTitle" placeholder="e.g. Reading an AI-era job description" /></div>' +
        '<div><label class="flabel" for="fMeta">Platform · length</label><input id="fMeta" placeholder="YouTube · 6 min" /></div></div>' +
        '<div style="text-align:right"><button class="btn btn-ghost btn-sm" type="submit">Add to feed</button></div></form></div></div>';
    },
    bind: function (root) {
      var vf = $("#vidFile", root);
      if (vf) vf.addEventListener("change", function () {
        if (vf.files && vf.files[0]) { S.profile.videoName = vf.files[0].name; save(); toast("Video uploaded (demo) — queued for review"); render(); }
      });
      $all("[data-delfeed]", root).forEach(function (b) {
        b.addEventListener("click", function () { S.feed.splice(+b.getAttribute("data-delfeed"), 1); save(); render(); });
      });
      $("#feedForm", root).addEventListener("submit", function (e) {
        e.preventDefault();
        var t = $("#fTitle", root).value.trim(), m = $("#fMeta", root).value.trim();
        if (!t) return;
        S.feed.push({ t: t, p: m || "Link" }); save(); toast("Added to your feed"); render();
      });
    }
  };

  VIEWS.leads = {
    title: "Lead magnet",
    html: function () {
      var m = S.magnet;
      return '<div class="pgrid cols-2">' +
        '<div class="pcard"><h2>Your free resource</h2>' +
        '<div class="pform" style="margin-top:.9rem"><div><label class="flabel" for="mgTitle">Title</label><input id="mgTitle" value="' + esc(m.title) + '" /></div>' +
        '<div><label class="flabel" for="mgDesc">One-line description</label><input id="mgDesc" value="' + esc(m.desc) + '" /></div>' +
        '<div><label class="flabel">File</label><p class="pmuted">' + esc(m.file) + ' · <label class="linkbtn" style="cursor:pointer">replace<input type="file" id="mgFile" accept=".pdf" hidden /></label></p></div>' +
        '<div style="text-align:right"><button class="btn btn-primary btn-sm" id="saveMagnet">Save</button></div></div>' +
        '<p class="pmini" style="margin-top:.8rem">How it works: a prospect downloads your guide from your profile → they get the value, you get the lead below, 5Careers gets credit for the introduction. BACKEND: deliver by email + sync to the coach’s newsletter tool.</p></div>' +

        '<div class="pcard"><div class="pcard-head"><h2>Leads (' + S.leads.length + ')</h2><button class="btn btn-ghost btn-sm" id="csvBtn">Export CSV</button></div>' +
        '<table class="ptable"><thead><tr><th>Name</th><th>Email</th><th>Stage</th><th>When</th></tr></thead><tbody>' +
        S.leads.map(function (l) { return "<tr><td><strong>" + esc(l.name) + "</strong></td><td>" + esc(l.email) + "</td><td>" + esc(l.stage) + '</td><td class="pmuted">' + esc(l.when) + "</td></tr>"; }).join("") +
        "</tbody></table></div></div>";
    },
    bind: function (root) {
      var sm = $("#saveMagnet", root);
      if (sm) sm.addEventListener("click", function () {
        S.magnet.title = $("#mgTitle", root).value; S.magnet.desc = $("#mgDesc", root).value; save(); toast("Lead magnet updated");
      });
      var mf = $("#mgFile", root);
      if (mf) mf.addEventListener("change", function () { if (mf.files && mf.files[0]) { S.magnet.file = mf.files[0].name; save(); render(); toast("File replaced (demo)"); } });
      $("#csvBtn", root).addEventListener("click", function () {
        var rows = [["Name", "Email", "Stage", "When"]].concat(S.leads.map(function (l) { return [l.name, l.email, l.stage, l.when]; }));
        var csv = rows.map(function (r) { return r.map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "5careers-leads.csv"; a.click(); URL.revokeObjectURL(a.href);
        toast("CSV downloaded");
      });
    }
  };

  VIEWS.cases = {
    title: "Case studies",
    html: function () {
      return '<div class="pcard" style="margin-bottom:1rem"><h2>Why structured case studies</h2>' +
        '<p class="pmuted" style="margin-top:.3rem">“John was great!” doesn’t convert a $1,000+ decision. A Before → Pivot → After story does. Client consent is required before anything is published.</p></div>' +
        '<div class="cs-list">' + S.cases.map(function (cs, i) {
          return '<div class="cs-item"><div class="pcard-head"><h3>' + esc(cs.title) + "</h3>" +
            (cs.consent ? '<span class="pill ok">Consented · live</span>' : '<span class="pill warn">Awaiting consent</span>') + "</div>" +
            '<div class="casestudy"><div class="cs-step"><span class="cs-tag">Before</span><p>' + esc(cs.before) + '</p></div><span class="cs-arrow">→</span>' +
            '<div class="cs-step"><span class="cs-tag">The pivot</span><p>' + esc(cs.pivot) + '</p></div><span class="cs-arrow">→</span>' +
            '<div class="cs-step cs-after"><span class="cs-tag">After</span><p>' + esc(cs.after) + "</p></div></div>" +
            '<div style="text-align:right;margin-top:.7rem"><button class="linkbtn" data-delcs="' + i + '">Delete</button></div></div>';
        }).join("") + "</div>" +

        '<form class="pcard pform" id="csForm"><h2>Add a case study</h2>' +
        '<div><label class="flabel" for="csTitle">Title (the move)</label><input id="csTitle" placeholder="e.g. Bank manager → ESG programme lead" required /></div>' +
        '<div><label class="flabel" for="csBefore">Before — where they were stuck</label><textarea id="csBefore" required></textarea></div>' +
        '<div><label class="flabel" for="csPivot">The pivot — what changed</label><textarea id="csPivot" required></textarea></div>' +
        '<div><label class="flabel" for="csAfter">After — the tangible outcome</label><textarea id="csAfter" placeholder="Role landed, and a number if you have one (comp change, timeline)" required></textarea></div>' +
        '<label style="display:flex;gap:.5rem;align-items:flex-start;font-size:.86rem"><input type="checkbox" id="csConsent" style="width:auto;margin-top:.2rem" /> I have this client’s written consent to publish their story (anonymized is fine).</label>' +
        '<div style="text-align:right"><button class="btn btn-primary" type="submit">Save case study</button></div></form>';
    },
    bind: function (root) {
      $all("[data-delcs]", root).forEach(function (b) {
        b.addEventListener("click", function () { S.cases.splice(+b.getAttribute("data-delcs"), 1); save(); render(); });
      });
      $("#csForm", root).addEventListener("submit", function (e) {
        e.preventDefault();
        S.cases.push({
          id: Date.now(), title: $("#csTitle", root).value, before: $("#csBefore", root).value,
          pivot: $("#csPivot", root).value, after: $("#csAfter", root).value, consent: $("#csConsent", root).checked
        });
        save(); toast($("#csConsent", root).checked ? "Saved — live on your profile" : "Saved as draft — needs client consent"); render();
      });
    }
  };

  VIEWS.earnings = {
    title: "Earnings",
    html: function () {
      var e = S.earnings;
      var maxV = Math.max.apply(null, e.values);
      var W = 560, H = 200, pad = { l: 8, r: 8, t: 24, b: 22 };
      var iw = (W - pad.l - pad.r) / e.values.length;
      var barW = Math.min(34, iw - 10);
      var bars = e.values.map(function (v, i) {
        var h = Math.max(4, (v / maxV) * (H - pad.t - pad.b));
        var x = pad.l + i * iw + (iw - barW) / 2;
        var y = H - pad.b - h;
        var r = 4;
        /* rounded top corners only, flat base anchored to the baseline */
        var d = "M" + x + " " + (H - pad.b) + " V" + (y + r) + " Q" + x + " " + y + " " + (x + r) + " " + y +
          " H" + (x + barW - r) + " Q" + (x + barW) + " " + y + " " + (x + barW) + " " + (y + r) + " V" + (H - pad.b) + " Z";
        var label = i === e.values.length - 1 ? '<text class="dlabel" x="' + (x + barW / 2) + '" y="' + (y - 7) + '" text-anchor="middle">' + money(v) + "</text>" : "";
        return '<path class="bar" d="' + d + '" fill="#d97746" data-i="' + i + '"></path>' + label +
          '<text x="' + (x + barW / 2) + '" y="' + (H - 7) + '" text-anchor="middle">' + e.months[i] + "</text>";
      }).join("");
      var grid = [0.25, 0.5, 0.75].map(function (f) {
        var y = H - pad.b - f * (H - pad.t - pad.b);
        return '<line class="grid" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y + '" y2="' + y + '"></line>';
      }).join("");
      return '<div class="pgrid cols-3">' +
        tile("Available balance", money(e.balance), "next payout " + e.nextPayout) +
        tile("This month", money(e.values[e.values.length - 1]), "+10% vs May", true) +
        tile("Your split", "75%", "5Careers takes 25%") +
        "</div>" +
        '<div class="pcard" style="margin-top:1rem"><div class="pcard-head"><h2>Monthly earnings — your share, after split</h2></div>' +
        '<div class="chart-wrap"><svg class="chart-svg" viewBox="0 0 ' + W + " " + H + '" width="100%" role="img" aria-label="Bar chart of monthly earnings, ' + e.months[0] + " to " + e.months[e.months.length - 1] + '">' + grid + bars + "</svg>" +
        '<div class="chart-tip" id="chartTip" hidden></div></div>' +
        '<details style="margin-top:.6rem"><summary class="linkbtn" style="font-size:.82rem">View as table</summary><table class="ptable" style="margin-top:.6rem"><thead><tr><th>Month</th><th>Earnings</th></tr></thead><tbody>' +
        e.months.map(function (m, i) { return "<tr><td>" + m + "</td><td>" + money(e.values[i]) + "</td></tr>"; }).join("") + "</tbody></table></details></div>" +
        '<div class="pcard" style="margin-top:1rem"><div class="pcard-head"><h2>Payouts</h2><span class="pmuted">BACKEND: Stripe Connect</span></div>' +
        '<table class="ptable"><thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>' +
        e.payouts.map(function (p) { return "<tr><td>" + esc(p.when) + "</td><td>" + money(p.amount) + '</td><td><span class="pill ok">' + esc(p.status) + "</span></td></tr>"; }).join("") +
        "</tbody></table></div>";
    },
    bind: function (root) {
      var tip = $("#chartTip", root), e = S.earnings;
      $all(".bar", root).forEach(function (bar) {
        bar.addEventListener("mousemove", function (ev) {
          var i = +bar.getAttribute("data-i");
          var wrap = bar.closest(".chart-wrap").getBoundingClientRect();
          tip.textContent = e.months[i] + " · " + money(e.values[i]);
          tip.style.left = (ev.clientX - wrap.left) + "px";
          tip.style.top = (ev.clientY - wrap.top) + "px";
          tip.hidden = false;
        });
        bar.addEventListener("mouseleave", function () { tip.hidden = true; });
      });
    }
  };

  VIEWS.settings = {
    title: "Settings",
    html: function () {
      var s = S.settings;
      function row(id, label, sub, on) {
        return '<div class="brow"><div class="b-who"><strong>' + label + "</strong><span>" + sub + '</span></div><input type="checkbox" data-set="' + id + '"' + (on ? " checked" : "") + " /></div>";
      }
      return '<div class="pgrid cols-2">' +
        '<div class="pcard"><h2>Notifications</h2>' +
        row("emailBookings", "Booking requests", "Email me when someone books a call", s.emailBookings) +
        row("emailLeads", "New leads", "Email me when someone downloads my guide", s.emailLeads) +
        row("emailCircle", "Circle check-ins", "Weekly summary of my Circle", s.emailCircle) +
        "</div>" +
        '<div class="pcard"><h2>Connections</h2>' +
        '<div class="brow"><div class="b-who"><strong>Calendar</strong><span>Google / Outlook — clients only see real availability</span></div>' +
        (s.calendar ? '<span class="pill ok">Connected</span>' : '<button class="btn btn-ghost btn-sm" data-connect="calendar">Connect</button>') + "</div>" +
        '<div class="brow"><div class="b-who"><strong>Payouts</strong><span>Stripe Connect — automatic 75/25 split</span></div>' +
        (s.stripe ? '<span class="pill ok">Connected</span>' : '<button class="btn btn-ghost btn-sm" data-connect="stripe">Connect</button>') + "</div>" +
        '<p class="pmini" style="margin-top:.8rem">BACKEND: real OAuth flows. In this demo, “Connect” just flips the state.</p></div></div>';
    },
    bind: function (root) {
      $all("[data-set]", root).forEach(function (cb) {
        cb.addEventListener("change", function () { S.settings[cb.getAttribute("data-set")] = cb.checked; save(); toast("Saved"); });
      });
      $all("[data-connect]", root).forEach(function (b) {
        b.addEventListener("click", function () { S.settings[b.getAttribute("data-connect")] = true; save(); toast("Connected (demo)"); render(); });
      });
    }
  };

  /* ------------------------------------------------------------ router */
  function route() {
    var r = (location.hash || "#/dashboard").replace(/^#\//, "");
    return VIEWS[r] ? r : "dashboard";
  }

  function render() {
    var r = route(), v = VIEWS[r];
    $("#viewTitle").textContent = v.title;
    document.title = v.title + " — Coach Portal — 5Careers";
    var root = $("#view");
    root.innerHTML = v.html();
    if (v.bind) v.bind(root);
    $all(".pnav a").forEach(function (a) {
      if (a.getAttribute("data-route") === r) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    /* badges */
    var pend = S.bookings.filter(function (b) { return b.status === "pending"; }).length;
    var bb = $("#badgeBookings"); if (bb) { bb.textContent = pend; bb.hidden = !pend; }
    var bl = $("#badgeLeads"); if (bl) { bl.textContent = S.leads.length; bl.hidden = !S.leads.length; }
  }

  window.addEventListener("hashchange", function () { render(); $("#view").focus(); });

  var reset = $("#demoReset");
  if (reset) reset.addEventListener("click", function () {
    localStorage.removeItem(KEY); load(); render(); toast("Demo data reset");
  });

  render();
})();
