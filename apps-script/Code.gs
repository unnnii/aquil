/**
 * Heartian Hustle 3.0 — registration receiver
 * ===========================================
 *
 * A Google Apps Script web app that takes the two registration forms on the
 * site (register.html and register-team.html) and appends each submission as
 * a row in a Google Sheet.
 *
 * Setup and deployment steps are in the repo README, under
 * "Registration endpoint". Short version:
 *
 *   1. Open the Google Sheet that will hold the entries.
 *   2. Extensions > Apps Script, delete the stub, paste this file, save.
 *   3. Deploy > New deployment > Web app.
 *        Execute as:       Me
 *        Who has access:   Anyone
 *   4. Copy the /exec URL into the `action` of both forms on the site.
 *
 * After any edit to this file you must deploy again (Deploy > Manage
 * deployments > edit > Version: New version). Saving alone changes nothing
 * for the live URL.
 *
 * To use a spreadsheet that this script is not attached to, put its id in
 * CONFIG.SPREADSHEET_ID below and deploy the script standalone.
 */

var CONFIG = {
  /* Leave '' when the script lives inside the sheet (Extensions > Apps Script).
     Otherwise paste the id: the long string in the sheet's URL between /d/ and /edit. */
  SPREADSHEET_ID: '',

  SITE_URL: 'https://unnnii.github.io/aquil/',
  TIME_ZONE: 'Asia/Kolkata',

  INDIVIDUAL_SHEET: 'Individual entries',
  TEAM_SHEET: 'Team entries'
};

/**
 * Slugs are what the forms send; these are what the sheet shows. If an option
 * is added to either form, add its slug here too, or the sheet will show the
 * raw slug (still usable, just uglier).
 */
var LABELS = {
  course: {
    bcom: 'B.Com', bca: 'BCA', bba: 'BBA', ba: 'BA', bsc: 'B.Sc',
    psychology: 'Psychology', other: 'Other'
  },
  specialisation: { none: 'None', ca: 'CA', ba: 'BA', other: 'Other' },
  year: { '1': '1st year', '2': '2nd year', '3': '3rd year' },
  event: {
    'table-tennis': 'Table Tennis',
    'chess': 'Chess',
    'arm-wrestling': 'Arm Wrestling',
    'penalty-shootout': 'Penalty Shootout',
    'throw-in-girls': 'Throw In (Girls)',
    'carroms': 'Carroms',
    'badminton': 'Badminton',
    'football-7s': 'Football 7-a-side',
    'basketball-3s': 'Basketball 3x3'
  }
};

/**
 * One entry per column, in sheet order.
 *   header  the cell in row 1
 *   field   the form field name, or 'received' for the timestamp
 *   width   column width in pixels
 *   labels  key in LABELS, to turn slugs into readable text
 *   list    value can hold several slugs, joined by ", "
 *   number  number format; everything else is stored as plain text so that
 *           roll numbers keep leading zeros and phones stay unscientific
 */
var INDIVIDUAL = {
  sheet: CONFIG.INDIVIDUAL_SHEET,
  form: 'register.html',
  required: ['full_name', 'roll_number', 'course', 'year', 'phone'],
  echo: { field: 'events', labels: 'event', list: true, label: 'Events' },
  columns: [
    { header: 'Received', field: 'received', width: 150 },
    { header: 'Full name', field: 'full_name', width: 190 },
    { header: 'Roll number', field: 'roll_number', width: 130 },
    { header: 'Course', field: 'course', width: 110, labels: 'course' },
    { header: 'Specialisation', field: 'specialisation', width: 130, labels: 'specialisation' },
    { header: 'Year', field: 'year', width: 90, labels: 'year' },
    { header: 'Contact', field: 'phone', width: 140 },
    { header: 'Height (cm)', field: 'height_cm', width: 100, number: '0' },
    { header: 'Weight (kg)', field: 'weight_kg', width: 100, number: '0.0' },
    { header: 'Events', field: 'events', width: 260, labels: 'event', list: true },
    { header: 'Anything else', field: 'notes', width: 320 }
  ]
};

var TEAM = {
  sheet: CONFIG.TEAM_SHEET,
  form: 'register-team.html',
  required: ['event', 'team', 'captain', 'captain_roll', 'captain_course', 'captain_year', 'phone', 'squad'],
  echo: { field: 'event', labels: 'event', label: 'Event' },
  columns: [
    { header: 'Received', field: 'received', width: 150 },
    { header: 'Event', field: 'event', width: 150, labels: 'event' },
    { header: 'Team name', field: 'team', width: 170 },
    { header: 'Captain', field: 'captain', width: 170 },
    { header: 'Captain roll', field: 'captain_roll', width: 130 },
    { header: 'Captain course', field: 'captain_course', width: 120, labels: 'course' },
    { header: 'Captain year', field: 'captain_year', width: 110, labels: 'year' },
    { header: 'Contact', field: 'phone', width: 140 },
    { header: 'Squad', field: 'squad', width: 380 },
    { header: 'Anything else', field: 'notes', width: 320 }
  ]
};

