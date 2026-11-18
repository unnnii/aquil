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

/* The nine competitions, in site order. `kind` decides which table an entry
 * goes to; `slug` is what the forms send and what ?event= matches. */
window.AQUIL_EVENTS = [
  { slug: 'table-tennis',     label: 'Table Tennis',      kind: 'individual' },
  { slug: 'carroms',          label: 'Carroms',           kind: 'team' },
  { slug: 'chess',            label: 'Chess',             kind: 'individual' },
  { slug: 'arm-wrestling',    label: 'Arm Wrestling',     kind: 'individual' },
  { slug: 'penalty-shootout', label: 'Penalty Shootout',  kind: 'individual' },
  { slug: 'throw-in-girls',   label: 'Throw In (Girls)',  kind: 'individual' },
  { slug: 'badminton',        label: 'Badminton',         kind: 'team' },
  { slug: 'football-7s',      label: 'Football 7-a-side', kind: 'team' },
  { slug: 'basketball-3s',    label: 'Basketball 3x3',    kind: 'team' }
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
