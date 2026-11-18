/* Heartian Hustle 3.0 — registration submission.
 *
 * Both forms post straight to Supabase's REST API with the publishable key.
 * The database grants anon INSERT only, so this file cannot read anything
 * back, and a tampered request can only write an entry that passes the
 * table's CHECK constraints.
 *
 * Team events send a members array: everyone except the captain, each with
 * name, course, year and roll. The captain counts as the extra player, and
 * minPlayers in js/config.js is the minimum total.
 */
(function () {
  'use strict';

  var cfg = window.AQUIL_SUPABASE;
  var events = window.AQUIL_EVENTS || [];
  var bySlug = window.AQUIL_EVENT_BY_SLUG || {};
  var courses = window.AQUIL_COURSES || [];
  var years = window.AQUIL_YEARS || [];
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
      return 'Some details were rejected. Check the phone number, roll number and your team size.';
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
        events: chosen,
        notes: text(form, 'notes') || null
      }
    };
  }

  /* Team member rows ----------------------------------------------------- */

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    return node;
  }

  function labeled(labelText, control) {
    var wrap = el('div', 'field');
    var label = el('span', 'member-label');
    label.textContent = labelText;
    wrap.appendChild(label);
    wrap.appendChild(control);
    return wrap;
  }

  function textInput(name, placeholder) {
    var input = el('input');
    input.type = 'text';
    input.name = name;
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    return input;
  }

  function selectBox(name, options, placeholder) {
    var select = el('select');
    select.name = name;

    var first = el('option');
    first.value = '';
    first.textContent = placeholder;
    select.appendChild(first);

    options.forEach(function (option) {
      var node = el('option');
      node.value = option.value;
      node.textContent = option.label;
      select.appendChild(node);
    });

    return select;
  }

  function memberRow() {
    var row = el('div', 'member');
    row.setAttribute('data-member', '');

    var head = el('div', 'member-head');

    var title = el('span', 'member-title');
    title.setAttribute('data-member-title', '');

    var remove = el('button', 'member-remove');
    remove.type = 'button';
    remove.setAttribute('data-member-remove', '');
    remove.setAttribute('aria-label', 'Remove this member');
    remove.textContent = '\u2212';

    head.appendChild(title);
    head.appendChild(remove);

    var grid = el('div', 'member-grid');
    grid.appendChild(labeled('Name', textInput('member_name', 'Full name')));
    grid.appendChild(labeled('Course', selectBox('member_course', courses, 'Course')));
    grid.appendChild(labeled('Year', selectBox('member_year', years, 'Year')));
    grid.appendChild(labeled('Roll number', textInput('member_roll', 'e.g. 21BCA045')));

    row.appendChild(head);
    row.appendChild(grid);
    return row;
  }

  function membersFrom(form) {
    return Array.prototype.slice.call(form.querySelectorAll('[data-member]'))
      .map(function (row) {
        var value = function (name) {
          var field = row.querySelector('[name="' + name + '"]');
          return field ? String(field.value || '').trim() : '';
        };
        return {
          name: value('member_name'),
          course: value('member_course'),
          year: value('member_year') ? Number(value('member_year')) : null,
          roll: value('member_roll')
        };
      })
      .filter(function (member) {
        return member.name || member.course || member.year || member.roll;
      });
  }

  function minimumFor(form) {
    var event = bySlug[text(form, 'event')];
    return (event && event.minPlayers) || 2;
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
        members: membersFrom(form),
        notes: text(form, 'notes') || null
      }
    };
  }

  function initMembers(form) {
    var list = form.querySelector('[data-members]');
    var addButton = form.querySelector('[data-member-add]');
    var countLine = form.querySelector('[data-members-count]');
    var hintLine = form.querySelector('[data-members-hint]');
    var eventSelect = form.elements['event'];
    if (!list || !addButton || !eventSelect) { return; }

    function rows() {
      return Array.prototype.slice.call(list.querySelectorAll('[data-member]'));
    }

    function update() {
      var all = rows();

      all.forEach(function (row, index) {
        var title = row.querySelector('[data-member-title]');
        if (title) { title.textContent = 'Member ' + (index + 1); }
      });

      var min = minimumFor(form);
      var total = all.length + 1;

      if (hintLine) {
        hintLine.textContent = 'The captain counts as one player. This event needs at least ' +
          min + '.';
      }
      if (countLine) {
        countLine.textContent = total + (total === 1 ? ' player' : ' players') +
          (total < min ? ' \u2014 add ' + (min - total) + ' more' : '');
        countLine.setAttribute('data-ok', total >= min ? 'true' : 'false');
      }
    }

    addButton.addEventListener('click', function () {
      var row = memberRow();
      list.appendChild(row);
      update();
      var input = row.querySelector('input');
      if (input) { input.focus(); }
    });

    list.addEventListener('click', function (e) {
      var button = e.target.closest ? e.target.closest('[data-member-remove]') : null;
      if (!button) { return; }
      var row = button.closest('[data-member]');
      if (row && row.parentNode) {
        row.parentNode.removeChild(row);
        update();
      }
    });

    eventSelect.addEventListener('change', function () {
      /* Top the list up to the new minimum; never remove what is typed. */
      var want = minimumFor(form) - 1;
      while (rows().length < want) { list.appendChild(memberRow()); }
      update();
    });

    /* Start with enough rows for an event already chosen by ?event= */
    if (eventSelect.value) {
      var start = minimumFor(form) - 1;
      for (var i = 0; i < start; i++) { list.appendChild(memberRow()); }
    }

    update();
  }

  var forms = document.querySelectorAll('[data-register-form]');

  Array.prototype.forEach.call(forms, function (form) {
    if (form.getAttribute('data-form-kind') === 'team') { initMembers(form); }

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

        var min = minimumFor(form);
        var total = team.payload.members.length + 1;
        if (total < min) {
          showError(form, 'This event needs at least ' + min +
            ' players including the captain. Add ' + (min - total) + ' more.');
          var add = form.querySelector('[data-member-add]');
          if (add) { add.focus(); }
          return;
        }

        var incomplete = team.payload.members.some(function (member) {
          return !member.name || !member.roll || !member.course || !member.year;
        });
        if (incomplete) {
          showError(form, 'Fill in name, course, year and roll number for every member.');
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