/* ------------------------------------------------------------------ */
/* Requests                                                           */
/* ------------------------------------------------------------------ */

/**
 * Opening the /exec URL in a browser should say something sensible instead of
 * showing an error, so the deployed URL is easy to check.
 */
function doGet() {
  return html_({
    title: 'Registration receiver is live',
    lead: 'This page takes submissions from the Heartian Hustle 3.0 entry forms. ' +
          'Every entry that arrives is added to the attached Google Sheet.',
    linkHref: CONFIG.SITE_URL,
    linkLabel: 'Back to the site'
  });
}

function doPost(e) {
  var params = (e && e.parameters) || {};

  try {
    /* Honeypot: a hidden field a person never fills in. Bots do. Pretend it
       worked and store nothing, so the bot does not retry. */
    if (value_(params, '_gotcha')) {
      return html_({
        title: 'Entry received',
        lead: 'Your entry is in.',
        linkHref: CONFIG.SITE_URL,
        linkLabel: 'Back to the site'
      });
    }

    var spec = /team/i.test(value_(params, '_subject')) ? TEAM : INDIVIDUAL;

    var missing = spec.required.filter(function (name) {
      return !value_(params, name);
    });

    if (missing.length) {
      /* The forms mark these required in the browser, so this only happens
         when a submission was sent by something other than the form. */
      return html_({
        title: 'Entry not received',
        lead: 'Some details were missing, so nothing was saved. Please go back to the form and try again.',
        linkHref: CONFIG.SITE_URL + spec.form,
        linkLabel: 'Back to the form'
      });
    }

    var row = spec.columns.map(function (column) {
      return column.field === 'received' ? stamp_() : render_(params, column);
    });

    append_(spec, row);

    var echo = '';
    if (spec.echo) {
      var chosen = render_(params, spec.echo);
      if (chosen) {
        echo = '<p class="echo">' + escape_(spec.echo.label) + ': <strong>' +
               escape_(chosen) + '</strong></p>';
      }
    }

    return html_({
      title: 'Entry received',
      lead: 'Your entry is in. Nothing else is needed from you.',
      note: 'There is no confirmation email. Take a screenshot of this page if you want a record of what you sent.',
      extra: echo,
      linkHref: CONFIG.SITE_URL,
      linkLabel: 'Back to the site'
    });
  } catch (err) {
    /* Loud in the Apps Script execution log, quiet for the visitor. */
    console.error('Registration failed: ' + (err && err.message ? err.message : err));
    return html_({
      title: 'Something went wrong',
      lead: 'Your entry could not be saved. Please try again in a minute. If it keeps failing, tell an organiser.',
      linkHref: CONFIG.SITE_URL + (spec ? spec.form : ''),
      linkLabel: 'Back to the form'
    });
  }
}

/* ------------------------------------------------------------------ */
/* Sheet                                                              */
/* ------------------------------------------------------------------ */

function append_(spec, row) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); /* two people submitting at once must not share a row */
  try {
    var sheet = sheet_(spec);

    var next = sheet.getLastRow() + 1;
    var range = sheet.getRange(next, 1, 1, row.length);

    range.setValues([row]);
    range.setNumberFormats([spec.columns.map(function (column) {
      return column.number || '@';
    })]);
  } finally {
    lock.releaseLock();
  }
}

function sheet_(spec) {
  var book = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!book) {
    throw new Error('No spreadsheet. Set CONFIG.SPREADSHEET_ID, or attach this script to a sheet.');
  }

  var sheet = book.getSheetByName(spec.sheet);
  if (sheet) {
    /* Someone may have cleared the sheet and left it empty; put the headers
       back rather than letting the next entry overwrite row 1. */
    if (sheet.getLastRow() === 0) { headers_(sheet, spec); }
    return sheet;
  }

  sheet = book.insertSheet(spec.sheet);
  headers_(sheet, spec);

  return sheet;
}

function headers_(sheet, spec) {
  var headers = spec.columns.map(function (column) { return column.header; });

  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight('bold')
    .setBackground('#10131f')
    .setFontColor('#f7f8fa')
    .setWrap(true);

  spec.columns.forEach(function (column, i) {
    sheet.setColumnWidth(i + 1, column.width || 140);
  });

  sheet.setFrozenRows(1);

  /* Plain text from row 2 down, so a roll number typed later cannot lose its
     leading zeros the moment it is stored. */
  var rows = Math.max(sheet.getMaxRows() - 1, 1);
  spec.columns.forEach(function (column, i) {
    if (!column.number) {
      sheet.getRange(2, i + 1, rows, 1).setNumberFormat('@');
    }
  });
}

