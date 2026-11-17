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

  /* Tick the event box named in ?event=<slug> --------------------------- */
  var boxes = document.querySelectorAll('input[data-event-box]');
  if (boxes.length) {
    var slug = null;
    try {
      slug = new URLSearchParams(window.location.search).get('event');
    } catch (e) {
      slug = null;
    }

    if (slug) {
      for (var i = 0; i < boxes.length; i++) {
        if (boxes[i].value === slug) { boxes[i].checked = true; break; }
      }
    }
  }

  /* Registration form: guard the dead endpoint, require an event -------- */
  var form = document.querySelector('[data-register-form]');
  if (form) {
    var notice = document.querySelector('[data-form-notice]');
    var unconnected = (form.getAttribute('action') || '').indexOf('REPLACE_ME') !== -1;

    if (unconnected) {
      if (notice) { notice.hidden = false; }
      var submit = form.querySelector('button[type="submit"]');
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Registration opens soon';
      }
    }

    var eventBoxes = form.querySelectorAll('input[data-event-box]');
    var eventError = form.querySelector('[data-events-error]');

    form.addEventListener('submit', function (e) {
      if (unconnected) {
        e.preventDefault();
        if (notice) {
          notice.hidden = false;
          try { notice.scrollIntoView({ block: 'center' }); } catch (err) {}
        }
        return;
      }

      var chosen = false;
      for (var j = 0; j < eventBoxes.length; j++) {
        if (eventBoxes[j].checked) { chosen = true; break; }
      }

      if (eventBoxes.length && !chosen) {
        e.preventDefault();
        if (eventError) { eventError.hidden = false; }
        eventBoxes[0].focus();
      } else if (eventError) {
        eventError.hidden = true;
      }
    });
  }

  /* Footer year --------------------------------------------------------- */
  var year = document.querySelector('[data-year]');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
