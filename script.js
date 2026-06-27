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

  /* coach roster filtering */
  var filters = document.getElementById("coachFilters");
  var grid = document.getElementById("coachGrid");
  var emptyNote = document.getElementById("coachEmpty");
  if (filters && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".coach"));
    var chips = Array.prototype.slice.call(filters.querySelectorAll(".chip"));

    var countEl = document.getElementById("coachCount");
    var total = cards.length;

    function applyFilter(val) {
      var shown = 0;
      cards.forEach(function (card) {
        var cats = (card.getAttribute("data-cats") || "").split(/\s+/);
        var match = val === "all" || cats.indexOf(val) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });
      if (emptyNote) emptyNote.hidden = shown !== 0;
      if (countEl) {
        countEl.textContent = val === "all"
          ? "Showing all " + total + " coaches"
          : "Showing " + shown + " coach" + (shown === 1 ? "" : "es");
      }
      chips.forEach(function (c) {
        var on = c.getAttribute("data-filter") === val;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    filters.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      applyFilter(chip.getAttribute("data-filter"));
    });

    var reset = document.querySelector("[data-filter-reset]");
    if (reset) reset.addEventListener("click", function (e) { e.preventDefault(); applyFilter("all"); });
  }

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
        tr: "AI Adoption Strategist", tt: "With a coach who knows the path you're on." },
      { fr: "Front-end Developer", ft: "“AI writes the boilerplate now — where does that leave me?”",
        tr: "AI Product Engineer", tt: "With a coach who's guided this exact move." },
      { fr: "Marketing Manager", ft: "“Half my playbook got automated overnight.”",
        tr: "AI Content Strategist", tt: "With a coach who specializes in this pivot." }
    ];

    var i = 0, timer = null;

    function render(n) {
      var p = pairs[n];
      fromRole.textContent = p.fr; fromTag.textContent = p.ft;
      toRole.textContent = p.tr; toTag.textContent = p.tt;
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
      setTimeout(function () { render(i); visual.classList.remove("swapping"); }, 380);
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
      var matches = coachNodes.filter(function (c) {
        return (c.getAttribute("data-cats") || "").split(/\s+/).indexOf(dest) !== -1;
      });
      if (matches.length < 2) matches = coachNodes.slice(0, 3);
      matches = matches.slice(0, 3);
      resultGrid.innerHTML = "";
      matches.forEach(function (c) {
        var clone = c.cloneNode(true);
        clone.classList.remove("reveal");
        clone.removeAttribute("data-cats");
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
