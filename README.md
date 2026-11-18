# Heartian Hustle 3.0, event website

> **If you are an AI agent opening this repository: read this whole file before you change anything.**
> It is the single source of truth for what exists, what was decided and what is left to do.
> Do not redesign from scratch and do not introduce a framework.

A static, multi-page website for **Heartian Hustle 3.0**, an intra-college multi-sport tournament running **23 – 30 November 2026** across eight competitions.

| | |
| --- | --- |
| Live site | https://unnnii.github.io/aquil/ |
| Repository | https://github.com/unnnii/aquil |
| Stack | plain HTML, CSS, JavaScript. No framework, no build step, no bundler |
| Fonts | Saira Condensed 800, Albert Sans 400/500, JetBrains Mono 500, served by Google Fonts |
| Hosting | GitHub Pages, branch `main`, folder `/` |
| Design system | Hallmark v2.0.0, theme "sport", genre editorial, light only |
| Registration | **two forms**: batch entry for the individual events, and team entry |
| Fees | **not mentioned anywhere.** The site says nothing about a price, and nothing about being free |

## Status at a glance

| Area | State | Notes |
| --- | --- | --- |
| Page structure | Done | 7 pages plus a 404 and an unlisted admin console |
| Event list | Done | 8 active competitions, 3 individual and 5 team. Arm wrestling and throw-in are disabled in `js/config.js` with their code kept |
| Points table | Done | all nine events on `index.html` and `events.html`, disabled ones included, as the fest's table does |
| Design system | Done | Hallmark Sport theme, token-driven, responsive to 360px |
| Colour modes | Done | **light only.** The dark theme, its switch and the pre-paint script were removed |
| Mobile nav | Done | JS enhanced; falls back to a wrapped row without JS |
| Questions page | **Disabled** | still linked from the nav and footer, but shows a not-available notice and carries `noindex` |
| Batch form | Done | `register.html`, posts to Supabase `batch_entries` |
| Team form | Done | `register-team.html`, posts to Supabase `team_entries` |
| Entry storage | Live | Supabase project `rbmmhasdshbgxhjmshdk`; schema in `supabase/schema.sql` |
| Admin console | Done, **unlisted** | `admin.html`, username and password, per-sport views, search, CSV |
| Event content | **Placeholder** | every `TBC` and TODO comment must be replaced |
| Eligibility | Intra-college | students of the host college only, checked by roll number and ID |
| Analytics | None | deliberately. No cookies, nothing loaded from third parties except the font files |

## The eight competitions

| Event | Slug | Format | Form | Status |
| --- | --- | --- | --- | --- |
| Table Tennis | `table-tennis` | Singles knockout, best of five games to 11 | Batch | Open |
| Chess | `chess` | Knockout, 10 minutes each side | Batch | Open |
| Penalty Shootout | `penalty-shootout` | Five kicks each, sudden death if level | Batch | Open |
| Carroms | `carroms` | Knockout, two boards side by side, 2 or more | Team | Open |
| Badminton (Boys) | `badminton-boys` | Doubles knockout, best of three, 2 or more | Team | Open |
| Badminton (Girls) | `badminton-girls` | Doubles knockout, best of three, 2 or more | Team | Open |
| Football 7-a-side | `football-7s` | Groups then knockout, 10 or more | Team | Open |
| Basketball 3x3 | `basketball-3s` | Groups then knockout, 3 or more | Team | Open |
| Arm Wrestling | `arm-wrestling` | Weight-category knockout, best of three pulls | Batch | **Disabled** |
| Throw In (Girls) | `throw-in-girls` | Football throw-in for distance, girls only | Batch | **Disabled** |

Disabled means `disabled: true` in `js/config.js`: the event is hidden from every entry route, but its slug and its database values stay in place. The points table prints all nine events regardless of the flag. Flip it back to `false` and the event returns with no migration.

**Minimums, not maximums.** A team event states the smallest squad it will accept, counted as the listed players. The captain is the team's contact, not an automatic player: if they play, they add themselves as a member. Basketball 3, football 10, badminton 2, carroms 2. There is no upper limit. `minPlayers` in `js/config.js` drives the browser check and `team_entries_min_players` enforces the same rule in Postgres.

The entry list lives in **three** places and must stay in sync:

1. `js/config.js`, `AQUIL_EVENTS`: slug, label, `kind`, plus `minPlayers` and `disabled`. This is the list every script reads; the forms, the admin filter and the admin stats are all built from it.
2. `register-team.html`, the team event select (five events)
3. `supabase/schema.sql`, the same slugs in CHECK constraints

The points table is a fourth copy, but it is content rather than an entry route: `index.html` and `events.html` print the same nine rows by hand, disabled events included, so an event change touches both tables too.

