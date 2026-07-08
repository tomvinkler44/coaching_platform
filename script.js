/* 5Careers — interaction layer
   - the throughline rail fills dusk→dawn with scroll progress
   - sections reveal on scroll; PIVOT nodes light up as they arrive
   - the hero thread draws itself on load
   - nav gains a border once you leave the top
   All motion respects prefers-reduced-motion. */

(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* current year in footer */
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* nav border on scroll */
  var nav = document.getElementById("nav");
  var railFill = document.getElementById("railFill");

  function onScroll() {
    var top = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("stuck", top > 8);

    if (railFill) {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - window.innerHeight) || 1;
      var pct = Math.min(1, Math.max(0, top / max));
      railFill.style.height = (pct * 100).toFixed(2) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* reveal-on-scroll + phase node activation */
  var revealEls = document.querySelectorAll(".reveal, .phase");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* direction chevrons, generated ON the thread path so they always sit on the
     curve and point along it — immune to container size and misalignment */
  (function threadChevrons() {
    var path = document.getElementById("heroPath");
    if (!path) return;
    var svg = path.ownerSVGElement;
    try {
      var len = path.getTotalLength();
      var NS = "http://www.w3.org/2000/svg";
      var colors = ["#6f8a98", "#93917e", "#c1934f", "#dc8b3f", "#d97746"];
      for (var k = 0; k < colors.length; k++) {
        var t = len * (0.16 + 0.62 * k / (colors.length - 1));
        var pt = path.getPointAtLength(t);
        var ahead = path.getPointAtLength(Math.min(len, t + 8));
        var ang = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI;
        var g = document.createElementNS(NS, "g");
        g.setAttribute("class", "thread-chev");
        g.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ") rotate(" + ang.toFixed(1) + ")");
        g.setAttribute("stroke", colors[k]);
        g.style.animationDelay = (k * 0.22) + "s";
        var c = document.createElementNS(NS, "path");
        c.setAttribute("d", "M-5 -6 L4 0 L-5 6");
        g.appendChild(c);
        svg.appendChild(g);
      }
    } catch (err) { /* path not rendered yet; decorative only */ }
  })();

  /* draw the hero thread on load */
  var heroPath = document.getElementById("heroPath");
  if (heroPath && !reduce) {
    try {
      var len = heroPath.getTotalLength();
      heroPath.style.strokeDasharray = len;
      heroPath.style.strokeDashoffset = len;
      heroPath.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.22,.61,.36,1)";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { heroPath.style.strokeDashoffset = "0"; });
      });
    } catch (err) { /* getTotalLength can throw if not yet rendered; harmless */ }
  }

  /* ---------------------------------------------------------------- coaches: data, profiles, filtering */
  (function coaches() {
    var grid = document.getElementById("coachGrid");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".coach"));
    var countEl = document.getElementById("coachCount");
    var emptyNote = document.getElementById("coachEmpty");
    var fromSel = document.getElementById("filterFrom");
    var toSel = document.getElementById("filterTo");
    var chWrap = document.getElementById("filterChallenges");
    var resetBtn = document.getElementById("filterReset");
    var total = cards.length;

    var CH = { ageBias: "40+ age bias", gap: "Returning after a gap", exit: "Executive exit / severance", salary: "Salary negotiation", runway: "Financial runway", nontech: "Breaking into tech", identity: "Identity & confidence" };

    // index-aligned with the cards in #coachGrid. Illustrative founding-roster data.
    var COACHES = [
      { name: "Marcus Ellington", cred: "ICF PCC · 18 yrs in strategy", loc: "London · GMT", img: "assets/coaches/coach-1.svg",
        from: "corp", to: "ai", fromLabel: "Management Consulting", toLabel: "AI Transformation", tags: ["Senior pivots", "AI adoption"], challenges: ["salary", "exit", "identity"],
        bio: "Eighteen years in strategy and management consulting before moving into AI enablement. Marcus helps senior operators reposition hard-won judgment for roles being reshaped by AI.",
        feed: [{ t: "Reading an AI-era job description", p: "YouTube · 6 min" }, { t: "Why your experience is leverage, not baggage", p: "LinkedIn · 4 min" }],
        freebie: "The Senior Pivot Playbook", taster: "Pivot Strategy Audit (60 min) — $150",
        cs: { before: "A consulting director watching the work commoditize as clients adopted AI.", pivot: "Repackaged change-management expertise around AI adoption programs.", after: "Joined a SaaS firm as Head of AI Enablement — a ~22% comp increase." } },
      { name: "Aisha Rahman", cred: "ICF PCC · 15 yrs in law", loc: "Toronto · ET", img: "assets/coaches/coach-2.svg",
        from: "lawfin", to: "ai", fromLabel: "Corporate Law", toLabel: "AI Governance & Compliance", tags: ["Law → Tech", "Women in leadership"], challenges: ["ageBias", "salary", "identity"],
        bio: "Fifteen years as in-house counsel before specializing in AI governance. Aisha helps lawyers and risk professionals turn legal judgment into the human layer over AI systems.",
        feed: [{ t: "Where lawyers fit in the age of legal AI", p: "YouTube · 8 min" }, { t: "Negotiating your first tech offer", p: "LinkedIn · 5 min" }],
        freebie: "Law → Tech Transition Guide", taster: "Career-Risk & Compliance Audit (60 min) — $140",
        cs: { before: "Fifteen years of in-house legal work, quietly fearing legal-AI tools.", pivot: "Reframed her judgment and risk fluency as AI governance.", after: "Became AI Governance Lead at a fintech scale-up." } },
      { name: "David Okafor", cred: "ICF ACC · 12 yrs in media", loc: "Manchester · GMT", img: "assets/coaches/coach-3.svg",
        from: "creative", to: "design", fromLabel: "Print Media", toLabel: "UX & Conversation Design", tags: ["Media → Tech", "Content design"], challenges: ["nontech", "runway", "identity"],
        bio: "A decade in newsrooms before moving into product. David helps writers and media professionals translate narrative craft into UX and conversation design.",
        feed: [{ t: "From bylines to user flows", p: "YouTube · 7 min" }, { t: "Build a UX portfolio with no UX job (yet)", p: "TikTok · 3 min" }],
        freebie: "From Bylines to UX: A Portfolio Starter", taster: "Portfolio & Story Audit (60 min) — $110",
        cs: { before: "A journalist facing another round of newsroom cuts.", pivot: "Translated narrative and interviewing skills into conversation design.", after: "Hired as a UX writer at an AI-assistant startup." } },
      { name: "Lena Hofmann", cred: "ICF PCC · 16 yrs in marketing", loc: "Berlin · CET", img: "assets/coaches/coach-4.svg",
        from: "creative", to: "marketing", fromLabel: "Marketing", toLabel: "AI-Powered Marketing", tags: ["Marketing pivots", "Workflow strategy"], challenges: ["identity", "salary", "nontech"],
        bio: "Sixteen years leading marketing teams before going all-in on AI-enabled growth. Lena helps marketers become the person who redesigns the workflow, not the one it replaces.",
        feed: [{ t: "The marketer's AI workflow teardown", p: "YouTube · 9 min" }, { t: "3 skills that make you AI-proof in marketing", p: "LinkedIn · 4 min" }],
        freebie: "The AI-Marketer's Skill Map", taster: "Positioning Audit (60 min) — $130",
        cs: { before: "A marketing manager watching tools automate her team's output.", pivot: "Became the team's AI workflow owner and upskilled in orchestration.", after: "Promoted to Head of AI-Enabled Growth." } },
      { name: "Raj Patel", cred: "ICF ACC · 20 yrs in engineering", loc: "Austin · CT", img: "assets/coaches/coach-5.svg",
        from: "eng", to: "sustainability", fromLabel: "Mechanical Engineering", toLabel: "Renewable Energy", tags: ["Engineering → Climate", "Project management"], challenges: ["runway", "nontech", "ageBias"],
        bio: "Twenty years in mechanical engineering and plant operations before moving into clean energy. Raj helps technical professionals map their skills onto climate and renewables projects.",
        feed: [{ t: "Your PM skills already fit renewables", p: "YouTube · 6 min" }, { t: "Breaking into climate without a 'green' CV", p: "LinkedIn · 5 min" }],
        freebie: "Engineer → Climate Career Map", taster: "Skills-Transfer Audit (60 min) — $120",
        cs: { before: "Twenty years in automotive, with his plant winding down.", pivot: "Mapped mechanical project skills onto grid and solar projects.", after: "Project Manager at a renewables developer." } },
      { name: "Sofia Marchetti", cred: "ICF PCC · 13 yrs in education", loc: "Milan · CET", img: "assets/coaches/coach-6.svg",
        from: "edu", to: "ld", fromLabel: "Teaching", toLabel: "Learning Experience Design", tags: ["Education → L&D", "Reskilling"], challenges: ["gap", "runway", "nontech"],
        bio: "Thirteen years in the classroom before moving into corporate learning. Sofia helps teachers turn pedagogy into L&D and learning-experience design portfolios.",
        feed: [{ t: "Teacher skills that companies pay for", p: "YouTube · 7 min" }, { t: "Your first L&D portfolio piece", p: "TikTok · 3 min" }],
        freebie: "Teacher → L&D Transition Kit", taster: "Pivot Strategy Audit (60 min) — $100",
        cs: { before: "A burned-out teacher with no corporate network.", pivot: "Built an L&D portfolio from classroom and curriculum craft.", after: "Learning Experience Designer at a health-tech firm." } },
      { name: "James Whitfield", cred: "ICF MCC · 22 yrs in finance", loc: "Edinburgh · GMT", img: "assets/coaches/coach-7.svg",
        from: "lawfin", to: "sustainability", fromLabel: "Retail Banking", toLabel: "Sustainability / ESG", tags: ["Finance → Impact", "Second-half careers"], challenges: ["ageBias", "exit", "runway"],
        bio: "Twenty-two years in retail banking before a second-act move into impact. James specializes in later-career pivots into sustainability and ESG.",
        feed: [{ t: "The second-act career, planned properly", p: "YouTube · 10 min" }, { t: "Turning a severance into a runway", p: "LinkedIn · 6 min" }],
        freebie: "The Second-Act Career Guide", taster: "Second-Act Strategy Audit (60 min) — $160",
        cs: { before: "A bank manager in his 50s, his role steadily automating.", pivot: "Reframed risk and stakeholder skills for ESG programs.", after: "Sustainability Programme Lead at a national retailer." } },
      { name: "Priya Nair", cred: "ICF PCC · 14 yrs in operations", loc: "Bengaluru · IST", img: "assets/coaches/coach-8.svg",
        from: "corp", to: "data", fromLabel: "Operations", toLabel: "Data & Analytics", tags: ["Ops → Data", "Career returners"], challenges: ["gap", "identity", "nontech"],
        bio: "Fourteen years in operations, including a return after a career break. Priya helps operators and returners move into data and analytics roles.",
        feed: [{ t: "Ops to analytics in 30 days", p: "YouTube · 8 min" }, { t: "Returning to work after a gap", p: "LinkedIn · 5 min" }],
        freebie: "Ops → Data 30-Day Starter", taster: "Skills-Transfer Audit (60 min) — $110",
        cs: { before: "An ops manager returning after a three-year career break.", pivot: "Upskilled in analytics and reframed her ops data work.", after: "Data & Insights Lead at a logistics company." } }
    ];

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

    function profileHTML(c) {
      var first = c.name.split(" ")[0];
      var tags = c.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("");
      var chTags = c.challenges.map(function (k) { return '<span class="tag tag-ch">' + esc(CH[k]) + "</span>"; }).join("");
      var feed = c.feed.map(function (f) {
        return '<a class="feed-item" href="#" onclick="return false;"><span class="feed-play">' + PLAY + "</span><span class=\"feed-meta\"><strong>" + esc(f.t) + "</strong><span>" + esc(f.p) + "</span></span></a>";
      }).join("");
      return ''
        + '<div class="profile">'
        + '<div class="profile-head">'
        + '<div class="profile-video"><img class="pv-thumb" src="' + c.img + '" alt="" /><span class="pv-play">' + PLAY + '</span><span class="pv-label">60-sec intro · coming soon</span></div>'
        + '<div class="profile-id">'
        + '<span class="eyebrow">Career-change coach</span>'
        + '<h3 class="mm-q" id="profileName">' + esc(c.name) + "</h3>"
        + '<p class="cred">' + esc(c.cred) + "</p>"
        + '<p class="profile-loc">' + esc(c.loc) + "</p>"
        + '<p class="pivot"><span class="plabel">Guides moves like</span>' + esc(c.fromLabel) + ' <span class="sep">→</span> <span class="to">' + esc(c.toLabel) + "</span></p>"
        + '<div class="tags">' + tags + chTags + "</div>"
        + "</div></div>"
        + '<p class="profile-bio">' + esc(c.bio) + "</p>"
        + '<div class="profile-ctas">'
        + '<a class="btn btn-primary" href="mailto:hello@5careers.com?subject=' + encodeURIComponent("Free 15-min chemistry call with " + c.name) + '">Book a free 15-min chemistry call <span class="arrow">→</span></a>'
        + '<a class="btn btn-ghost" href="mailto:hello@5careers.com?subject=' + encodeURIComponent("Taster session with " + c.name) + '">Or book the taster · ' + esc(c.taster) + "</a>"
        + "</div>"
        + '<div class="profile-block"><h4 class="profile-h">See them in action</h4><div class="feed">' + feed + '</div><p class="profile-mini">Sample content — real clips load here once the coach is live.</p></div>'
        + '<div class="profile-block"><h4 class="profile-h">A transformation they’ve guided</h4>'
        + '<div class="casestudy"><div class="cs-step"><span class="cs-tag">Before</span><p>' + esc(c.cs.before) + '</p></div><span class="cs-arrow" aria-hidden="true">→</span><div class="cs-step"><span class="cs-tag">The pivot</span><p>' + esc(c.cs.pivot) + '</p></div><span class="cs-arrow" aria-hidden="true">→</span><div class="cs-step cs-after"><span class="cs-tag">After</span><p>' + esc(c.cs.after) + "</p></div></div>"
        + '<p class="profile-mini">Illustrative example for the founding roster.</p></div>'
        + '<div class="profile-block freebie-block"><div class="freebie-copy"><h4 class="profile-h">Free resource</h4><p>“' + esc(c.freebie) + "” — a free guide from " + esc(first) + '.</p></div>'
        + '<form class="freebie-form" novalidate><input type="email" required placeholder="you@email.com" aria-label="Your email" /><button class="btn btn-primary" type="submit">Get the guide <span class="arrow">→</span></button></form>'
        + '<p class="freebie-done" hidden>✓ On its way — check your inbox. <span class="profile-mini">(Demo: connect an email tool to deliver it for real.)</span></p>'
        + "</div>"
        + "</div>";
    }

    var profileBody = document.getElementById("profileBody");
    function openProfile(i) {
      var c = COACHES[i]; if (!c || !profileBody) return;
      profileBody.innerHTML = profileHTML(c);
      var form = profileBody.querySelector(".freebie-form");
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault();
        var inp = form.querySelector("input");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((inp.value || "").trim())) { inp.focus(); return; }
        form.hidden = true;
        var done = profileBody.querySelector(".freebie-done");
        if (done) done.hidden = false;
      });
      openModal("coachProfile");
    }

    // enhance each card: video badge, "View profile", clickable
    cards.forEach(function (card, i) {
      var av = card.querySelector(".avatar");
      if (av && av.parentNode) {
        var w = document.createElement("span"); w.className = "avatar-wrap";
        av.parentNode.insertBefore(w, av); w.appendChild(av);
        w.insertAdjacentHTML("beforeend", '<span class="play-badge" aria-hidden="true">' + PLAY + "</span>");
      }
      var cta = card.querySelector(".coach-cta");
      if (cta) {
        cta.removeAttribute("href"); cta.setAttribute("role", "button"); cta.tabIndex = 0;
        cta.innerHTML = 'View profile <span class="arrow">→</span>';
        cta.addEventListener("click", function (e) { e.preventDefault(); openProfile(i); });
        cta.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProfile(i); } });
      }
      card.classList.add("coach--clickable");
      card.addEventListener("click", function (e) { if (e.target.closest("a,button")) return; openProfile(i); });
    });

    // filtering by from / to / roadblock
    var fromV = "all", toV = "all", chV = "all";
    function apply() {
      var shown = 0;
      cards.forEach(function (card, i) {
        var c = COACHES[i];
        var ok = (fromV === "all" || c.from === fromV) && (toV === "all" || c.to === toV) && (chV === "all" || c.challenges.indexOf(chV) !== -1);
        card.hidden = !ok; if (ok) shown++;
      });
      if (emptyNote) emptyNote.hidden = shown !== 0;
      if (countEl) countEl.textContent = (fromV === "all" && toV === "all" && chV === "all")
        ? "Showing all " + total + " coaches"
        : "Showing " + shown + " coach" + (shown === 1 ? "" : "es");
      if (resetBtn) resetBtn.hidden = (fromV === "all" && toV === "all" && chV === "all");
    }
    if (fromSel) fromSel.addEventListener("change", function () { fromV = fromSel.value; apply(); });
    if (toSel) toSel.addEventListener("change", function () { toV = toSel.value; apply(); });
    if (chWrap) chWrap.addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      chV = b.getAttribute("data-ch");
      chWrap.querySelectorAll(".chip").forEach(function (x) { var on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
      apply();
    });
    function resetAll() {
      fromV = toV = chV = "all";
      if (fromSel) fromSel.value = "all";
      if (toSel) toSel.value = "all";
      if (chWrap) chWrap.querySelectorAll(".chip").forEach(function (x) { var on = x.getAttribute("data-ch") === "all"; x.classList.toggle("active", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
      apply();
    }
    if (resetBtn) resetBtn.addEventListener("click", resetAll);
    document.querySelectorAll("[data-filter-reset]").forEach(function (el) { el.addEventListener("click", function (e) { e.preventDefault(); resetAll(); }); });

    // expose for the matchmaker
    window.__COACHES = COACHES;
    window.__coachCards = cards;
    window.__openProfile = openProfile;
  })();

  /* ---------------------------------------------------------------- hero rotation */
  (function heroRotation() {
    var visual = document.getElementById("heroVisual");
    var dotsWrap = document.getElementById("heroDots");
    if (!visual) return;
    var fromRole = document.getElementById("fromRole");
    var fromTag = document.getElementById("fromTag");
    var toRole = document.getElementById("toRole");
    var toTag = document.getElementById("toTag");

    var pairs = [
      { fr: "Operations Manager", ft: "“I can feel my role being hollowed out, one task at a time.”",
        tr: "AI Adoption Strategist", tt: "With a coach who knows the path you're on.", accent: "#d97746" },
      { fr: "Front-end Developer", ft: "“AI writes the boilerplate now — where does that leave me?”",
        tr: "AI Product Engineer", tt: "With a coach who's guided this exact move.", accent: "#4c9a6a" },
      { fr: "Marketing Manager", ft: "“Half my playbook got automated overnight.”",
        tr: "AI Content Strategist", tt: "With a coach who specializes in this pivot.", accent: "#5f7f97" }
    ];

    var i = 0, timer = null;

    function render(n) {
      var p = pairs[n];
      fromRole.textContent = p.fr; fromTag.textContent = p.ft;
      toRole.textContent = p.tr; toTag.textContent = p.tt;
      visual.style.setProperty("--pairAccent", p.accent);
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, idx) {
          d.classList.toggle("active", idx === n);
          d.setAttribute("aria-selected", idx === n ? "true" : "false");
        });
      }
    }

    function go(n) {
      i = (n + pairs.length) % pairs.length;
      if (reduce) { render(i); return; }
      visual.classList.add("swapping");
      setTimeout(function () { render(i); visual.classList.remove("swapping"); }, 460);
    }

    // build dots
    if (dotsWrap) {
      pairs.forEach(function (p, idx) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", p.fr + " to " + p.tr);
        b.addEventListener("click", function () { stop(); go(idx); });
        dotsWrap.appendChild(b);
      });
    }
    render(0);

    function start() { if (!reduce && !timer) timer = setInterval(function () { go(i + 1); }, 4200); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    visual.addEventListener("mouseenter", stop);
    visual.addEventListener("mouseleave", start);
    visual.addEventListener("focusin", stop);
    start();
  })();

  /* ---------------------------------------------------------------- mobile nav */
  (function mobileNav() {
    var toggle = document.getElementById("navToggle");
    if (!nav || !toggle) return;
    function setOpen(open) {
      nav.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("menu-open"));
    });
    // close when a link is tapped
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("menu-open")) setOpen(false);
    });
  })();

  /* ---------------------------------------------------------------- modals */
  var modalOpener = null;
  function focusables(root) {
    return Array.prototype.slice.call(root.querySelectorAll(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
    )).filter(function (el) { return el.offsetParent !== null; });
  }
  function openModal(id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    modalOpener = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("modal-open");
    if (id === "matchmaker" && window.__mmReset) window.__mmReset();
    var f = focusables(overlay);
    if (f.length) f[0].focus();
    overlay.__keyHandler = function (e) {
      if (e.key === "Escape") { closeModal(overlay); return; }
      if (e.key === "Tab") {
        var items = focusables(overlay);
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    overlay.addEventListener("keydown", overlay.__keyHandler);
  }
  function closeModal(overlay) {
    overlay.hidden = true;
    if (overlay.__keyHandler) overlay.removeEventListener("keydown", overlay.__keyHandler);
    if (!document.querySelector(".modal-overlay:not([hidden])")) document.body.classList.remove("modal-open");
    if (modalOpener && modalOpener.focus) modalOpener.focus();
  }
  document.querySelectorAll("[data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () { openModal(btn.getAttribute("data-open")); });
  });
  document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) closeModal(overlay); });
    overlay.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () { closeModal(overlay); });
    });
  });

  /* ---------------------------------------------------------------- matchmaker */
  (function matchmaker() {
    var modal = document.getElementById("matchmaker");
    if (!modal) return;
    var screens = Array.prototype.slice.call(modal.querySelectorAll(".mm-screen"));
    var progress = modal.querySelectorAll(".mm-progress span");
    var stepLabel = document.getElementById("mmStepLabel");
    var backBtn = document.getElementById("mmBack");
    var navBar = document.getElementById("mmNav");
    var result = document.getElementById("mmResult");
    var resultGrid = document.getElementById("mmResultGrid");
    var resultSub = document.getElementById("mmResultSub");
    var tip = document.getElementById("mmTip");
    var restart = document.getElementById("mmRestart");
    var coachNodes = Array.prototype.slice.call(document.querySelectorAll("#coachGrid .coach"));
    var answers = {}, step = 0;

    function showStep(n) {
      step = n;
      screens.forEach(function (s, i) { s.hidden = i !== n; });
      result.hidden = true; navBar.hidden = false;
      backBtn.hidden = n === 0;
      stepLabel.hidden = false;
      stepLabel.textContent = "Step " + (n + 1) + " of " + screens.length;
      progress.forEach(function (p, i) { p.classList.toggle("on", i <= n); });
      // reflect any prior selection
      screens[n].querySelectorAll(".mm-opt").forEach(function (o) {
        o.classList.toggle("sel", answers[o.getAttribute("data-q")] === o.getAttribute("data-val"));
      });
    }

    function reset() { answers = {}; modal.querySelectorAll(".mm-opt.sel").forEach(function (o) { o.classList.remove("sel"); }); showStep(0); }
    window.__mmReset = reset;

    modal.querySelectorAll(".mm-opt").forEach(function (opt) {
      opt.addEventListener("click", function () {
        var q = opt.getAttribute("data-q");
        answers[q] = opt.getAttribute("data-val");
        var sib = opt.closest(".mm-options").querySelectorAll(".mm-opt");
        sib.forEach(function (s) { s.classList.remove("sel"); });
        opt.classList.add("sel");
        setTimeout(function () {
          if (step < screens.length - 1) showStep(step + 1);
          else showResult();
        }, 180);
      });
    });

    backBtn.addEventListener("click", function () { if (step > 0) showStep(step - 1); });
    if (restart) restart.addEventListener("click", reset);

    function showResult() {
      screens.forEach(function (s) { s.hidden = true; });
      stepLabel.hidden = true; navBar.hidden = true;
      progress.forEach(function (p) { p.classList.add("on"); });
      var dest = answers.to || "all";
      var DATA = window.__COACHES || [];
      var nodes = window.__coachCards || coachNodes;
      var idx = [];
      DATA.forEach(function (c, i) { if (dest !== "all" && c.to === dest) idx.push(i); });
      for (var k = 0; k < DATA.length && idx.length < 3; k++) { if (idx.indexOf(k) === -1) idx.push(k); }
      idx = idx.slice(0, 3);
      resultGrid.innerHTML = "";
      idx.forEach(function (i) {
        var src = nodes[i]; if (!src) return;
        var clone = src.cloneNode(true);
        clone.classList.remove("reveal");
        var cta = clone.querySelector(".coach-cta");
        if (cta) {
          var name = (DATA[i] && DATA[i].name) || "a coach";
          var a = document.createElement("a");
          a.className = "coach-cta";
          a.href = "mailto:hello@5careers.com?subject=" + encodeURIComponent("Intro call with " + name);
          a.innerHTML = 'Book a free intro call <span class="arrow">→</span>';
          cta.parentNode.replaceChild(a, cta);
        }
        resultGrid.appendChild(clone);
      });
      resultSub.textContent = dest === "all"
        ? "You're still exploring — here are a few versatile coaches to start a conversation with. Browse everyone and choose anyone."
        : "Based on where you want to head, these could be a good first conversation. Suggestions only — you choose.";
      var tips = {
        exploring: "Just exploring? A free intro call is a low-stakes way to get clarity — and an Accountability Circle can help while you figure out the direction.",
        validating: "Validating a direction? Ask each coach how they'd help you test it with small, real-world experiments before you commit.",
        applying: "Ready to move? Tell coaches you're actively applying — they can prioritize positioning, interviews, and negotiation."
      };
      if (answers.stage && tips[answers.stage]) { tip.textContent = tips[answers.stage]; tip.hidden = false; }
      else tip.hidden = true;
      result.hidden = false;
    }

    reset();
  })();

  /* ---------------------------------------------------------------- waitlist form */
  (function waitlist() {
    var form = document.getElementById("wlForm");
    if (!form) return;
    var success = document.getElementById("wlSuccess");
    var emailEl = document.getElementById("wlEmail");
    var errEl = document.getElementById("wlError");
    var msg = document.getElementById("wlSuccessMsg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (emailEl.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!ok) { errEl.hidden = false; emailEl.focus(); return; }
      errEl.hidden = true;
      // NOTE: front-end only. Wire this to a real endpoint (Formspree/API) to actually store sign-ups.
      var stage = document.getElementById("wlStage").value;
      var stageMsg = {
        exploring: "We'll email you when an exploring-stage Circle is forming.",
        validating: "We'll email you when a Circle of people validating their next move opens.",
        applying: "We'll email you when an actively-applying Circle has a spot."
      };
      if (msg && stageMsg[stage]) msg.textContent = stageMsg[stage] + " Talk soon.";
      form.hidden = true;
      success.hidden = false;
      var h = success.querySelector("h3"); if (h) h.setAttribute("tabindex", "-1"), h.focus();
    });
  })();

  /* smooth-scroll for same-page anchors, accounting for the sticky nav */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      var navH = nav ? nav.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });
})();
