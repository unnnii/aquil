/* Heartian Hustle 3.0 — registration submission.
 *
 * Two forms, two tables:
 *   individual events -> batch_entries, one row per batch, with every
 *                        participant and the event they are playing
 *   team events       -> team_entries, one row per team, with the rest of
 *                        the squad
 *
 * Both post straight to Supabase's REST API with the publishable key. The
 * database grants anon INSERT only, so this file cannot read anything back,
 * and a tampered request can only write a row that passes the CHECK
 * constraints.
 */
(function () {
  'use strict';

  var cfg = window.AQUIL_SUPABASE;
  var events = window.AQUIL_EVENTS || [];
  var bySlug = window.AQUIL_EVENT_BY_SLUG || {};
  var courses = window.AQUIL_COURSES || [];
  var groups = window.AQUIL_GROUPS || [];
  var years = window.AQUIL_YEARS || [];
  var individualEvents = window.AQUIL_INDIVIDUAL_EVENTS || [];
  if (!cfg) { return; }

  var LABELS = {};
  events.forEach(function (e) { LABELS[e.slug] = e.label; });
  groups.forEach(function (g) { LABELS[g.value] = g.label; });

  var eventOptions = individualEvents.map(function (e) {
    return { value: e.slug, label: e.label };
  });

  var preset = null;
  try {
    preset = new URLSearchParams(window.location.search).get('event');
  } catch (e) {
    preset = null;
  }
  if (preset && !bySlug[preset]) { preset = null; }

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
      return 'Some details were rejected. Check the phone number, roll number, group and events.';
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

  function send(table, form, payload, summary) {
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

  /* Shared row builders --------------------------------------------------- */

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    return node;
  }

  function field(labelText, control) {
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

  function rowShell(title) {
    var row = el('div', 'member');
    row.setAttribute('data-row', '');

    var head = el('div', 'member-head');

    var label = el('span', 'member-title');
    label.setAttribute('data-row-title', '');
    label.textContent = title;

    var remove = el('button', 'member-remove');
    remove.type = 'button';
    remove.setAttribute('data-row-remove', '');
    remove.setAttribute('aria-label', 'Remove this row');
    remove.textContent = '\u2212';

    head.appendChild(label);
    head.appendChild(remove);

    var grid = el('div', 'member-grid');

    row.appendChild(head);
    row.appendChild(grid);

    return { row: row, grid: grid };
  }

  /* Batch participants ---------------------------------------------------- */

  function participantRow(presetEvent) {
    var parts = rowShell('');
    parts.grid.appendChild(field('Name', textInput('participant_name', 'Full name')));
    parts.grid.appendChild(field('Year', selectBox('participant_year', years, 'Year')));
    parts.grid.appendChild(field('Roll number', textInput('participant_roll', 'e.g. 21BCA045')));
    parts.grid.appendChild(field('Event', selectBox('participant_event', eventOptions, 'Event')));

    if (presetEvent) {
      var select = parts.grid.querySelector('[name="participant_event"]');
      if (select) { select.value = presetEvent; }
    }

    return parts.row;
  }

  function participantsFrom(form) {
    var list = form.querySelector('[data-participants]') || form;
    return Array.prototype.slice.call(list.querySelectorAll('[data-row]'))
      .map(function (row) {
        var value = function (name) {
          var field = row.querySelector('[name="' + name + '"]');
          return field ? String(field.value || '').trim() : '';
        };
        return {
          name: value('participant_name'),
          year: value('participant_year'),
          roll: value('participant_roll'),
          event: value('participant_event')
        };
      })
      .filter(function (p) {
        return p.name || p.year || p.roll || p.event;
      });
  }

  function initParticipants(form) {
    var list = form.querySelector('[data-participants]');
    var addButton = form.querySelector('[data-participant-add]');
    var countLine = form.querySelector('[data-participants-count]');
    if (!list || !addButton) { return; }

    function rows() {
      return Array.prototype.slice.call(list.querySelectorAll('[data-row]'));
    }

    function update() {
      var all = rows();

      all.forEach(function (row, index) {
        var title = row.querySelector('[data-row-title]');
        if (title) { title.textContent = 'Participant ' + (index + 1); }
      });

      if (countLine) {
        var total = all.length;
        countLine.textContent = total + (total === 1 ? ' participant' : ' participants') +
          (total === 0 ? ' — add at least one' : '');
        countLine.setAttribute('data-ok', total > 0 ? 'true' : 'false');
      }
    }

    addButton.addEventListener('click', function () {
      var row = participantRow(null);
      list.appendChild(row);
      update();
      var input = row.querySelector('input');
      if (input) { input.focus(); }
    });

    list.addEventListener('click', function (e) {
      var button = e.target.closest ? e.target.closest('[data-row-remove]') : null;
      if (!button) { return; }
      var row = button.closest('[data-row]');
      if (row && row.parentNode) {
        row.parentNode.removeChild(row);
        update();
      }
    });

    /* Start with one row, pre-filled when the visitor arrived from an event. */
    var fromEvent = individualEvents.some(function (e) { return e.slug === preset; });
    list.appendChild(participantRow(fromEvent ? preset : null));
    update();
  }

  /* Team members ---------------------------------------------------------- */

  function memberRow() {
    var parts = rowShell('');
    parts.grid.appendChild(field('Name', textInput('member_name', 'Full name')));
    parts.grid.appendChild(field('Course', selectBox('member_course', courses, 'Course')));
    parts.grid.appendChild(field('Year', selectBox('member_year', years, 'Year')));
    parts.grid.appendChild(field('Roll number', textInput('member_roll', 'e.g. 21BCA045')));
    return parts.row;
  }

  function membersFrom(form) {
    var list = form.querySelector('[data-members]') || form;
    return Array.prototype.slice.call(list.querySelectorAll('[data-row]'))
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

  function initMembers(form) {
    var list = form.querySelector('[data-members]');
    var addButton = form.querySelector('[data-member-add]');
    var countLine = form.querySelector('[data-members-count]');
    var hintLine = form.querySelector('[data-members-hint]');
    var eventSelect = form.elements['event'];
    if (!list || !addButton || !eventSelect) { return; }

    function rows() {
      return Array.prototype.slice.call(list.querySelectorAll('[data-row]'));
    }

    function update() {
      var all = rows();

      all.forEach(function (row, index) {
        var title = row.querySelector('[data-row-title]');
        if (title) { title.textContent = 'Member ' + (index + 1); }
      });

      var chosen = !!bySlug[text(form, 'event')];
      var min = minimumFor(form);
      var total = all.length;

      if (hintLine) {
        hintLine.textContent = 'List every player, including the captain if they play.' +
          (chosen ? ' This event needs at least ' + min + '.' : '');
      }
      if (countLine) {
        countLine.textContent = total + (total === 1 ? ' player' : ' players') +
          (chosen && total < min ? ' — add ' + (min - total) + ' more' : '');
        countLine.setAttribute('data-ok', !chosen || total >= min ? 'true' : 'false');
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
      var button = e.target.closest ? e.target.closest('[data-row-remove]') : null;
      if (!button) { return; }
      var row = button.closest('[data-row]');
      if (row && row.parentNode) {
        row.parentNode.removeChild(row);
        update();
      }
    });

    eventSelect.addEventListener('change', function () {
      /* Top the list up to the new minimum; never remove what is typed. */
      var want = minimumFor(form);
      while (rows().length < want) { list.appendChild(memberRow()); }
      update();
    });

    if (eventSelect.value) {
      var start = minimumFor(form);
      for (var i = 0; i < start; i++) { list.appendChild(memberRow()); }
    }

    update();
  }

  /* Payloads -------------------------------------------------------------- */

  function batchPayload(form) {
    return {
      captain: text(form, 'captain'),
      captain_roll: text(form, 'captain_roll'),
      captain_class: text(form, 'captain_class'),
      captain_year: number(form, 'captain_year'),
      batch_group: text(form, 'batch_group'),
      phone: text(form, 'phone'),
      participants: participantsFrom(form)
    };
  }

  function teamPayload(form) {
    return {
      event: text(form, 'event'),
      team: text(form, 'team'),
      captain: text(form, 'captain'),
      captain_roll: text(form, 'captain_roll'),
      captain_course: text(form, 'captain_course'),
      captain_year: number(form, 'captain_year'),
      phone: text(form, 'phone'),
      members: membersFrom(form)
    };
  }

  /* Submit ---------------------------------------------------------------- */

  var forms = document.querySelectorAll('[data-register-form]');

  Array.prototype.forEach.call(forms, function (form) {
    var kind = form.getAttribute('data-form-kind');

    if (kind === 'team') { initMembers(form); }
    if (kind === 'batch') { initParticipants(form); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

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
        if (!team.event) {
          showError(form, 'Choose an event.');
          form.elements['event'].focus();
          return;
        }

        var min = minimumFor(form);
        var total = team.members.length;
        if (total < min) {
          showError(form, 'This event needs at least ' + min +
            ' players. Add ' + (min - total) + ' more.');
          var add = form.querySelector('[data-member-add]');
          if (add) { add.focus(); }
          return;
        }

        var incompleteTeam = team.members.some(function (member) {
          return !member.name || !member.roll || !member.course || !member.year;
        });
        if (incompleteTeam) {
          showError(form, 'Fill in name, course, year and roll number for every member.');
          return;
        }

        var teamLabel = LABELS[team.event] || team.event;
        send('team_entries', form, team, teamLabel + ' · ' + team.team);
        return;
      }

      var batch = batchPayload(form);
      if (!batch.batch_group) {
        showError(form, 'Choose your group.');
        form.elements['batch_group'].focus();
        return;
      }
      if (!batch.participants.length) {
        showError(form, 'Add at least one participant.');
        var addParticipant = form.querySelector('[data-participant-add]');
        if (addParticipant) { addParticipant.focus(); }
        return;
      }

      var incomplete = batch.participants.some(function (p) {
        return !p.name || !p.year || !p.roll || !p.event;
      });
      if (incomplete) {
        showError(form, 'Fill in name, year, roll number and event for every participant.');
        return;
      }

      var groupLabel = LABELS[batch.batch_group] || batch.batch_group;
      var count = batch.participants.length;
      send('batch_entries', form, batch,
        groupLabel + ' · ' + count + (count === 1 ? ' participant' : ' participants'));
    });
  });
})();