The batch form has no event list in its markup: `js/register.js` builds each participant row's event select from `AQUIL_INDIVIDUAL_EVENTS`, which is `AQUIL_EVENTS` filtered to active individual events. That is why disabling an event needs no HTML edit.

Links of the shape `register.html?event=chess` preselect the event on the first participant row; `register-team.html?event=football-7s` picks the event in the select and tops up the squad rows to the minimum (see `js/site.js` and `js/register.js`).

## The two forms

| | Batch | Team |
| --- | --- | --- |
| Page | `register.html` | `register-team.html` |
| Covers | Table tennis, chess, penalty shootout (arm wrestling and throw-in hidden) | Carroms, badminton boys, badminton girls, football 7-a-side, basketball 3x3 |
| Who fills it in | one batch captain, on behalf of the batch | one team captain, on behalf of the team |
| Submissions | one per batch, however many participants | one per team |
| Extra data | the captain's group, then one row per participant with name, class, roll and event | the captain's course and year, then one row per member with name, course, year and roll |
| Cross-link | hero button to the team form | hero button to the batch form |

**Why batch captains, not individuals.** The individual events were previously self-service, one row per person ticking up to five sports. That produced duplicate people, mismatched roll numbers and no single contact for a batch. Now one captain owns the list, which matches how the college actually collects names and makes the desk check one call instead of thirty.

**A participant row is one entry, not one person.** Someone playing chess and table tennis appears twice, once per event. That keeps the database flat and makes the per-sport counts in the admin console exact.

## File map

    aquil/
    |-- index.html          Hero, points table, entry
    |-- events.html         Points table, and the note that captains enter players
    |-- schedule.html       Day one and day two sheets, on-the-day facts
    |-- register.html       Batch form: captain details, then one row per participant
    |-- register-team.html  Team form: event, captain, one row per member
    |-- admin.html          Unlisted organiser console: sign in, filter, CSV
    |-- faq.html            Disabled placeholder; 15 questions kept in git history
    |-- 404.html            Not-found page
    |-- css/style.css       The whole design system. Hallmark stamp on line 1, tokens next
    |-- js/config.js        Supabase URL, key, events, courses, groups, years, labels
    |-- js/site.js          Mobile nav, ?event= preselect, footer year
    |-- js/register.js      Builds the row editors, validates, posts both forms
    |-- js/admin.js         Sign in, per-sport filters, sortable table, CSV export
    |-- supabase/schema.sql Tables, constraints, RLS, admin login functions
    |-- apps-script/Code.gs Superseded Google Sheets receiver, kept as a fallback
    |-- .nojekyll           Stops GitHub Pages running Jekyll
    |-- README.md           This file

No `package.json`, no lockfile, no build output. The repository is the site.

## Batch form fields

| Field | `name` | Control | Required | Notes |
| --- | --- | --- | --- | --- |
| Full name | `captain` | text, autocomplete name | yes | the batch captain |
| Roll number | `captain_roll` | text | yes | checked at the desk on the day |
| Class | `captain_class` | text | yes | typed in words, e.g. `B.Com Tax A` |
| Year | `captain_year` | select | yes | 1, 2, 3 |

| Group | `batch_group` | select, eleven groups | yes | replaces specialisation; one group per batch |
| Contact number | `phone` | tel, autocomplete tel | yes | one number per batch; WhatsApp accepted |
| Participants | `participants` | generated rows, added and removed in the page | at least one | each row is name, year, roll, event |
| Rules | `agree_rules` | checkbox | yes | |
| hidden | `_gotcha` | | | traps bots |

The year select offers 1st, 2nd and 3rd year; the event select offers only the active individual events. Rows are numbered as they are added, a live count sits beside the Add button, and submitting an incomplete or empty list is refused in the browser and again by the database.

## The eleven groups

These replace specialisation. A batch belongs to exactly one, and the captain picks it. Stored value, then label:

| Value | Label |
| --- | --- |
| `bcom-tax-a-mcom` | B.Com Tax A & M.Com |
| `bcom-tax-b` | B.Com Tax B |
| `bcom-ca-msw` | B.Com CA & MSW |
| `bcom-fa-msc-evs` | B.Com FA & M.Sc EVS |
| `bcom-ba` | B.Com BA |
| `bsc-msc-psy` | B.Sc & M.Sc Psy |
| `bba-im-bsw` | BBA IM & BSW |
| `bba-ba-lsm` | BBA BA & LSM |
| `bca-msc-ai` | BCA + M.Sc AI |
| `bsc-ca-bcom-tt-gt` | B.Sc CA, B.Com TT & GT |
| `ba-ma-eng-bsc-eco` | BA, MA Eng & B.Sc Eco |

