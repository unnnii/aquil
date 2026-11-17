/* Aquil Open, progressive enhancement only. The site works without this file. */
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

  /* Preselect the competition from ?event=<slug> ------------------------ */
  var select = document.querySelector('[data-event-select]');
  if (select) {
    var slug = null;
    try {
      slug = new URLSearchParams(window.location.search).get('event');
    } catch (e) {
      slug = null;
    }

    if (slug) {
      var matched = false;
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === slug) {
          select.value = slug;
          matched = true;
          break;
        }
      }
      if (!matched) {
        for (var j = 0; j < select.options.length; j++) {
          if (select.options[j].value === 'other') { select.value = 'other'; break; }
        }
      }
    }
  }

  /* Registration guard: block submit while the Formspree ID is missing -- */
  var form = document.querySelector('[data-register-form]');
  var notice = document.querySelector('[data-form-notice]');
  if (form) {
    var action = form.getAttribute('action') || '';
    if (action.indexOf('REPLACE_ME') !== -1) {
      if (notice) { notice.hidden = false; }
      var submit = form.querySelector('button[type="submit"]');
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Registration opens soon';
      }
    }
  }

  /* Footer year --------------------------------------------------------- */
  var year = document.querySelector('[data-year]');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
