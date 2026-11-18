/* Heartian Hustle 3.0, progressive enhancement only. The site works without this file. */
(function () {
  'use strict';

  /* Mobile navigation --------------------------------------------------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* Read ?event=<slug> once ---------------------------------------------- */
  var slug = null;
  try {
    slug = new URLSearchParams(window.location.search).get('event');
  } catch (e) {
    slug = null;
  }

  /* ?event= preselect ----------------------------------------------------- */
  /* The individual form builds its participant rows in js/register.js, which
     reads ?event= itself. Only the team select is handled here. */
  var chosen = (window.AQUIL_EVENT_BY_SLUG || {})[slug];
  var usable = slug && (!chosen || !chosen.disabled);

  if (usable) {
    var boxes = document.querySelectorAll('input[data-event-box]');
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].value === slug) { boxes[i].checked = true; break; }
    }

    /* Team form: pick the matching event in the select ------------------- */
    var selects = document.querySelectorAll('select[data-event-select]');
    for (var s = 0; s < selects.length; s++) {
      var options = selects[s].options;
      for (var o = 0; o < options.length; o++) {
        if (options[o].value === slug) { selects[s].value = slug; break; }
      }
    }
  }

  /* Form submission lives in js/register.js ----------------------------- */
  /* It posts to Supabase and owns the validation messages, so there is no
     endpoint guard here any more. */

  /* Footer year --------------------------------------------------------- */
  var year = document.querySelector('[data-year]');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
