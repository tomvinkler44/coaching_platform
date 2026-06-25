/* Throughline — interaction layer
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
