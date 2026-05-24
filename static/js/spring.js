(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".spring-target").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document.querySelectorAll(".spring-icon").forEach(function (el) {
      el.style.transform = "none";
    });
    return;
  }

  var stiffness = 180;
  var damping = 14;
  var mass = 1;
  var dt = 1 / 60;

  var springs = [];
  var running = false;

  function createSpring(el, index, isIcon) {
    return {
      el: el,
      posY: 0,
      velY: 0,
      posR: isIcon ? 1 : 0,
      velR: 0,
      posS: isIcon ? 0 : 1,
      velS: 0,
      targetY: 1,
      startDelay: index * 60,
      elapsed: 0,
      started: false,
      done: false,
      isIcon: isIcon
    };
  }

  function tick() {
    var allDone = true;
    for (var i = 0; i < springs.length; i++) {
      var s = springs[i];
      if (s.done) continue;

      s.elapsed += 16.67;
      if (s.elapsed < s.startDelay) {
        allDone = false;
        continue;
      }

      if (!s.started) s.started = true;

      var forceY = -stiffness * (s.posY - s.targetY);
      var dampY = -damping * s.velY;
      s.velY += (forceY + dampY) / mass * dt;
      s.posY += s.velY * dt;

      if (s.isIcon) {
        var forceR = -stiffness * s.posR;
        var dampR = -damping * s.velR;
        s.velR += (forceR + dampR) / mass * dt;
        s.posR += s.velR * dt;

        var forceS = -(stiffness * 1.2) * (s.posS - 1);
        var dampS = -damping * s.velS;
        s.velS += (forceS + dampS) / mass * dt;
        s.posS += s.velS * dt;

        if (Math.abs(s.posR) < 0.05 && Math.abs(s.velR) < 0.01 &&
            Math.abs(s.posS - 1) < 0.001 && Math.abs(s.velS) < 0.01) {
          s.done = true;
          s.el.style.transform = "none";
        } else {
          allDone = false;
          s.el.style.transform = "rotate(" + (s.posR * 15) + "deg) scale(" + (0.7 + s.posS * 0.3) + ")";
        }
      } else {
        if (Math.abs(s.posY - 1) < 0.001 && Math.abs(s.velY) < 0.01) {
          s.done = true;
          s.el.style.opacity = "1";
          s.el.style.transform = "none";
        } else {
          allDone = false;
          var opacity = Math.max(0, Math.min(1, s.posY * 1.5));
          var yPx = (1 - s.posY) * 50;
          s.el.style.opacity = opacity;
          s.el.style.transform = "translateY(" + yPx + "px)";
        }
      }
    }

    if (!allDone) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      var section = entry.target.closest(".spring-section, .site-footer");
      if (!section || section.dataset.sprung) return;
      section.dataset.sprung = "1";

      var targets = section.querySelectorAll(".spring-target");
      var idx = 0;
      targets.forEach(function (t) {
        springs.push(createSpring(t, idx, false));
        var icon = t.querySelector(".spring-icon");
        if (icon) {
          springs.push(createSpring(icon, idx, true));
        }
        idx++;
      });

      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".spring-section, .site-footer").forEach(function (section) {
    observer.observe(section);
  });
})();
