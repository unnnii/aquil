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

  /* Individual form: tick the matching box ------------------------------- */
  if (slug) {
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

  /* Both forms: guard the dead endpoint, require an event ---------------- */
  var forms = document.querySelectorAll('[data-register-form]');

  for (var f = 0; f < forms.length; f++) {
    (function (form) {
      var notice = form.parentNode.querySelector('[data-form-notice]');
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
    })(forms[f]);
  }

  /* Height and weight: only for physical events --------------------------- */
  /* Chess alone carries no bracket or class, so the two fields stop being
     required and their hint says so. Every other individual event keeps them. */
  var bodyFields = document.querySelectorAll('[data-body-field]');
  var bodyBoxes = document.querySelectorAll('input[data-body="required"]');
  var bodyHint = document.querySelector('[data-body-hint]');

  if (bodyFields.length && bodyBoxes.length) {
    var syncBody = function () {
      var needed = false;
      for (var b = 0; b < bodyBoxes.length; b++) {
        if (bodyBoxes[b].checked) { needed = true; break; }
      }
      for (var d = 0; d < bodyFields.length; d++) {
        bodyFields[d].required = needed;
      }
      if (bodyHint) {
        bodyHint.textContent = needed
          ? 'Needed for arm wrestling and the other physical events.'
          : 'Only needed for physical events, so chess on its own does not ask for them.';
      }
    };

    for (var c = 0; c < bodyBoxes.length; c++) {
      bodyBoxes[c].addEventListener('change', syncBody);
    }
    syncBody();
  }

  /* Light and dark mode --------------------------------------------------- */
  /* The mode itself is set before first paint by an inline script in the
     head; this only drives the button, the label and the browser chrome. */
  var modeBtn = document.querySelector('[data-mode-toggle]');

  if (modeBtn) {
    var root = document.documentElement;
    var modeLabel = modeBtn.querySelector('[data-mode-label]');
    var themeMeta = document.querySelector('meta[name="theme-color"]');

    var paintMode = function () {
      var dark = root.getAttribute('data-mode') === 'dark';
      if (modeLabel) { modeLabel.textContent = dark ? 'Light' : 'Dark'; }
      modeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');

      if (themeMeta) {
        var paper = getComputedStyle(root).getPropertyValue('--color-paper').trim();
        if (paper) {
          try {
            var probe = document.createElement('canvas').getContext('2d');
            probe.fillStyle = paper;
            themeMeta.setAttribute('content', probe.fillStyle);
          } catch (err) {
            themeMeta.setAttribute('content', paper);
          }
        }
      }
    };

    paintMode();

    modeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-mode', next);
      try { localStorage.setItem('mode', next); } catch (e) {}
      paintMode();
    });
  }

  /* Footer year --------------------------------------------------------- */
  var year = document.querySelector('[data-year]');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
