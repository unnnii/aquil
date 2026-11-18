/* Heartian Hustle 3.0 — admin console.
 *
 * Username + password only. The password is checked in Postgres by
 * admin_login(), which returns a random session token. Every read goes
 * through admin_entries(), so the browser never holds a key that can read
 * the tables directly.
 */
(function () {
  'use strict';

  var cfg = window.AQUIL_SUPABASE;
  var EVENTS = window.AQUIL_ACTIVE_EVENTS || window.AQUIL_EVENTS || [];
  var ALL_EVENTS = window.AQUIL_EVENTS || [];
  var LABELS = window.AQUIL_LABELS || {};
  if (!cfg) { return; }

  var TOKEN_KEY = 'aquil_admin_token';

  var loginPanel = document.querySelector('[data-admin-login]');
  var appPanel = document.querySelector('[data-admin-app]');
  var loginForm = document.querySelector('[data-login-form]');
  var loginError = document.querySelector('[data-login-error]');

  var statsBox = document.querySelector('[data-admin-stats]');
  var table = document.querySelector('[data-admin-table]');
  var countLine = document.querySelector('[data-admin-count]');
  var appError = document.querySelector('[data-admin-error]');
  var searchBox = document.querySelector('[data-admin-search]');
  var eventSelect = document.querySelector('[data-admin-event]');
  var kindSelect = document.querySelector('[data-admin-kind]');

  var state = {
    token: null,
    data: { batch: [], team: [] },
    kind: 'batch',
    event: '',
    q: '',
    sortKey: 'created_at',
    sortDir: 'desc'
  };

  var COLUMNS = {
    batch: [
      { key: 'created_at', label: 'Received' },
      { key: 'captain', label: 'Captain' },
      { key: 'captain_roll', label: 'Roll' },
      { key: 'course', label: 'Course' },
      { key: 'batch_group', label: 'Group' },
      { key: 'phone', label: 'Contact' },
      { key: 'participants', label: 'Participants' },
      { key: 'notes', label: 'Notes' }
    ],
    team: [
      { key: 'created_at', label: 'Received' },
      { key: 'event', label: 'Event' },
      { key: 'team', label: 'Team' },
      { key: 'captain', label: 'Captain' },
      { key: 'captain_roll', label: 'Roll' },
      { key: 'phone', label: 'Contact' },
      { key: 'members', label: 'Members' },
      { key: 'notes', label: 'Notes' }
    ]
  };

  function memberText(list) {
    return (list || []).map(function (m) {
      var bits = [m && m.name];
      if (m && m.roll) { bits.push(m.roll); }
      if (m && m.course) { bits.push((LABELS.course && LABELS.course[m.course]) || m.course); }
      if (m && m.year) { bits.push((LABELS.year && LABELS.year[String(m.year)]) || m.year); }
      return bits.filter(Boolean).join(' · ');
    });
  }

  function participantText(list) {
    return (list || []).map(function (p) {
      var bits = [p && p.name];
      if (p && p.roll) { bits.push(p.roll); }
      if (p && p.class) { bits.push((LABELS.year && LABELS.year[String(p.class)]) || ('Class ' + p.class)); }
      if (p && p.event) { bits.push(label(p.event)); }
      return bits.filter(Boolean).join(' · ');
    });
  }

  function groupLabel(slug) {
    return (LABELS.group && LABELS.group[slug]) || slug;
  }

  function label(slug) {
    for (var i = 0; i < ALL_EVENTS.length; i++) {
      if (ALL_EVENTS[i].slug === slug) { return ALL_EVENTS[i].label; }
    }
    return slug;
  }

  function rpc(name, body) {
    return fetch(cfg.url + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: {
        apikey: cfg.key,
        Authorization: 'Bearer ' + cfg.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(function (response) {
      return response.text().then(function (raw) {
        var data = null;
        try { data = raw ? JSON.parse(raw) : null; } catch (e) { data = null; }
        if (response.ok) { return data; }

        var message = (data && data.message) || '';
        var error = new Error(message || 'Request failed');
        error.unauthorised = message.indexOf('unauthorised') !== -1;
        error.locked = message.indexOf('locked') !== -1;
        error.setup = message.indexOf('Could not find') !== -1;
        if (error.setup) {
          error.message = 'The database is not set up yet. Run supabase/schema.sql in the SQL editor.';
        }
        throw error;
      });
    });
  }

  /* Sign in ------------------------------------------------------------- */

  function showLoginError(message) {
    if (!loginError) { return; }
    loginError.textContent = message;
    loginError.hidden = false;
  }

  function clearLoginError() {
    if (!loginError) { return; }
    loginError.hidden = true;
    loginError.textContent = '';
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearLoginError();

    var button = loginForm.querySelector('button[type="submit"]');
    var username = String(loginForm.elements['username'].value || '').trim();
    var password = String(loginForm.elements['password'].value || '');

    if (!username || !password) {
      showLoginError('Enter your username and password.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Signing in…';

    rpc('admin_login', { p_username: username, p_password: password })
      .then(function (token) {
        if (!token) { throw new Error('Wrong username or password.'); }
        state.token = token;
        try { sessionStorage.setItem(TOKEN_KEY, token); } catch (err) {}
        loginForm.reset();
        return load();
      })
      .catch(function (err) {
        showLoginError(err.locked
          ? 'Too many attempts. Try again in 15 minutes.'
          : (err.message || 'Could not sign in.'));
      })      .then(function () {
        button.disabled = false;
        button.textContent = 'Sign in';
      });
  });

  /* Load ---------------------------------------------------------------- */

  function showApp() {
    if (loginPanel) { loginPanel.hidden = true; }
    if (appPanel) { appPanel.hidden = false; }
  }

  function showLogin() {
    if (appPanel) { appPanel.hidden = true; }
    if (loginPanel) { loginPanel.hidden = false; }
  }

  function signOut(silent) {
    var token = state.token;
    state.token = null;
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) {}
    if (token && !silent) {
      rpc('admin_logout', { p_token: token }).catch(function () {});
    }
    showLogin();
  }

  function load() {
    if (appError) { appError.hidden = true; }
    return rpc('admin_entries', { p_token: state.token })
      .then(function (data) {
        state.data = {
          batch: (data && data.batch) || [],
          team: (data && data.team) || []
        };
        showApp();
        render();
      })
      .catch(function (err) {
        if (err.unauthorised) {
          signOut(true);
          showLoginError('Your session expired. Sign in again.');
          return;
        }
        showApp();
        if (appError) {
          appError.textContent = 'Could not load entries. ' + (err.message || '');
          appError.hidden = false;
        }
      });
  }

  /* Filters ------------------------------------------------------------- */

  EVENTS.forEach(function (event) {
    var option = document.createElement('option');
    option.value = event.slug;
    option.textContent = event.label;
    eventSelect.appendChild(option);
  });

  searchBox.addEventListener('input', function () {
    state.q = searchBox.value;
    render();
  });

  eventSelect.addEventListener('change', function () {
    state.event = eventSelect.value;
    if (state.event) {
      for (var i = 0; i < EVENTS.length; i++) {
        if (EVENTS[i].slug === state.event) {
          state.kind = EVENTS[i].kind === 'team' ? 'team' : 'batch';
          kindSelect.value = state.kind;
        }
      }
    }
    render();
  });

  kindSelect.addEventListener('change', function () {
    state.kind = kindSelect.value;
    render();
  });

  document.querySelector('[data-admin-reset]').addEventListener('click', function () {
    state.q = '';
    state.event = '';
    searchBox.value = '';
    eventSelect.value = '';
    render();
  });

  document.querySelector('[data-admin-refresh]').addEventListener('click', load);
  document.querySelector('[data-admin-logout]').addEventListener('click', function () { signOut(false); });

  /* Render -------------------------------------------------------------- */

  function haystack(row) {
    var parts = Object.keys(row).map(function (key) {
      var value = row[key];
      if (key === 'members') { return memberText(value).join(' '); }
      if (key === 'participants') { return participantText(value).join(' '); }
      if (Array.isArray(value)) { return value.map(label).join(' '); }
      if (key === 'event') { return label(value); }
      return String(value == null ? '' : value);
    });

    /* Also index what the table actually shows, so "Table Tennis", "BCA"
       and "2nd year" match a row that stores a slug or a code. */
    ['course', 'captain_course', 'batch_group', 'year', 'captain_year']
      .forEach(function (key) {
        if (row[key] !== undefined) { parts.push(cellValue(row, key)); }
      });

    return parts.join(' ').toLowerCase();
  }

  function compare(a, b) {
    var dir = state.sortDir === 'asc' ? 1 : -1;
    var av = a[state.sortKey];
    var bv = b[state.sortKey];

    if (state.sortKey === 'participants') {
      av = participantText(a.participants).join(' ');
      bv = participantText(b.participants).join(' ');
    }

    if (Array.isArray(av)) { av = av.join(', '); }
    if (Array.isArray(bv)) { bv = bv.join(', '); }
    if (av == null) { av = ''; }
    if (bv == null) { bv = ''; }

    if (state.sortKey === 'created_at') {
      return (new Date(av).getTime() - new Date(bv).getTime()) * dir;
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * dir;
    }
    return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
  }

  function visibleRows() {
    var source = state.data[state.kind] || [];
    var q = state.q.trim().toLowerCase();

    return source.filter(function (row) {
      if (state.event) {
        if (state.kind === 'batch') {
          var playing = (row.participants || []).some(function (p) {
            return p && p.event === state.event;
          });
          if (!playing) { return false; }
        } else if (row.event !== state.event) {
          return false;
        }
      }
      return !q || haystack(row).indexOf(q) !== -1;
    }).sort(compare);
  }

  function formatDate(value) {
    if (!value) { return '—'; }
    var date = new Date(value);
    if (isNaN(date.getTime())) { return String(value); }
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  function cellValue(row, key) {
    if (key === 'created_at') { return formatDate(row.created_at); }
    if (key === 'event') { return label(row.event); }
    if (key === 'members') {
      return memberText(row.members).join('\n') || '—';
    }
    if (key === 'participants') {
      return participantText(row.participants).join('\n') || '—';
    }
    if (key === 'batch_group') { return groupLabel(row.batch_group); }
    var value = row[key];
    if (value === null || value === undefined || value === '') { return '—'; }

    if (key === 'course' || key === 'captain_course') {
      return (LABELS.course && LABELS.course[value]) || String(value);
    }
    if (key === 'specialisation') {
      return (LABELS.specialisation && LABELS.specialisation[value]) || String(value);
    }
    if (key === 'year' || key === 'captain_year') {
      return (LABELS.year && LABELS.year[String(value)]) || String(value);
    }
    return String(value);
  }

  function renderStats() {
    var batch = state.data.batch.length;
    var team = state.data.team.length;

    var entries = [
      { label: 'Batch entries', value: batch },
      { label: 'Team entries', value: team },
      { label: 'Total', value: batch + team }
    ];

    EVENTS.forEach(function (event) {
      var count;
      if (event.kind === 'individual') {
        count = state.data.batch.filter(function (row) {
          return (row.participants || []).some(function (p) {
            return p && p.event === event.slug;
          });
        }).length;
      } else {
        count = state.data.team.filter(function (row) {
          return row.event === event.slug;
        }).length;
      }
      entries.push({ label: event.label, value: count });
    });

    statsBox.textContent = '';
    entries.forEach(function (entry) {
      var wrap = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = entry.label;
      dd.textContent = String(entry.value);
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      statsBox.appendChild(wrap);
    });
  }

  function renderTable(rows) {
    var columns = COLUMNS[state.kind];
    table.textContent = '';

    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');

    columns.forEach(function (column) {
      var th = document.createElement('th');
      th.scope = 'col';

      if (column.sortable === false) {
        th.textContent = column.label;
      } else {
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = column.label +
          (state.sortKey === column.key ? (state.sortDir === 'asc' ? ' ↑' : ' ↓') : '');
        button.addEventListener('click', function () {
          if (state.sortKey === column.key) {
            state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            state.sortKey = column.key;
            state.sortDir = column.key === 'created_at' ? 'desc' : 'asc';
          }
          render();
        });
        th.appendChild(button);
      }
      headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');

    if (!rows.length) {
      var empty = document.createElement('tr');
      var cell = document.createElement('td');
      cell.colSpan = columns.length;
      cell.textContent = 'No entries yet.';
      cell.className = 'hint';
      empty.appendChild(cell);
      tbody.appendChild(empty);
    } else {
      rows.forEach(function (row) {
        var tr = document.createElement('tr');

        columns.forEach(function (column) {
          var td = document.createElement('td');
          var value = cellValue(row, column.key);

          if (column.key === 'phone') {
            var link = document.createElement('a');
            link.href = 'tel:' + String(value).replace(/[^\d+]/g, '');
            link.textContent = value;
            td.appendChild(link);
          } else if (column.key === 'members' || column.key === 'participants') {
            var squad = document.createElement('span');
            squad.className = 'label';
            squad.style.whiteSpace = 'pre-line';
            squad.textContent = value;
            td.appendChild(squad);
          } else {
            td.textContent = value;
          }

          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
  }

  function csv() {
    var rows = visibleRows();
    var columns = COLUMNS[state.kind];

    var lines = [columns.map(function (column) {
      return quote(column.label);
    }).join(',')];

    rows.forEach(function (row) {
      lines.push(columns.map(function (column) {
        if (column.key === 'participants') {
          return quote(participantText(row.participants).join(' | '));
        }
        if (column.key === 'event') { return quote(label(row.event)); }
        if (column.key === 'created_at') { return quote(row.created_at); }
        return quote(cellValue(row, column.key));
      }).join(','));
    });

    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'heartian-hustle-' + state.kind + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function quote(value) {
    return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
  }

  document.querySelector('[data-admin-csv]').addEventListener('click', csv);

  function render() {
    var rows = visibleRows();
    renderStats();
    renderTable(rows);

    if (countLine) {
      var bits = [rows.length + (rows.length === 1 ? ' entry' : ' entries')];
      bits.push(state.kind === 'team' ? 'team' : 'batch');
      if (state.event) { bits.push(label(state.event)); }
      if (state.q) { bits.push('matching “' + state.q + '”'); }
      countLine.textContent = bits.join(' · ');
    }
  }

  /* Boot ---------------------------------------------------------------- */

  try { state.token = sessionStorage.getItem(TOKEN_KEY); } catch (e) { state.token = null; }

  if (state.token) {
    load();
  } else {
    showLogin();
  }
})();
