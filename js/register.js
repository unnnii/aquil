/* Heartian Hustle 3.0 — registration submission.
 *
 * Both forms post straight to Supabase's REST API with the publishable key.
 * The database grants anon INSERT only, so this file cannot read anything
 * back, and a tampered request can only write an entry that passes the
 * table's CHECK constraints.
 *
 * Replaces the old form action entirely: the markup keeps a plain POST
 * fallback, but this script is what actually submits.
 */
(function () {
  'use strict';

  var cfg = window.AQUIL_SUPABASE;
  var events = window.AQUIL_EVENTS || [];
  if (!cfg) { return; }

  var LABELS = {};
  events.forEach(function (e) { LABELS[e.slug] = e.label; });

  function api(path) { return cfg.url + '/rest/v1/' + path; }

  function headers() {
    return {
      apikey: cfg.key,
      Authorization: 'Bearer ' + cfg.key,
      'Content-Type': 'application/json'
    };
  }

  function text(form, name) {
    var value = form.elements[name];
    if (!value) { return ''; }
    return String(value.value || '').trim();
  }

  function number(form, name) {
    var raw = text(form, name);
    return raw === '' ? null : Number(raw);
  }

  function digits(value) { return String(value || '').replace(/\D/g, ''); }

  function errorMessage(response, body) {
    var code = body && body.code;
    if (response.status === 401 || response.status === 403) {
      return 'The site is not allowed to save entries right now. Tell an organiser.';
    }
    if (code === 'PGRST205' || response.status === 404) {
      return 'Registration is not set up yet. Tell an organiser the database tables are missing.';
    }
    if (code === '23514' || response.status === 400) {
      return 'Some details were rejected. Check the phone number, roll number and the events you picked.';
    }
    if (response.status === 429) {
      return 'Too many entries in a short time. Wait a minute and try again.';
    }
    if (response.status >= 500) {
      return 'The server had a problem. Try again in a minute.';
    }
    return 'Your entry could not be saved. Try again, or tell an organiser.';
  }

  function showError(form, message) {
    var box = form.parentNode.querySelector('[data-form-status]');
    if (!box) { return; }
    box.textContent = message;
    box.hidden = false;
    try { box.scrollIntoView({ block: 'center' }); } catch (e) {}
  }

  function clearError(form) {
    var box = form.parentNode.querySelector('[data-form-status]');
    if (box) { box.hidden = true; box.textContent = ''; }
  }

  function showSuccess(form, summary) {
    var panel = form.parentNode.querySelector('[data-form-success]');
    var detail = panel && panel.querySelector('[data-form-success-detail]');
    if (detail) { detail.textContent = summary; }
    form.hidden = true;
    if (panel) {
      panel.hidden = false;
      try { panel.scrollIntoView({ block: 'center' }); } catch (e) {}
    }
  }

  function busy(form, on) {
    var submit = form.querySelector('button[type="submit"]');
    if (!submit) { return; }
    if (on) {
      submit.dataset.label = submit.textContent;
      submit.textContent = 'Sending…';
      submit.disabled = true;
    } else {
      submit.textContent = submit.dataset.label || 'Submit';
      submit.disabled = false;
    }
  }

  function send(form, payload, summary) {
    var table = form.getAttribute('data-form-kind') === 'team'
      ? 'team_entries'
      : 'individual_entries';

    busy(form, true);
    clearError(form);

    fetch(api(table), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (response.ok) {
        showSuccess(form, summary);
        return null;
      }
      return response.json().catch(function () { return {}; })
        .then(function (body) { throw new Error(errorMessage(response, body)); });
    }).catch(function (err) {
      showError(form, err && err.message
        ? err.message
        : 'Could not reach the server. Check your connection and try again.');
    }).then(function () {
      busy(form, false);
    });
  }

  function individualPayload(form) {
    var chosen = Array.prototype.slice
      .call(form.querySelectorAll('input[name="events"]:checked'))
      .map(function (box) { return box.value; });

    return {
      chosen: chosen,
      payload: {
        full_name: text(form, 'full_name'),
        roll_number: text(form, 'roll_number'),
        course: text(form, 'course'),
        specialisation: text(form, 'specialisation') || null,
        year: number(form, 'year'),
        phone: text(form, 'phone'),
        height_cm: number(form, 'height_cm'),
        weight_kg: number(form, 'weight_kg'),
        events: chosen,
        notes: text(form, 'notes') || null
      }
    };
  }

  function teamPayload(form) {
    return {
      payload: {
        event: text(form, 'event'),
        team: text(form, 'team'),
        captain: text(form, 'captain'),
        captain_roll: text(form, 'captain_roll'),
        captain_course: text(form, 'captain_course'),
        captain_year: number(form, 'captain_year'),
        phone: text(form, 'phone'),
        squad: text(form, 'squad'),
        notes: text(form, 'notes') || null
      }
    };
  }

  var forms = document.querySelectorAll('[data-register-form]');

  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      var kind = form.getAttribute('data-form-kind');
      clearError(form);

      /* Honeypot: a person never fills this in. Pretend it worked. */
      var trap = form.elements['_gotcha'];
      if (trap && String(trap.value || '').trim() !== '') {
        showSuccess(form, 'Your entry is in.');
        return;
      }

      var phone = digits(text(form, 'phone'));
      if (phone.length < 7 || phone.length > 15) {
        showError(form, 'Enter a contact number with 7 to 15 digits.');
        form.elements['phone'].focus();
        return;
      }

      if (kind === 'team') {
        var team = teamPayload(form);
        if (!team.payload.event) {
          showError(form, 'Choose an event.');
          form.elements['event'].focus();
          return;
        }
        var teamLabel = LABELS[team.payload.event] || team.payload.event;
        send(form, team.payload, teamLabel + ' · ' + team.payload.team);
        return;
      }

      var individual = individualPayload(form);
      var eventsError = form.querySelector('[data-events-error]');

      if (!individual.chosen.length) {
        if (eventsError) { eventsError.hidden = false; }
        var firstBox = form.querySelector('input[name="events"]');
        if (firstBox) { firstBox.focus(); }
        return;
      }
      if (eventsError) { eventsError.hidden = true; }

      var summary = individual.payload.full_name + ' · ' + individual.chosen
        .map(function (slug) { return LABELS[slug] || slug; })
        .join(', ');

      send(form, individual.payload, summary);
    });
  });
})();
