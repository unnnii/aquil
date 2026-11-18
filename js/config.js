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
 * minPlayers is the minimum squad size for a team event, counting the
 * captain. js/register.js and the team_entries_min_players check constraint
 * both enforce it. */
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

/* Courses and years, in form order. js/register.js builds the member rows
 * from these, so the team form does not repeat the lists a third time. */
window.AQUIL_COURSES = [
  { value: 'bcom',       label: 'B.Com' },
  { value: 'bca',        label: 'BCA' },
  { value: 'bba',        label: 'BBA' },
  { value: 'ba',         label: 'BA' },
  { value: 'bsc',        label: 'B.Sc' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'other',      label: 'Other' }
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
  specialisation: { none: 'None', ca: 'CA', ba: 'BA', other: 'Other' },
  year: { '1': '1st year', '2': '2nd year', '3': '3rd year' }
};
