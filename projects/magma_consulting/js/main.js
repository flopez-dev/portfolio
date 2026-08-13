// Entry point para la landing de Magma Consulting. Sin dependencias, sin build step.

(function () {
  "use strict";

  // Marca el documento como JS-enabled para que el CSS pueda ocultar .reveal
  // detrás de html.js — si este script no llega a cargar, .reveal sigue visible.
  document.documentElement.classList.add("js");

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---- Vídeo de fondo del hero ------------------------------------------------
  // El atributo autoplay del <video> no puede condicionarse por CSS: quien pide
  // motion reducido lo quita aquí y el vídeo se queda fijo en el poster (su
  // primer frame), sin reproducirse nunca.
  if (reduceMotionQuery.matches) {
    var heroVideo = document.querySelector(".hero__video");
    if (heroVideo) {
      heroVideo.removeAttribute("autoplay");
      heroVideo.pause();
    }
  }

  // ---- Menú móvil -----------------------------------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    // Debe coincidir con el breakpoint de .nav en css/styles.css.
    var mobile = window.matchMedia("(max-width: 780px)");
    var toggleLabel = toggle.querySelector(".sr-only");

    var setToggleLabel = function (isOpen) {
      if (toggleLabel) {
        toggleLabel.textContent = isOpen ? "Cerrar menú" : "Abrir menú";
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

  // ---- Año actual en el pie --------------------------------------------------
  var year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // ---- Fondo del header al hacer scroll --------------------------------------
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

  // ---- Scroll suave para anclas internas, con el offset del header fijo -----
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

  // ---- Reveal-on-scroll -------------------------------------------------------
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
})();
