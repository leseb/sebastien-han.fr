// Landing hero: cluster-network canvas, cursor glow, name proximity, role typer.
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hero = document.querySelector(".hero");
  if (!hero) return;

  var mouse = { x: -9999, y: -9999, active: false };

  /* ---------- Cursor glow ---------- */
  var glow = hero.querySelector(".hero-glow");
  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
    if (glow) {
      glow.style.setProperty("--gx", mouse.x + "px");
      glow.style.setProperty("--gy", mouse.y + "px");
    }
  });
  hero.addEventListener("pointerleave", function () { mouse.active = false; mouse.x = mouse.y = -9999; });

  /* ---------- Network canvas: nodes, links, packets ---------- */
  var canvas = document.getElementById("hero-net");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, nodes = [], packets = [], LINK = 150;
    var running = false, visible = true;

    function build() {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(28, Math.min(110, Math.round((W * H) / 13000)));
      LINK = W < 640 ? 110 : 150;
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() < 0.12 ? 2.4 : 1.3 + Math.random() * 0.6
        });
      }
      packets = [];
    }

    function spawnPacket() {
      var a = nodes[(Math.random() * nodes.length) | 0];
      var best = null, bd = LINK * LINK;
      for (var i = 0; i < nodes.length; i++) {
        var b = nodes[i]; if (b === a) continue;
        var dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
        if (d < bd && Math.random() < 0.5) { bd = d; best = b; }
      }
      if (best) packets.push({ a: a, b: best, t: 0, s: 0.008 + Math.random() * 0.012 });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (!reduced) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < -20) a.x = W + 20; else if (a.x > W + 20) a.x = -20;
          if (a.y < -20) a.y = H + 20; else if (a.y > H + 20) a.y = -20;
          // gentle pull toward the cursor
          if (mouse.active) {
            dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
            if (d < 200 && d > 1) { a.x += dx / d * 0.25; a.y += dy / d * 0.25; }
          }
        }
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
          if (d < LINK * LINK) {
            var alpha = (1 - Math.sqrt(d) / LINK) * 0.22;
            ctx.strokeStyle = "rgba(214,160,72," + alpha.toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        if (mouse.active) {
          dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 180) {
            ctx.strokeStyle = "rgba(240,190,100," + ((1 - d / 180) * 0.5).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        var near = 0;
        if (mouse.active) {
          dx = a.x - mouse.x; dy = a.y - mouse.y;
          near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 180);
        }
        ctx.fillStyle = "rgba(235,180,95," + (0.35 + near * 0.65).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r + near * 1.6, 0, 6.283); ctx.fill();
      }
      // packets travelling along links, like requests through a cluster
      if (!reduced) {
        if (packets.length < 14 && Math.random() < 0.08) spawnPacket();
        for (i = packets.length - 1; i >= 0; i--) {
          var p = packets[i];
          p.t += p.s;
          if (p.t >= 1) { packets.splice(i, 1); continue; }
          var x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
          var g = ctx.createRadialGradient(x, y, 0, x, y, 8);
          g.addColorStop(0, "rgba(255,214,140,0.95)");
          g.addColorStop(1, "rgba(255,180,80,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.283); ctx.fill();
        }
      }
    }

    function frame() {
      if (!visible || document.hidden) { running = false; return; }
      draw();
      requestAnimationFrame(frame);
    }
    function start() { if (!running && !reduced) { running = true; requestAnimationFrame(frame); } }

    build();
    draw();
    var resizeT;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () { build(); draw(); }, 150);
    });
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(hero);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
    start();
  }

  /* ---------- Name: letters widen as the cursor gets close ---------- */
  var lines = hero.querySelectorAll("[data-proximity]");
  var chars = [];
  lines.forEach(function (line) {
    var text = line.textContent;
    line.textContent = "";
    line.setAttribute("aria-hidden", "true");
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = text[i];
      line.appendChild(s);
      chars.push(s);
    }
  });
  if (!reduced && chars.length && window.matchMedia("(hover: hover)").matches) {
    var pending = false, px = 0, py = 0;
    document.addEventListener("pointermove", function (e) {
      px = e.clientX; py = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        chars.forEach(function (c) {
          var r = c.getBoundingClientRect();
          var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
          var k = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 260);
          c.style.fontVariationSettings = '"wdth" ' + (88 + k * 12).toFixed(1) + ', "opsz" 96';
        });
      });
    });
  }

  /* ---------- Typer ---------- */
  var typer = hero.querySelector(".typer");
  if (typer && !reduced) {
    var words;
    try { words = JSON.parse(typer.getAttribute("data-words")); } catch (e) { words = null; }
    if (words && words.length > 1) {
      var w = 0, n = words[0].length, deleting = true;
      var tick = function () {
        var word = words[w];
        if (deleting) {
          n--;
          typer.textContent = word.slice(0, n);
          if (n <= 0) { deleting = false; w = (w + 1) % words.length; return setTimeout(tick, 350); }
          return setTimeout(tick, 32);
        }
        word = words[w];
        n++;
        typer.textContent = word.slice(0, n);
        if (n >= word.length) { deleting = true; return setTimeout(tick, 2200); }
        setTimeout(tick, 55 + Math.random() * 50);
      };
      setTimeout(tick, 2600);
    }
  }
})();
