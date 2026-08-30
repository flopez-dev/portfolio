// Entry point for this page. No dependencies, no build step.

(function () {
  "use strict";

  // Flags the document as JS-enabled so CSS can gate the .reveal hidden state behind
  // html.js — if this script fails to load, .reveal content stays fully visible.
  document.documentElement.classList.add("js");

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---- Mobile navigation toggle ---------------------------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    var mobile = window.matchMedia("(max-width: 780px)");

    var sync = function () {
      // The nav is only collapsible on small screens.
      nav.hidden = mobile.matches;
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", function () {
      var open = nav.hidden;
      nav.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", function (event) {
      if (mobile.matches && event.target.closest("a")) {
        nav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    if (typeof mobile.addEventListener === "function") {
      mobile.addEventListener("change", sync);
    }
    sync();
  }

  // ---- Current year in the footer -------------------------------------------------
  var year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // ---- Reveal-on-scroll, staggered across the work grid ---------------------------
  // Content is fully visible without JS or with reduced motion: this only adds the
  // class (and stagger index) that the motion-gated CSS transition reacts to.
  var revealItems = document.querySelectorAll(".reveal");

  revealItems.forEach(function (item) {
    var siblings = item.parentElement ? item.parentElement.children : [];
    var index = Array.prototype.indexOf.call(siblings, item);
    item.style.setProperty("--i", String(Math.max(index, 0)));
  });

  if ("IntersectionObserver" in window && !reduceMotionQuery.matches) {
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
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  // ---- Language toggle (EN source, ES dictionary) ----------------------------------
  // index.html is authored in English and fully readable without this script. Every
  // translatable node carries data-i18n (text), data-i18n-title (the <title>) or
  // data-i18n-meta (a <meta content="…">) — this only swaps text, never markup, so
  // there's no HTML-injection surface.
  var STRINGS = {
    es: {
      "a11y.skip": "Ir al contenido",
      "a11y.menu": "Menú",
      "nav.work": "Proyectos",
      "nav.source": "Código fuente",
      "nav.contact": "Contacto",
      "hero.eyebrow": "Portfolio · 2026",
      "hero.title1": "Webs estáticas,",
      "hero.title2": "construidas a mano.",
      "hero.lead1":
        "HTML, CSS y JavaScript sin adornos, para pequeños negocios: sin framework, sin CDN, sin build step. Cada proyecto de abajo es una carpeta de",
      "hero.lead2": "este repositorio",
      "hero.lead3": ", lista para servirse en cualquier hosting estático, o directamente desde disco.",
      "hero.cta": "Ver los proyectos",
      "hero.contact": "Escríbeme",
      "featured.eyebrow": "Destacado",
      "featured.desc":
        "Instalación y mantenimiento de maquinaria industrial para líneas de embotellado, en Villarrobledo (Albacete).",
      "work.eyebrow": "Proyectos",
      "work.title": "Cada carpeta, una web.",
      "work.count": "5 proyectos",
      "work.inmica.status": "Cliente real",
      "work.inmica.desc": "Servicio técnico y mantenimiento de líneas de embotellado.",
      "work.wip.status": "En construcción",
      "work.chantal.status": "En producción",
      "work.latiguillos.desc": "Proveedor de latiguillos hidráulicos: landing aún en boceto.",
      "work.myself.desc": "Página personal, aparte de este índice: todavía en boceto.",
      "work.chantal.desc": "Casa de 4 habitaciones en Floyd, Virginia, en producción con dominio propio.",
      "work.magma.desc": "Consultoría de telecomunicaciones: landing aún en boceto.",
    },
  };

  var titleStrings = {
    es: "Portfolio | Francisco López",
  };

  var metaStrings = {
    es: {
      description:
        "Un portfolio de landings estáticas creadas por Francisco López: HTML, CSS y JS sin frameworks, sin CDN y sin build step, una carpeta por negocio.",
    },
  };

  var STORAGE_KEY = "flopez-portfolio-lang";
  var htmlEl = document.documentElement;
  var i18nNodes = document.querySelectorAll("[data-i18n]");
  var titleEl = document.querySelector("[data-i18n-title]");
  var metaNodes = document.querySelectorAll("[data-i18n-meta]");
  var langButtons = document.querySelectorAll(".lang-btn");

  // English text lives in the markup itself, so it only needs to be captured once
  // (before any swap) to be able to switch back to it later.
  var original = { strings: {}, title: titleEl ? titleEl.textContent : null, meta: {} };
  i18nNodes.forEach(function (node) {
    original.strings[node.getAttribute("data-i18n")] = node.textContent;
  });
  metaNodes.forEach(function (node) {
    original.meta[node.getAttribute("data-i18n-meta")] = node.getAttribute("content");
  });

  var applyLanguage = function (lang) {
    var dict = STRINGS[lang];

    i18nNodes.forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      var text = dict && dict[key] ? dict[key] : original.strings[key];
      node.textContent = text;
    });

    if (titleEl) {
      titleEl.textContent = lang === "es" && titleStrings.es ? titleStrings.es : original.title;
    }

    metaNodes.forEach(function (node) {
      var key = node.getAttribute("data-i18n-meta");
      var dictMeta = metaStrings[lang];
      var content = dictMeta && dictMeta[key] ? dictMeta[key] : original.meta[key];
      node.setAttribute("content", content);
    });

    htmlEl.setAttribute("lang", lang);

    langButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-lang") === lang));
    });
  };

  if (langButtons.length) {
    langButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var lang = button.getAttribute("data-lang");
        applyLanguage(lang);
        try {
          window.localStorage.setItem(STORAGE_KEY, lang);
        } catch (error) {
          // Storage unavailable (private mode, disabled) — the choice just won't
          // persist across visits, which is a fine degradation.
        }
      });
    });

    var initialLang = "en";
    var stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      // Ignore — falls through to browser-language detection below.
    }

    if (stored === "en" || stored === "es") {
      initialLang = stored;
    } else if (navigator.language && navigator.language.toLowerCase().indexOf("es") === 0) {
      // First visit only: honour the browser's language. Any manual choice above
      // is stored and always wins on later visits.
      initialLang = "es";
    }

    if (initialLang !== "en") {
      applyLanguage(initialLang);
    }
  }
})();
