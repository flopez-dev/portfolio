// Entry point for The Chantal Verdugo House landing. No dependencies, no build step.

(function () {
  "use strict";

  // Flags the document as JS-enabled so CSS can gate the .reveal hidden state behind
  // html.js — if this script fails to load, .reveal content stays fully visible.
  document.documentElement.classList.add("js");

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---- Mobile navigation toggle -------------------------------------------------
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

    nav.addEventListener("click", function (event) {
      if (mobile.matches && event.target.closest("a")) {
        closeNav();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mobile.matches && !nav.hidden) {
        closeNav();
        toggle.focus();
      }
    });

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

    history.pushState(null, "", id);
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  // ---- Reveal-on-scroll ------------------------------------------------------------
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
    document.querySelectorAll(".reveal").forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  // ---- Gallery lightbox -----------------------------------------------------------
  var galleryTriggers = Array.prototype.slice.call(document.querySelectorAll("[data-gallery-trigger]"));
  var lightbox = document.getElementById("lightbox");

  if (galleryTriggers.length && lightbox) {
    var lightboxImage = document.getElementById("lightbox-image");
    var lightboxCaption = document.getElementById("lightbox-caption");
    var currentIndex = 0;
    var lastFocused = null;

    var photos = galleryTriggers.map(function (trigger) {
      var img = trigger.querySelector("img");
      return {
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt"),
        caption: trigger.querySelector(".gallery-grid__caption").textContent,
      };
    });

    var renderPhoto = function (index) {
      var photo = photos[index];
      lightboxImage.setAttribute("src", photo.src);
      lightboxImage.setAttribute("alt", photo.alt);
      lightboxCaption.textContent = photo.caption;
    };

    var openLightbox = function (index) {
      currentIndex = index;
      renderPhoto(currentIndex);
      lastFocused = document.activeElement;
      lightbox.hidden = false;
      document.body.classList.add("nav-open"); // reuse existing scroll-lock hook
      lightbox.querySelector(".lightbox__close").focus();
    };

    var closeLightbox = function () {
      lightbox.hidden = true;
      document.body.classList.remove("nav-open");
      lightboxImage.setAttribute("src", "");
      if (lastFocused) lastFocused.focus();
    };

    var showNext = function () {
      currentIndex = (currentIndex + 1) % photos.length;
      renderPhoto(currentIndex);
    };

    var showPrev = function () {
      currentIndex = (currentIndex - 1 + photos.length) % photos.length;
      renderPhoto(currentIndex);
    };

    galleryTriggers.forEach(function (trigger, index) {
      trigger.addEventListener("click", function () {
        openLightbox(index);
      });
    });

    lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });

    lightbox.querySelector("[data-lightbox-next]").addEventListener("click", showNext);
    lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", showPrev);

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;

      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowRight") {
        showNext();
      } else if (event.key === "ArrowLeft") {
        showPrev();
      }
    });
  }

  // ---- Reviews carousel ------------------------------------------------------------
  // The track is a scroll-snap strip that works on its own; this only adds the
  // arrows, the counter, and keyboard paging on top of it.
  var reviewsCarousel = document.querySelector("[data-reviews-carousel]");

  if (reviewsCarousel) {
    var reviewsTrack = reviewsCarousel.querySelector("[data-reviews-track]");
    var reviewsPrev = reviewsCarousel.querySelector("[data-reviews-prev]");
    var reviewsNext = reviewsCarousel.querySelector("[data-reviews-next]");
    var reviewsStatus = reviewsCarousel.querySelector("[data-reviews-status]");
    var reviewCards = Array.prototype.slice.call(reviewsTrack.children);
    var reviewIndex = 0;

    var syncReviewControls = function () {
      reviewsStatus.textContent = reviewIndex + 1 + " / " + reviewCards.length;
      // Ends stop rather than wrap: with smooth scrolling, jumping from the last
      // review back to the first would sweep through all the ones between.
      reviewsPrev.disabled = reviewIndex === 0;
      reviewsNext.disabled = reviewIndex === reviewCards.length - 1;
    };

    var goToReview = function (index) {
      reviewIndex = Math.max(0, Math.min(index, reviewCards.length - 1));
      reviewsTrack.scrollTo({
        left: reviewCards[reviewIndex].offsetLeft - reviewsTrack.offsetLeft,
        behavior: reduceMotionQuery.matches ? "auto" : "smooth",
      });
      syncReviewControls();
    };

    reviewsNext.addEventListener("click", function () {
      goToReview(reviewIndex + 1);
    });

    reviewsPrev.addEventListener("click", function () {
      goToReview(reviewIndex - 1);
    });

    // Swiping moves the track without going through the buttons, so read the
    // scroll position back and re-sync from it — but only once scrolling has
    // settled. Re-syncing mid-scroll would also fire during the smooth scroll a
    // button starts, snapping reviewIndex back to a frame the animation is still
    // passing through and swallowing the next click.
    var reviewScrollTimer = null;
    reviewsTrack.addEventListener("scroll", function () {
      window.clearTimeout(reviewScrollTimer);
      reviewScrollTimer = window.setTimeout(function () {
        var middle = reviewsTrack.scrollLeft + reviewsTrack.clientWidth / 2;
        var nearest = 0;
        var shortest = Infinity;
        reviewCards.forEach(function (card, i) {
          var centre = card.offsetLeft - reviewsTrack.offsetLeft + card.offsetWidth / 2;
          var distance = Math.abs(centre - middle);
          if (distance < shortest) {
            shortest = distance;
            nearest = i;
          }
        });
        if (nearest !== reviewIndex) {
          reviewIndex = nearest;
          syncReviewControls();
        }
      }, 140);
    });

    // Bound to the carousel, not the document, so it can't fight the lightbox's
    // own arrow keys.
    reviewsCarousel.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToReview(reviewIndex + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToReview(reviewIndex - 1);
      }
    });

    syncReviewControls();
  }
})();
