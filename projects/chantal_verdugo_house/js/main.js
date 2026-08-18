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
    var toggleLabel = toggle.querySelector(".sr-only");

    var setToggleLabel = function (isOpen) {
      if (toggleLabel) {
        toggleLabel.textContent = isOpen ? "Close menu" : "Open menu";
      }
    };

    var closeNav = function () {
      nav.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      setToggleLabel(false);
    };

    var openNav = function () {
      nav.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
      setToggleLabel(true);
    };

    var sync = function () {
      if (mobile.matches) {
        closeNav();
      } else {
        nav.hidden = false;
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        setToggleLabel(false);
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

    // Grid cells show an 800x600 thumbnail, but the lightbox should open the
    // full-size photo. A single WebP support check here decides which of the
    // two data-full-* attributes to use, since .lightbox__image is a plain
    // <img> this script assigns src to directly (no <picture> to decide for it).
    var supportsWebp = document
      .createElement("canvas")
      .toDataURL("image/webp")
      .indexOf("data:image/webp") === 0;

    var photos = galleryTriggers.map(function (trigger) {
      var img = trigger.querySelector("img");
      var full = (supportsWebp ? img.dataset.full : img.dataset.fullJpg) || img.getAttribute("src");
      return {
        src: full,
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

    // Clamp the long quotes so every card is a similar height, and give the ones
    // that actually overflow a button to open them. Added here rather than in the
    // markup so a card is only ever given a control it needs.
    reviewCards.forEach(function (card) {
      var quote = card.querySelector(".review-card__quote");
      if (!quote) return;

      quote.classList.add("review-card__quote--clamped");
      if (quote.scrollHeight <= quote.clientHeight + 1) {
        quote.classList.remove("review-card__quote--clamped");
        return;
      }

      var author = card.querySelector(".review-card__author");
      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "review-card__more";
      toggle.textContent = "Show more";
      toggle.setAttribute("aria-expanded", "false");
      card.insertBefore(toggle, author);

      toggle.addEventListener("click", function () {
        var open = quote.classList.toggle("review-card__quote--clamped") === false;
        toggle.textContent = open ? "Show less" : "Show more";
        toggle.setAttribute("aria-expanded", String(open));
      });
    });

    // How many cards the CSS is currently fitting across the track. Read from
    // layout rather than duplicating the breakpoints here, so the two can't
    // drift apart.
    var reviewsPerView = function () {
      if (!reviewCards.length) return 1;
      var step = reviewCards.length > 1 ? reviewCards[1].offsetLeft - reviewCards[0].offsetLeft : 0;
      if (step <= 0) return 1;
      return Math.max(1, Math.round(reviewsTrack.clientWidth / step));
    };

    // The last position is the last full group, not the last card — scrolling
    // past it would leave blank space at the end of the track.
    var lastReviewIndex = function () {
      return Math.max(0, reviewCards.length - reviewsPerView());
    };

    var syncReviewControls = function () {
      var per = reviewsPerView();
      var last = Math.min(reviewIndex + per, reviewCards.length);
      reviewsStatus.textContent =
        (per === 1 ? reviewIndex + 1 : reviewIndex + 1 + "–" + last) + " / " + reviewCards.length;
      // Ends stop rather than wrap: with smooth scrolling, jumping from the last
      // review back to the first would sweep through all the ones between.
      reviewsPrev.disabled = reviewIndex === 0;
      reviewsNext.disabled = reviewIndex >= lastReviewIndex();
    };

    var goToReview = function (index) {
      reviewIndex = Math.max(0, Math.min(index, lastReviewIndex()));
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
        // Match on the card's leading edge, since slides snap to start.
        var nearest = 0;
        var shortest = Infinity;
        reviewCards.forEach(function (card, i) {
          var distance = Math.abs(card.offsetLeft - reviewsTrack.offsetLeft - reviewsTrack.scrollLeft);
          if (distance < shortest) {
            shortest = distance;
            nearest = i;
          }
        });
        nearest = Math.min(nearest, lastReviewIndex());
        if (nearest !== reviewIndex) {
          reviewIndex = nearest;
          syncReviewControls();
        }
      }, 140);
    });

    // A resize can change how many cards fit, which moves the last valid
    // position and the counter's range.
    var reviewsResizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(reviewsResizeTimer);
      reviewsResizeTimer = window.setTimeout(function () {
        reviewIndex = Math.min(reviewIndex, lastReviewIndex());
        syncReviewControls();
      }, 150);
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
