// Entry point for this landing. No dependencies, no build step.
// Grown from the repo scaffold: the mobile-nav toggle and the [data-year] footer hook
// below are the original two modules, extended rather than replaced. Everything else
// (scroll state, smooth scroll, reveal-on-scroll, video autoplay, FAQ accordion) is new,
// each wrapped in its own function and feature-detected so a missing API just no-ops.

(function () {
  "use strict";

  // Flags the document as JS-enabled so CSS can gate the .reveal hidden state behind
  // html.js — if this script fails to load, .reveal content stays fully visible.
  document.documentElement.classList.add("js");

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---- Mobile navigation toggle -------------------------------------------------
  // Original scaffold module, kept and extended: breakpoint moved from 640px to
  // 900px to match the stylesheet, plus close-on-link-click, close on Esc and a
  // simple focus trap while the panel is open.
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    var mobile = window.matchMedia("(max-width: 900px)");

    var closeNav = function () {
      nav.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };

    var openNav = function () {
      nav.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
    };

    var sync = function () {
      // The nav is only collapsible on small screens; on desktop it's always visible.
      if (mobile.matches) {
        closeNav();
      } else {
        nav.hidden = false;
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      }
    };

    toggle.addEventListener("click", function () {
      if (nav.hidden) {
        openNav();
      } else {
        closeNav();
      }
    });

    // Close after choosing a link (mobile only).
    nav.addEventListener("click", function (event) {
      if (mobile.matches && event.target.closest("a")) {
        closeNav();
      }
    });

    // Close on Escape and return focus to the toggle.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mobile.matches && !nav.hidden) {
        closeNav();
        toggle.focus();
      }
    });

    // Minimal focus trap while the mobile panel is open.
    nav.addEventListener("keydown", function (event) {
      if (event.key !== "Tab" || nav.hidden) return;

      var focusable = nav.querySelectorAll("a");
      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    if (typeof mobile.addEventListener === "function") {
      mobile.addEventListener("change", sync);
    }
    sync();
  }

  // ---- Current year in the footer -----------------------------------------------
  // Original scaffold module, unchanged.
  var year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // ---- Sticky nav background on scroll -------------------------------------------
  var header = document.getElementById("site-header");
  if (header) {
    var ticking = false;

    var applyScrollState = function () {
      ticking = false;
      if (window.scrollY > 40) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(applyScrollState);
          ticking = true;
        }
      },
      { passive: true }
    );

    applyScrollState();
  }

  // ---- Smooth scroll for in-page anchors, offset by the sticky header -----------
  var headerHeight = function () {
    return header ? header.getBoundingClientRect().height : 0;
  };

  document.addEventListener("click", function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;

    var id = link.getAttribute("href");
    if (!id || id === "#") return;

    var target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();

    var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight() - 12;

    window.scrollTo({
      top: top,
      behavior: reduceMotionQuery.matches ? "auto" : "smooth",
    });

    // Keep the URL/history in sync without re-triggering the browser's own jump.
    history.pushState(null, "", id);
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  // ---- Reveal-on-scroll ------------------------------------------------------------
  // Content is fully visible without JS or with reduced motion: this only adds the
  // class that the (motion-gated) CSS transition reacts to.
  if ("IntersectionObserver" in window && !reduceMotionQuery.matches) {
    var revealItems = document.querySelectorAll(".reveal");

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    // No IntersectionObserver, or the user asked for reduced motion: show everything.
    document.querySelectorAll(".reveal").forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  // ---- Taller video reels: autoplay in view, click-to-play as a fallback --------
  // Every <video> is muted/loop/playsinline with preload="none", so nothing is
  // fetched until its card is actually scrolled into view. Under reduced motion the
  // observer never attaches: the poster stays put and the play button (always in the
  // markup) is the only way to start playback.
  var videoCards = document.querySelectorAll(".video-card");

  videoCards.forEach(function (card) {
    var video = card.querySelector(".js-reel-video");
    var playButton = card.querySelector(".video-card__play");
    if (!video) return;

    var startPlayback = function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise
          .then(function () {
            card.classList.add("is-playing");
          })
          .catch(function () {
            // Autoplay blocked (or the source hasn't loaded yet) — leave the poster
            // and play button as-is, no error surfaced to the user.
          });
      } else {
        card.classList.add("is-playing");
      }
    };

    if (playButton) {
      playButton.addEventListener("click", function () {
        startPlayback();
      });
    }

    video.addEventListener("pause", function () {
      card.classList.remove("is-playing");
    });

    var canAutoplay = "IntersectionObserver" in window && !reduceMotionQuery.matches;

    if (canAutoplay) {
      card.classList.add("has-autoplay");

      var videoObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              startPlayback();
            } else {
              video.pause();
            }
          });
        },
        { threshold: [0, 0.5, 1] }
      );

      videoObserver.observe(card);
    }
  });

  // ---- FAQ accordion: single item open at a time, animated collapse -------------
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));

  faqItems.forEach(function (item) {
    var summary = item.querySelector("summary");
    if (!summary) return;

    summary.addEventListener("click", function (event) {
      var isOpen = item.hasAttribute("open");

      if (isOpen) {
        // Let the CSS grid-rows transition animate the collapse, then actually close it.
        event.preventDefault();

        if (reduceMotionQuery.matches) {
          item.removeAttribute("open");
          return;
        }

        item.classList.add("is-closing");

        var onTransitionEnd = function (transitionEvent) {
          if (transitionEvent.target !== item.querySelector(".faq-item__panel")) return;
          item.classList.remove("is-closing");
          item.removeAttribute("open");
          item.removeEventListener("transitionend", onTransitionEnd);
        };

        item.addEventListener("transitionend", onTransitionEnd);
      } else {
        // Opening: close any other open item first (single-open behaviour).
        faqItems.forEach(function (other) {
          if (other !== item && other.hasAttribute("open")) {
            other.removeAttribute("open");
            other.classList.remove("is-closing");
          }
        });
      }
    });
  });
})();