The list lives in two places: `AQUIL_GROUPS` in `js/config.js` and the `batch_group` CHECK constraint in `supabase/schema.sql`. `register.html` writes the options out, so an addition belongs in all three.

## Team form fields

| Field | `name` | Control | Required | Notes |
| --- | --- | --- | --- | --- |
| Event | `event` | select, five team events | yes | preset by `?event=`; changing it tops up the member rows to the new minimum |
| Team name | `team` | text | yes | |
| Captain | `captain` | text | yes | the team's contact; not counted as a player |
| Captain roll number | `captain_roll` | text | yes | |
| Captain course | `captain_course` | select | yes | same course list as the batch form |
| Captain year | `captain_year` | select | yes | 1, 2, 3 |
| Captain's contact number | `phone` | tel | yes | one number per team |
| Members | `members` | generated rows, added and removed in the page | yes | each row is name, course, year, roll; sent as a jsonb array |
| Rules | `agree_rules` | checkbox | yes | |
| hidden | `_gotcha` | | | traps bots |

**A member row is one player.** `js/register.js` builds the rows, numbers them, and keeps a live count beside the Add button. Choosing an event tops the list up to that event's `minPlayers`. Removing rows is always allowed, but submitting below the minimum is refused in the browser and again by `team_entries_min_players` in Postgres.

**There is no email field on either form, on purpose.** Participants are contacted on the phone number, and the confirmation panel says no email is coming. Every submission is a row in Postgres, so nothing depends on an inbox.

## The design system

