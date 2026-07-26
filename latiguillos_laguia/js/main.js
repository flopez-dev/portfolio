// Entry point for this landing. No dependencies, no build step.

(function () {
  "use strict";

  // Mobile navigation toggle.
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    var mobile = window.matchMedia("(max-width: 640px)");

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

    mobile.addEventListener("change", sync);
    sync();
  }

  // Current year in the footer.
  var year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
