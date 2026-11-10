/* Research group template — small, dependency-free behaviour.
   Every feature checks that its elements exist, so this one file can load on
   every page. The site still works (minus these extras) with JavaScript off. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function playQuietly(video) {
    var p = video.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
    return p;
  }

  /* ---- Light / dark theme ---------------------------------------------- */
  var themeButton = document.querySelector("[data-theme-toggle]");
  function activeTheme() {
    return root.dataset.theme || (darkQuery.matches ? "dark" : "light");
  }
  function labelThemeButton() {
    if (!themeButton) return;
    var next = activeTheme() === "dark" ? "light" : "dark";
    themeButton.setAttribute("aria-label", "Switch to " + next + " theme");
  }
  if (themeButton) {
    labelThemeButton();
    themeButton.addEventListener("click", function () {
      var next = activeTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      labelThemeButton();
    });
    if (darkQuery.addEventListener) darkQuery.addEventListener("change", labelThemeButton);
  }

  /* ---- Header: mobile menu, and solid background once past the hero ----- */
  var header = document.querySelector("[data-header]");
  var nav = document.querySelector("[data-nav]");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var hero = document.querySelector(".hero");

  function navIsOpen() { return !!nav && nav.classList.contains("is-open"); }

  function updateHeader() {
    if (!header || !hero) return;
    var pastHero = window.scrollY > hero.offsetHeight - header.offsetHeight - 8;
    header.classList.toggle("is-solid", pastHero || navIsOpen());
  }

  function setNav(open) {
    nav.classList.toggle("is-open", open);
    if (header) header.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    updateHeader();
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () { setNav(!navIsOpen()); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navIsOpen()) { setNav(false); navToggle.focus(); }
    });
    window.matchMedia("(min-width: 56.01rem)").addEventListener("change", function (e) {
      if (e.matches && navIsOpen()) setNav(false);
    });
  }

  if (hero) {
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);
  }

  /* ---- Home page background video ---------------------------------------- */
  var heroVideo = document.querySelector("[data-hero-video]");
  var heroToggle = document.querySelector("[data-hero-toggle]");
  if (heroVideo) {
    // People who ask their system for reduced motion get the still poster
    // until they press play themselves.
    var heldByUser = reduceMotion;
    var heroVisible = true;

    var setPressed = function (paused) {
      if (heroToggle) heroToggle.setAttribute("aria-pressed", String(paused));
    };
    setPressed(true);
    heroVideo.addEventListener("play", function () { setPressed(false); });
    heroVideo.addEventListener("pause", function () { if (heroVisible) setPressed(true); });

    if (!heldByUser) playQuietly(heroVideo);

    if (heroToggle) {
      heroToggle.addEventListener("click", function () {
        if (heroVideo.paused) { heldByUser = false; playQuietly(heroVideo); }
        else { heldByUser = true; heroVideo.pause(); }
      });
    }

    // Save battery: stop decoding while the hero is scrolled out of view.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (!heroVisible) heroVideo.pause();
        else if (!heldByUser) playQuietly(heroVideo);
      }).observe(heroVideo);
    }
  }

  /* ---- Research videos play while on screen -------------------------------- */
  var inViewVideos = document.querySelectorAll("[data-play-in-view]");
  if (inViewVideos.length && !reduceMotion && "IntersectionObserver" in window) {
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) playQuietly(entry.target);
        else entry.target.pause();
      });
    }, { threshold: 0.4 });
    inViewVideos.forEach(function (v) { videoObserver.observe(v); });
  }

  /* ---- Full-size media viewer ---------------------------------------------- */
  var dialog = document.querySelector("[data-viewer-dialog]");
  if (dialog) {
    var viewerMedia = dialog.querySelector("[data-viewer-media]");
    var viewerCaption = dialog.querySelector("[data-viewer-caption]");
    var closeButton = dialog.querySelector("[data-viewer-close]");

    var openViewer = function (trigger) {
      var kind = trigger.getAttribute("data-viewer");
      var src = trigger.getAttribute("data-src");
      if (typeof dialog.showModal !== "function") { window.open(src, "_blank", "noopener"); return; }

      var el;
      if (kind === "video") {
        el = document.createElement("video");
        el.controls = true;
        el.loop = true;
        el.playsInline = true;
        el.preload = "auto";
        if (trigger.dataset.poster) el.poster = trigger.dataset.poster;
        el.setAttribute("aria-label", trigger.dataset.alt || "Video");
        el.src = src;
      } else {
        el = document.createElement("img");
        el.alt = trigger.dataset.alt || "";
        el.src = src;
      }
      viewerMedia.replaceChildren(el);
      var caption = trigger.dataset.caption || "";
      viewerCaption.textContent = caption;
      viewerCaption.hidden = caption === "";

      // Pause the small inline copies while the large one plays.
      inViewVideos.forEach(function (v) { v.pause(); });
      dialog.showModal();
      if (kind === "video") playQuietly(el);
    };

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-viewer]");
      if (trigger && !dialog.contains(trigger)) {
        e.preventDefault();
        openViewer(trigger);
      }
    });
    closeButton.addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) {
      // Clicking the dark area around the media closes the viewer.
      if (e.target === dialog || e.target.classList.contains("viewer__frame")) dialog.close();
    });
    dialog.addEventListener("close", function () { viewerMedia.replaceChildren(); });
  }

  /* ---- Publication search and filters --------------------------------------- */
  var pubRoot = document.querySelector("[data-pubs]");
  if (pubRoot) {
    var search = pubRoot.querySelector("[data-pub-search]");
    var yearSelect = pubRoot.querySelector("[data-pub-year]");
    var typeButtons = Array.prototype.slice.call(pubRoot.querySelectorAll("[data-pub-type]"));
    var items = Array.prototype.slice.call(pubRoot.querySelectorAll("[data-pub]"));
    var groups = Array.prototype.slice.call(pubRoot.querySelectorAll("[data-pub-group]"));
    var countEl = pubRoot.querySelector("[data-pub-count]");
    var emptyEl = pubRoot.querySelector("[data-pub-empty]");
    var resetButton = pubRoot.querySelector("[data-pub-reset]");
    var activeType = "all";

    var plural = function (n) { return n === 1 ? "publication" : "publications"; };

    var applyFilters = function () {
      var terms = search.value.toLowerCase().split(/\s+/).filter(Boolean);
      var year = yearSelect.value;
      var shown = 0;
      items.forEach(function (el) {
        var text = el.getAttribute("data-search");
        var match = (activeType === "all" || el.dataset.type === activeType) &&
                    (year === "all" || el.dataset.year === year) &&
                    terms.every(function (t) { return text.indexOf(t) !== -1; });
        el.hidden = !match;
        if (match) shown++;
      });
      groups.forEach(function (g) {
        g.hidden = !g.querySelector("[data-pub]:not([hidden])");
      });
      countEl.textContent = shown === items.length
        ? items.length + " " + plural(items.length)
        : "Showing " + shown + " of " + items.length + " " + plural(items.length);
      emptyEl.hidden = shown !== 0;
    };

    var setType = function (type) {
      activeType = type;
      typeButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.pubType === type));
      });
      applyFilters();
    };

    search.addEventListener("input", applyFilters);
    yearSelect.addEventListener("change", applyFilters);
    typeButtons.forEach(function (b) {
      b.addEventListener("click", function () { setType(b.dataset.pubType); });
    });
    resetButton.addEventListener("click", function () {
      search.value = "";
      yearSelect.value = "all";
      setType("all");
      search.focus();
    });
  }

  /* ---- BibTeX panels and copy buttons ---------------------------------------- */
  function copyText(text, button) {
    var label = button.querySelector("span");
    var original = label ? label.textContent : "";
    var done = function () {
      button.classList.add("is-copied");
      if (label) label.textContent = "Copied";
      window.setTimeout(function () {
        button.classList.remove("is-copied");
        if (label) label.textContent = original;
      }, 1800);
    };
    var fallback = function () {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try { if (document.execCommand("copy")) done(); } catch (e) {}
      area.remove();
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  document.addEventListener("click", function (e) {
    var toggle = e.target.closest("[data-bibtex-toggle]");
    if (toggle) {
      var panel = document.getElementById(toggle.getAttribute("aria-controls"));
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      if (panel) panel.hidden = open;
      return;
    }
    var copy = e.target.closest("[data-copy]");
    if (copy) {
      var code = copy.parentElement.querySelector("code");
      if (code) copyText(code.textContent, copy);
    }
  });
})();
