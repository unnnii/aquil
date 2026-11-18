/* Heartian Hustle 3.0 — Supabase connection.
 *
 * The publishable key is designed to be public: it can only do what row level
 * security allows, which is INSERT on the two entry tables and nothing else.
 * The service_role key is never used by the site and must not be added here.
 *
 * Change the two values below if the project ever moves.
 */
window.AQUIL_SUPABASE = {
  url: 'https://rbmmhasdshbgxhjmshdk.supabase.co',
  key: 'sb_publishable_0MqgKOCfdpS2RjkFNjLWnw_gQrVZmFL'
};

/* The competitions, in site order. kind decides which table an entry goes
 * to; slug is what the forms send and what ?event= matches.
 *
 * disabled: true hides an event from every page without deleting its code.
 * Set it back to false to bring the event back — no migration needed.
 *
 * minPlayers is the minimum number of players a team event needs. The
 * captain is a contact, not an automatic player: only the listed members
 * count. js/register.js and the team_entries_min_players constraint both
 * enforce it. */
window.AQUIL_EVENTS = [
  { slug: 'table-tennis',     label: 'Table Tennis',      kind: 'individual' },
  { slug: 'carroms',          label: 'Carroms',           kind: 'team', minPlayers: 2 },
  { slug: 'chess',            label: 'Chess',             kind: 'individual' },
  { slug: 'arm-wrestling',    label: 'Arm Wrestling',     kind: 'individual', disabled: true },
  { slug: 'penalty-shootout', label: 'Penalty Shootout',  kind: 'individual' },
  { slug: 'throw-in-girls',   label: 'Throw In (Girls)',  kind: 'individual', disabled: true },
  { slug: 'badminton-boys',   label: 'Badminton (Boys)',  kind: 'team', minPlayers: 2 },
  { slug: 'badminton-girls',  label: 'Badminton (Girls)', kind: 'team', minPlayers: 2 },
  { slug: 'football-7s',      label: 'Football 7-a-side', kind: 'team', minPlayers: 10 },
  { slug: 'basketball-3s',    label: 'Basketball 3x3',    kind: 'team', minPlayers: 3 }
];

/* Lookups, so no other file has to loop over the list. */
window.AQUIL_EVENT_BY_SLUG = {};
window.AQUIL_EVENTS.forEach(function (event) {
  window.AQUIL_EVENT_BY_SLUG[event.slug] = event;
});
window.AQUIL_ACTIVE_EVENTS = window.AQUIL_EVENTS.filter(function (event) {
  return !event.disabled;
});

/* Individual events are entered by batch captains, so the participant rows
 * offer only these. Team events live on the team form. */
window.AQUIL_INDIVIDUAL_EVENTS = window.AQUIL_ACTIVE_EVENTS.filter(function (event) {
  return event.kind === 'individual';
});

/* Courses and years, in form order. js/register.js builds the member rows
 * from these, so the forms do not repeat the lists. */
window.AQUIL_COURSES = [
  { value: 'bcom',       label: 'B.Com' },
  { value: 'bca',        label: 'BCA' },
  { value: 'bba',        label: 'BBA' },
  { value: 'ba',         label: 'BA' },
  { value: 'bsc',        label: 'B.Sc' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'other',      label: 'Other' }
];

/* The combined groups a batch can belong to. These replace specialisation:
 * a captain picks the one group their batch is under. The value is what the
 * database stores and checks; the label is what people read. */
window.AQUIL_GROUPS = [
  { value: 'bcom-tax-a-mcom',   label: 'B.Com Tax A & M.Com' },
  { value: 'bcom-tax-b',        label: 'B.Com Tax B' },
  { value: 'bcom-ca-msw',       label: 'B.Com CA & MSW' },
  { value: 'bcom-fa-msc-evs',   label: 'B.Com FA & M.Sc EVS' },
  { value: 'bcom-ba',           label: 'B.Com BA' },
  { value: 'bsc-msc-psy',       label: 'B.Sc & M.Sc Psy' },
  { value: 'bba-im-bsw',        label: 'BBA IM & BSW' },
  { value: 'bba-ba-lsm',        label: 'BBA BA & LSM' },
  { value: 'bca-msc-ai',        label: 'BCA + M.Sc AI' },
  { value: 'bsc-ca-bcom-tt-gt', label: 'B.Sc CA, B.Com TT & GT' },
  { value: 'ba-ma-eng-bsc-eco', label: 'BA, MA Eng & B.Sc Eco' }
];

window.AQUIL_YEARS = [
  { value: '1', label: '1st year' },
  { value: '2', label: '2nd year' },
  { value: '3', label: '3rd year' }
];

/* Stored values to readable text, for the admin console and its CSV. */
window.AQUIL_LABELS = {
  course: {
    bcom: 'B.Com', bca: 'BCA', bba: 'BBA', ba: 'BA', bsc: 'B.Sc',
    psychology: 'Psychology', other: 'Other'
  },
  year: { '1': '1st year', '2': '2nd year', '3': '3rd year' },
  group: {}
};

window.AQUIL_GROUPS.forEach(function (group) {
  window.AQUIL_LABELS.group[group.value] = group.label;
});
