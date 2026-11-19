// Landing page: stat count-up, timeline progress, card spotlight, `ceph` easter egg.
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Count-up stats ---------- */
  var nums = document.querySelectorAll("[data-count]");
  if (nums.length && !reduced) {
    var fmt = new Intl.NumberFormat("en-US");
    nums.forEach(function (el) { el.textContent = "0"; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var el = entry.target, target = +el.getAttribute("data-count"), t0 = null, dur = 1400;
        requestAnimationFrame(function step(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / dur);
          k = 1 - Math.pow(1 - k, 4);
          el.textContent = fmt.format(Math.round(target * k));
          if (k < 1) requestAnimationFrame(step);
        });
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Timeline fills as you scroll ---------- */
  var tl = document.querySelector("[data-timeline]");
  if (tl) {
    var update = function () {
      var r = tl.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.65 - r.top) / r.height;
      tl.style.setProperty("--progress", Math.max(0, Math.min(1, p)).toFixed(4));
    };
    if (reduced) tl.style.setProperty("--progress", "1");
    else {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
    }
  }

  /* ---------- Bento cards: spotlight follows the cursor ---------- */
  document.querySelectorAll(".bento-card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Easter egg: type `ceph` anywhere ---------- */
  var term = document.getElementById("cephTerm");
  if (!term) return;
  var body = term.querySelector(".ceph-term-body");
  var buffer = "", lastFocus = null, timers = [];
  var postsEl = document.querySelector("[data-count]");
  var POSTS = postsEl ? postsEl.getAttribute("data-count") : "370";

  var lines = [
    '<span class="prompt">$</span> ceph -s',
    '  cluster:',
    '    id:     5e1a7c3d-2011-4b1d-9c0f-marseille13',
    '    health: <span class="ok">HEALTH_OK</span>',
    '',
    '  services:',
    '    mon: 3 daemons, quorum calanques,vieux-port,notre-dame (age 15y)',
    '    mgr: leseb(active, since 2012)',
    '    osd: ' + POSTS + ' osds: ' + POSTS + ' up, ' + POSTS + ' in   <span class="dim"># one per blog post</span>',
    '    rgw: 1 daemon active (sebastien-han.fr)',
    '',
    '  data:',
    '    pools:   3 pools (ceph, rook, ogx)',
    '    objects: 10+ years of open source',
    '    usage:   lots of coffee used, ∞ avail',
    '    pgs:     128 <span class="ok">active+clean</span>',
    '',
    '<span class="dim">Thanks for running ceph on my homepage. Press Esc to exit.</span>'
  ];

  function openTerm() {
    if (!term.hidden) return;
    lastFocus = document.activeElement;
    term.hidden = false;
    term.tabIndex = -1;
    term.focus();
    body.innerHTML = "";
    if (reduced) { body.innerHTML = lines.join("\n"); return; }
    lines.forEach(function (l, i) {
      timers.push(setTimeout(function () { body.innerHTML += (i ? "\n" : "") + l; }, i === 0 ? 0 : 400 + i * 70));
    });
  }
  function closeTerm() {
    if (term.hidden) return;
    timers.forEach(clearTimeout); timers = [];
    term.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  term.addEventListener("click", function (e) { if (e.target === term) closeTerm(); });
  document.addEventListener("keydown", function (e) {
    if (!term.hidden && e.key === "Escape") { closeTerm(); return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-4);
    if (buffer === "ceph") { buffer = ""; openTerm(); }
  });
  window.addEventListener("hashchange", function () { if (location.hash === "#ceph") openTerm(); });
  if (location.hash === "#ceph") openTerm();
})();
