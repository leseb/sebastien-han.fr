document.addEventListener("DOMContentLoaded", function () {
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  // Scroll reveal animation
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length > 0) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function (el) { observer.observe(el); });
  }

  // Drop cap on first text paragraph
  var postBody = document.querySelector(".post-body");
  if (postBody) {
    var paragraphs = postBody.querySelectorAll(":scope > p");
    for (var i = 0; i < paragraphs.length; i++) {
      var p = paragraphs[i];
      if (!p.querySelector("img") && p.textContent.trim().length > 0) {
        p.classList.add("drop-cap");
        break;
      }
    }
  }

  // Code copy buttons
  document.querySelectorAll(".highlight pre, .post-body > pre").forEach(function (pre) {
    var wrapper = document.createElement("div");
    wrapper.className = "highlight-wrapper";
    wrapper.style.position = "relative";
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    var btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    wrapper.appendChild(btn);

    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.textContent : pre.textContent;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = "Copied!";
        setTimeout(function () {
          btn.textContent = "Copy";
        }, 2000);
      });
    });
  });

  // TOC active state
  var tocLinks = document.querySelectorAll("#TableOfContents a");
  if (tocLinks.length > 0) {
    var headings = [];
    tocLinks.forEach(function (link) {
      var id = link.getAttribute("href");
      if (id && id.startsWith("#")) {
        var el = document.getElementById(id.slice(1));
        if (el) headings.push({ el: el, link: link });
      }
    });

    function updateToc() {
      var scrollPos = window.scrollY + 100;
      var current = null;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].el.offsetTop <= scrollPos) {
          current = headings[i];
        }
      }
      tocLinks.forEach(function (l) { l.classList.remove("active"); });
      if (current) current.link.classList.add("active");
    }

    window.addEventListener("scroll", updateToc, { passive: true });
    updateToc();
  }
});