Built with the **Hallmark** skill, version 2.0.0 (https://github.com/nutlope/hallmark).

- **Theme:** sport, chosen by hand because Node was not available for the dealer script. The stamp records `deal: manual`.
- **Material:** cool concrete paper (`oklch(98% 0.005 250)`), blue-black ink, Saira Condensed 800 in capitals for display, Albert Sans for body, JetBrains Mono for times. Volt `oklch(88% 0.2 120)` is the only accent and always a **fill** with ink on top, never type.
- **Surfaces:** two rule weights, no boxed cards, no shadows. Rows and tables are separated by hairlines; a 2px bar rule opens and closes a table.
- **Labels:** body face, one step smaller, sentence case, untracked. No eyebrows, no tracked capitals anywhere.
- **Motion:** state only. A row lifts one paper step on hover, a link grows a deep-volt underline. No reveals, no parallax, nothing looping.
- **Light only.** There is one rendering. `color-scheme: light` is declared on the root; there is no `data-mode` attribute, no dark token block, no `prefers-color-scheme` block and no switch. Do not reintroduce one without recording the decision here first.

The skill's floor is binding: tokens for every colour and font, `overflow-x: clip` on html and body, `:focus-visible` on every control, reduced-motion fallback, no invented metrics or quotes. The stamp on line 1 of the stylesheet records the theme, the deal, the critique line and any waivers. Keep it there.

## Decisions, and why

1. **Static HTML instead of a framework.** Seven pages of content. A build step would add Node and a deploy pipeline for no benefit and would make the site uneditable from a phone.
2. **Batch captains collect the individual entries.** One contact per batch, one list to reconcile, and the desk can check a whole group at once. The cost is that a captain can leave someone out, so `events.html` tells players to confirm their name with their captain.
3. **A participant row carries its own event.** One person, two sports, two rows. The alternative, a person row with an event array, made per-sport counts and CSV exports need array handling everywhere.
4. **The group replaces specialisation.** The fest sorts batches into eleven combined groups, not by course and specialisation. Two selects would have asked people to encode a mapping they do not think in.
5. **Team and batch stay separate tables.** A team entry has a squad and an event; a batch entry has a group and many events. Forcing both into one table would leave half the columns null and make the CHECK constraints unreadable.
6. **Supabase, not a form service and not a server of our own.** Formspree's free tier is 50 submissions a month. Supabase gives Postgres, row level security and an API on the free tier, and the browser talks to it directly, so there is no server to keep running.
7. **The publishable key is public.** It ships in `js/config.js`. Row level security limits anon to INSERT on the two entry tables and EXECUTE on the three admin functions, so the worst a leaked key allows is a junk row, which the constraints reject.
8. **Reads go through one function.** `admin_entries(token)` is SECURITY DEFINER and validates the session itself. The tables never need a SELECT policy, so there is no way to enumerate entries with the public key.
9. **No email anywhere.** Confirmation is on screen; contact is by phone. It removes a provider, a key and a class of deliverability bugs.
10. **Light only.** The dark theme was a second rendering of every token, kept in step by hand. It was rarely used and doubled the review surface of every visual change, so it was removed rather than maintained.

## Data model

Supabase project `rbmmhasdshbgxhjmshdk`. `supabase/schema.sql` creates:

| Table | Holds |
| --- | --- |
| `batch_entries` | id, created_at, captain, captain_roll, batch_group, phone, participants jsonb, notes |
| `team_entries` | id, created_at, event, team, captain, captain_roll, captain_course, captain_year, phone, members jsonb, notes |
| `admins` | username, password_hash (bcrypt via pgcrypto) |
| `admin_sessions` | token, username, created_at, expires_at (12 hours) |
| `login_attempts` | username, failures, locked_until (5 failures, 15 minute lockout) |

`participants` is an array of `{name, year, roll, event}`, where `year` is 1, 2 or 3. Rows written before 18 Nov 2026 carry `class` instead; the validator and the console read either key. `members` is an array of `{name, course, year, roll}`. `batch_participants_valid()` checks every participant object; `team_entries_min_players` checks the squad size against the event.

Both forms post straight to Supabase's REST API. There is no server of our own: the browser sends JSON to `/rest/v1/batch_entries` or `/rest/v1/team_entries` with the publishable key. anon has INSERT but not SELECT, so the request must not ask for the row back: a `Prefer: return=representation` header would need SELECT and fail with 42501. `js/register.js` sends no Prefer header and treats 201 as success.

## Admin console

`admin.html` is unlisted: no page links to it and it is not in the sitemap. It is not security by obscurity either; the sign-in is checked in Postgres.

- **Sign in** with the username and password stored in `admins`. Five wrong attempts lock that username for 15 minutes. The session token lives in localStorage and expires after 12 hours.
- **Stats** across the top: batch entries, team entries, total, and a count for each of the eight active sports. The per-sport counts are counted in participants, not rows: a batch of four with two chess players counts two for chess.
- **Filters:** free-text search over names, rolls, phones, group and participant text; a sport picker; and an entry-kind switch (Batch or Team). Picking a sport that only one kind can enter switches the kind for you.
- **Table:** sortable columns, newest first. The Participants column prints one participant per line as name, roll, class, event. The Group column prints the group label, not the slug.
- **Download CSV** exports the current filter, UTF-8 with a BOM so Excel opens the en dashes and accents correctly. Participants are joined with a pipe so one row stays one row.

To seed or rotate the password, run the update statement at the bottom of `supabase/schema.sql`.

## Deploying

Editing files on `main` is the deploy: Pages rebuilds in about 30 seconds. To confirm:

    curl -s https://unnnii.github.io/aquil/ | head -20

If a page looks stale it is a cache, not a failed build; check the Pages build status in the repository settings first.

## Testing a change

1. Open the live page at 360px and at desktop width. Nothing may scroll sideways.
2. Submit one batch entry with three participants in different events, and one team entry at the minimum. Both should show the confirmation panel.
3. Open `admin.html`, sign in, and check both rows, the per-sport counts, the sport filter and the CSV.
4. Delete the test rows: `select id, captain from public.batch_entries;` then delete by id.
5. Confirm the entry tables are empty when handing over: `select count(*) from public.batch_entries; select count(*) from public.team_entries;`

## History

- **2026-11-18, the team captain is a contact.** The team form stopped counting the captain as a player: the member list tops up to `minPlayers` on its own and the error asks for that many players. `team_entries_min_players` now requires the same. The captain adds themselves as a member when they play. Existing entries are left alone by the `NOT VALID` constraint.
- **2026-11-18, no notes field.** The Anything else textarea came off both forms and out of both payloads. The `notes` column stays in the database so entries collected earlier keep their text, and the console still prints it.
- **2026-11-18, captain class and year.** The batch form now asks the captain for a class, typed in words, and a year. Participant rows call the column Year, which is what the select always stored, and send `year`; older rows keep `class`, which is still read everywhere.
- **2026-11-18, points table.** The index rows came off `index.html` and `events.html`; both pages now print the fest's points distribution for all nine events, disabled ones included. Entry is through the two form buttons.
- **2026-11-18, batch entry and light only.** Individual self-registration replaced by one form per batch: captain details, group, then a row per participant with name, class, roll and event. New `batch_entries` table with a jsonb participants array and a validator function; specialisation dropped. The admin console reads batch entries, counts participants per sport and prints one participant per line in the table and the CSV. The dark theme, its masthead switch, its token block and the pre-paint script were deleted; `color-scheme` is light.
- **2026-11-18, squads as member rows.** `team_entries.squad` replaced by a `members` jsonb array of `{name, course, year, roll}`; height and weight dropped everywhere; minimums changed to captain plus members.
- **2026-11-17, registration split by event type.** `register.html` took the individual events, `register-team.html` the team events.
- **2026-11-17, hardening.** Service_role key removed from the browser, reads moved behind `admin_entries()`, login lockout added.
- **2026-11-17, design pass.** Hallmark Sport theme, sloplint clean.