/* ------------------------------------------------------------------ */
/* Values                                                             */
/* ------------------------------------------------------------------ */

/** Read one field out of e.parameters and tidy it. */
function value_(params, name) {
  var raw = params[name];
  if (raw === undefined || raw === null) { return ''; }

  var list = Object.prototype.toString.call(raw) === '[object Array]' ? raw : [raw];
  var kept = list
    .map(function (item) { return String(item).trim(); })
    .filter(function (item) { return item !== ''; });

  return kept.join(', ');
}

/** Turn the stored value of one column into what the sheet should show. */
function render_(params, column) {
  var raw = value_(params, column.field);
  if (!raw) { return ''; }

  /* Height and weight become real numbers so they sort and filter as numbers
     rather than as text that happens to look like one. */
  if (column.number) {
    var number = Number(raw);
    return isNaN(number) ? raw : number;
  }

  var map = column.labels && LABELS[column.labels];
  if (!map) { return raw; }

  var parts = column.list ? raw.split(', ') : [raw];
  return parts.map(function (part) {
    return map[part] || part;
  }).join(', ');
}

function stamp_() {
  return Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, 'yyyy-MM-dd HH:mm:ss');
}

function escape_(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------------ */
/* Response                                                           */
/* ------------------------------------------------------------------ */

/**
 * A small page that borrows the site's type and colour, because this is the
 * last thing an entrant sees and it should not look like a Google error.
 */
function html_(opts) {
  var title = escape_(opts.title);
  var lead = escape_(opts.lead || '');
  var note = opts.note ? '<p class="note">' + escape_(opts.note) + '</p>' : '';
  var extra = opts.extra || '';
  var link = opts.linkHref
    ? '<a class="btn" href="' + escape_(opts.linkHref) + '">' + escape_(opts.linkLabel || 'Continue') + '</a>'
    : '';

  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html>\n' +
    '<html lang="en">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<meta name="robots" content="noindex">\n' +
    '<base target="_top">\n' +
    '<title>' + title + ', Heartian Hustle 3.0</title>\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500&family=Saira+Condensed:wght@800&display=swap" rel="stylesheet">\n' +
    '<style>\n' +
    '  :root { color-scheme: light dark; }\n' +
    '  * { box-sizing: border-box; }\n' +
    '  body { margin: 0; min-height: 100vh; display: grid; place-items: center;' +
    '    padding: 24px; background: #f7f8fa; color: #10131f;' +
    '    font-family: "Albert Sans", ui-sans-serif, system-ui, sans-serif; }\n' +
    '  .card { width: 100%; max-width: 30rem; border-top: 2px solid #10131f; padding: 28px 0 0; }\n' +
    '  .kicker { margin: 0 0 8px; font-size: 12px; letter-spacing: .08em;' +
    '    text-transform: uppercase; color: #5a6072; }\n' +
    '  h1 { margin: 0; font-family: "Saira Condensed", "Arial Narrow", sans-serif;' +
    '    font-weight: 800; font-size: clamp(2rem, 8vw, 3rem); line-height: .95;' +
    '    letter-spacing: -.015em; }\n' +
    '  p { margin: 16px 0 0; font-size: 1rem; line-height: 1.55; color: #3a4152; }\n' +
    '  .echo { padding: 12px 14px; background: #e9edf3; border-left: 3px solid #6aa329; }\n' +
    '  .note { font-size: .875rem; color: #5a6072; }\n' +
    '  .btn { display: inline-block; margin-top: 28px; padding: 12px 20px;' +
    '    background: #c8f751; color: #10131f; text-decoration: none;' +
    '    font-weight: 500; border-radius: 4px; }\n' +
    '  .btn:hover { background: #b6e63f; }\n' +
    '  .btn:focus-visible { outline: 2px solid #3e7a1f; outline-offset: 2px; }\n' +
    '  @media (prefers-color-scheme: dark) {\n' +
    '    body { background: #0d1220; color: #f2f4f8; }\n' +
    '    .card { border-top-color: #f2f4f8; }\n' +
    '    p { color: #b6bdcb; }\n' +
    '    .kicker, .note { color: #8e97a8; }\n' +
    '    .echo { background: #182033; border-left-color: #c8f751; }\n' +
    '  }\n' +
    '</style>\n</head>\n<body>\n' +
    '<main class="card">\n' +
    '  <p class="kicker">Heartian Hustle 3.0</p>\n' +
    '  <h1>' + title + '</h1>\n' +
    '  <p>' + lead + '</p>\n' +
    extra + '\n' + note + '\n' + link + '\n' +
    '</main>\n</body>\n</html>'
  )
    .setTitle(opts.title + ', Heartian Hustle 3.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
