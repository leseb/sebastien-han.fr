(function () {
  "use strict";

  var MAX_RESULTS = 30;

  var modal, input, results, status, defaultStatus, bgRegions;
  var pagefind = null;
  var pfLoading = false;
  var pfFailed = false;
  var activeIndex = -1;
  var lastFocused = null;
  var searchToken = 0;
  var pointerMoved = false;

  function isMac() {
    var p = navigator.platform || navigator.userAgent || "";
    return /Mac|iPhone|iPad|iPod/.test(p);
  }

  function setStatus(text) {
    status.textContent = text || "";
    status.hidden = !text;
  }

  function setExpanded(on) {
    input.setAttribute("aria-expanded", on ? "true" : "false");
  }

  // Make the rest of the page inert (unfocusable + hidden from AT) while the
  // modal is open, so Tab and screen readers stay inside the dialog.
  function setBackgroundInert(on) {
    bgRegions.forEach(function (el) {
      if (!el) return;
      if (on) {
        el.setAttribute("inert", "");
        el.setAttribute("aria-hidden", "true");
      } else {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
    });
  }

  function loadPagefind() {
    if (pagefind || pfLoading) return;
    pfLoading = true;
    pfFailed = false;
    import("/pagefind/pagefind.js")
      .then(function (mod) {
        pagefind = mod;
        pfLoading = false;
        if (input.value.trim()) doSearch(input.value);
      })
      .catch(function () {
        pfLoading = false;
        pfFailed = true;
        setExpanded(false);
        setStatus("Search is unavailable right now.");
      });
  }

  function doSearch(q) {
    var query = (q || "").trim();

    if (!query) {
      ++searchToken; // invalidate any in-flight search
      activeIndex = -1;
      results.innerHTML = "";
      input.removeAttribute("aria-activedescendant");
      setExpanded(false);
      setStatus(defaultStatus);
      return;
    }
    if (pfFailed) {
      setExpanded(false);
      setStatus("Search is unavailable right now.");
      return;
    }
    if (!pagefind) {
      setExpanded(false);
      setStatus("Loading…");
      return;
    }

    var token = ++searchToken;
    pagefind.debouncedSearch(query, {}, 120).then(function (search) {
      if (search === null) return;         // a newer query superseded this one
      if (token !== searchToken) return;   // stale response (cleared/closed/newer)
      var ptrs = search.results.slice(0, MAX_RESULTS);
      return Promise.all(ptrs.map(function (r) { return r.data(); })).then(function (datas) {
        if (token !== searchToken) return;
        renderResults(datas, search.results.length);
      });
    }).catch(function () {
      if (token === searchToken) {
        setExpanded(false);
        setStatus("Search failed. Please try again.");
      }
    });
  }

  function renderResults(datas, total) {
    results.innerHTML = "";
    activeIndex = datas.length ? 0 : -1;

    datas.forEach(function (d, i) {
      var li = document.createElement("li");
      li.className = "search-result" + (i === 0 ? " is-active" : "");
      li.setAttribute("role", "option");
      li.id = "search-result-" + i;
      li.setAttribute("aria-selected", i === 0 ? "true" : "false");

      var a = document.createElement("a");
      a.href = d.url;
      a.className = "search-result-link";
      a.tabIndex = -1;

      var title = document.createElement("span");
      title.className = "search-result-title";
      title.textContent = (d.meta && d.meta.title) || "Untitled";
      a.appendChild(title);

      if (d.excerpt) {
        var snippet = document.createElement("span");
        snippet.className = "search-result-snippet";
        snippet.innerHTML = d.excerpt; // Pagefind-generated HTML with <mark> tags
        a.appendChild(snippet);
      }

      if (d.meta && d.meta.date) {
        var meta = document.createElement("span");
        meta.className = "search-result-meta";
        meta.textContent = d.meta.date;
        a.appendChild(meta);
      }

      li.appendChild(a);
      li.addEventListener("mouseenter", function () {
        if (pointerMoved) setActive(i); // ignore scroll-induced hover after keyboard nav
      });
      results.appendChild(li);
    });

    setExpanded(datas.length > 0);
    if (activeIndex >= 0) {
      input.setAttribute("aria-activedescendant", "search-result-0");
    } else {
      input.removeAttribute("aria-activedescendant");
    }

    if (!total) {
      setStatus("No posts found.");
    } else if (total > datas.length) {
      setStatus(total + " results (showing first " + datas.length + ")");
    } else {
      setStatus(total + " result" + (total === 1 ? "" : "s"));
    }
  }

  function setActive(i) {
    var items = results.querySelectorAll(".search-result");
    if (!items.length) { activeIndex = -1; return; }
    if (i < 0) i = items.length - 1;
    if (i >= items.length) i = 0;
    activeIndex = i;
    items.forEach(function (el, idx) {
      var on = idx === activeIndex;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-selected", on ? "true" : "false");
    });
    var active = items[activeIndex];
    if (active) {
      input.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView({ block: "nearest" });
    }
  }

  function gotoActive() {
    var items = results.querySelectorAll(".search-result");
    if (activeIndex < 0 || !items[activeIndex]) return;
    var link = items[activeIndex].querySelector("a");
    if (link) window.location.href = link.href;
  }

  function open() {
    if (!modal || !modal.hidden) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("search-open");
    loadPagefind();
    input.focus();              // move focus into the dialog first...
    setBackgroundInert(true);   // ...then isolate the background
  }

  function close() {
    if (!modal || modal.hidden) return;
    ++searchToken; // invalidate any in-flight search
    modal.hidden = true;
    document.body.classList.remove("search-open");
    setBackgroundInert(false);
    input.value = "";
    input.removeAttribute("aria-activedescendant");
    setExpanded(false);
    activeIndex = -1;
    results.innerHTML = "";
    setStatus(defaultStatus);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    // Global open: Cmd/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      modal.hidden ? open() : close();
      return;
    }
    // "/" quick-open when not already typing in a field
    if (e.key === "/" && modal.hidden) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag !== "input" && tag !== "textarea" && !e.target.isContentEditable) {
        e.preventDefault();
        open();
      }
      return;
    }
    if (modal.hidden) return;
    if (e.isComposing || e.keyCode === 229) return; // let IME composition commit

    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // Keep Tab focus within the dialog (fallback for browsers without `inert`).
      var f = modal.querySelectorAll("input, button:not([disabled])");
      if (f.length) {
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      pointerMoved = false;
      setActive(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      pointerMoved = false;
      setActive(activeIndex - 1);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        gotoActive();
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    modal = document.getElementById("searchModal");
    input = document.getElementById("searchInput");
    results = document.getElementById("searchResults");
    status = document.getElementById("searchStatus");
    if (!modal || !input || !results || !status) return;
    defaultStatus = status.textContent.trim();
    bgRegions = Array.prototype.slice.call(document.querySelectorAll("body > header, body > main, body > footer"));

    // Label the keyboard hint for the platform
    if (!isMac()) {
      document.querySelectorAll("[data-search-mod]").forEach(function (el) { el.textContent = "Ctrl"; });
      document.querySelectorAll(".nav-search-kbd").forEach(function (el) { el.classList.add("is-ctrl"); });
    }

    document.querySelectorAll("[data-search-open]").forEach(function (btn) {
      btn.addEventListener("click", function (e) { e.preventDefault(); open(); });
    });
    document.querySelectorAll("[data-search-close]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); close(); });
    });

    input.addEventListener("input", function () { doSearch(input.value); });
    results.addEventListener("mousemove", function () { pointerMoved = true; });

    document.addEventListener("keydown", onKeydown);
  });
})();
