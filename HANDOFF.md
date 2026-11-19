# Handoff — 19 Nov 2026

Written at the end of a working session so this can be picked up on another
machine, by a person or an agent, without re-reading the conversation.
`README.md` describes the site; `THEMES.md` describes the two themes. This file
describes **where things stand right now**.

## Where things live

| | |
| --- | --- |
| Live site | https://unnnii.github.io/aquil/ |
| Repo | https://github.com/unnnii/aquil, branch `main`, Pages from `/` |
| Database | Supabase project `rbmmhasdshbgxhjmshdk` |
| Admin console | https://unnnii.github.io/aquil/admin.html — unlisted, username `admin` |
| Head when this was written | `c379ee9`, assets at `?v=20261119i` |

Editing files on `main` **is** the deploy. Pages takes 30–90 seconds; browsers
cache css/js for ten minutes, so bump the `?v=` stamp whenever those change.

There is no local clone. Work went through the GitHub API and the Supabase MCP
server (`~/.config/opencode/opencode.json`, OAuth — a different machine needs
`opencode mcp add supabase --global --url <the url in that file>` and a sign-in).

## Database state

```
batch_entries   1 row    (a real entry: captain "unni", roll "krishnan")
team_entries    0 rows
admins          1 row    (username "admin"; the repo's placeholder password is NOT in use)
entry_limits    max_entries 120 per 5 minutes
```

Migrations applied, in order — `supabase/schema.sql` is the source of truth and
now matches the live database, so re-running it is a no-op:

1. `20261118040055 heartian_hustle_schema`
2. `20261118041200 team_members_and_event_rules`
3. `20261118062318 batch_entries_for_individual_events`
4. `20261118070720 remove_batch_captain_course`
5. `20261118235145 captain_class_and_team_group`
6. `20261119001211 spam_duplicate_guard_and_console_delete`

## What the site does now

- **Two forms.** `register.html` (batch captain + one row per participant) and
  `register-team.html` (team + squad). Both post straight to Supabase with the
  publishable key, which can INSERT and nothing else.
- **No closing dates anywhere.** Deliberately removed from the rulebook; the
  forms accept entries indefinitely.
- **Duplicates refused in the database.** Unique index on the batch captain's
  roll, and on captain roll + event for teams. A refused entry says "This roll
  number already has an entry. Ask an organiser to delete the old one…".
- **Flood cap.** A trigger counts both tables over a window and raises `P0004`
  past `entry_limits.max_entries` (120 per 5 minutes). Tune with
  `update public.entry_limits set max_entries = 60;` — no code change.
- **Console** (`admin.html`) lists both tables with Class/Year/Group, per-sport
  counts, search, sport filter, CSV, and a Delete button per row behind
  `admin_delete_entry()`. Notes column was removed from the table and the CSV;
  the database column remains.
- **Rules page** (`rules.html`) carries the 2026 rulebook: general instructions,
  points table, one panel per event with rules, date, time and venue, and the
  two faculty contacts. It is in the nav and footer of every page.
- **Theme** is the sponsorship-deck palette: indigo night, gold hairlines, lime
  action, Albert Sans throughout. `THEMES.md` has both palettes and the revert.

## Today's decisions, in order

- Points table replaced the old entry rows on the index and competitions pages.
- Batch captain gives class (typed) + year; participant rows call the field Year.
- The team captain is a contact, not a player; squad minimums count members only.
- Team captains type their class and pick one of the eleven groups; the course
  select is gone (column kept for old rows).
- Anything-else/notes field removed; confirmations are one line.
- The rulebook moved to its own page; no rule is enforced in the forms.
- Questions page deleted.
- Spam, duplicate and delete features added (see above).
- Theme swapped; fonts retuned twice after phone testing.

## Known open items

1. **Rotate the GitHub PAT** used during this session — it was pasted into a
   chat, so treat it as exposed. Nothing in the repo depends on it.
2. **One real entry sits in the database** ("unni" / "krishnan"). Keep or delete.
3. **`schedule.html` is still a stub** ("23 – 30 Nov"), even though every date
   now lives on the rules page.
4. **Rulebook limits are not enforced** — 3 group / 2 individual, chess max 4,
   table tennis max 2. This is deliberate; the rulebook may change.
5. **Dead CSS:** `.index`, `.index-row`, `.asks`. Nothing references them.
6. **Mobile was only spot-checked.** The Competitions hero was measured at
   360px; the other heroes were not. If a page clips a long word, measure the
   string rather than guessing (see the note below).
7. **The points table scrolls sideways** inside its own box on phones. That is
   by design; stacked rows would read better if it ever matters.

## Gotchas for the next session

- **Assets.** Bump `?v=` in every page's `<link>`/`<script>` whenever css or js
  changes, or phones keep the old file for ten minutes.
- **The hero heading.** `.hero h1` is `clamp(2.4rem, 8vw, 6rem)`. The floor was
  lowered from 3rem because Albert Sans is ~40% wider than the old condensed
  face and "Competitions" no longer fitted 320px. Measure with
  `canvas.measureText` before changing it.
- **Nav parity.** `schedule.html` marks Programme with `aria-current="page"`, so
  string-anchored nav edits that assume `<a href="schedule.html">Programme</a>`
  fail on that one page.
- **Testing the console** without the password: insert a row into
  `admin_sessions` with a token and a future `expires_at`, put it in
  `sessionStorage.aquil_admin_token`, then delete the session afterwards.
- **Deleting entries:** the console shows one table at a time. Clearing Batch
  leaves Team untouched — check both tabs.
- **CSV** exports the current tab and filters only. The blob URL is revoked on a
  timer because WebKit cancels downloads that are revoked immediately.

## Reverting the theme

```sh
git revert --no-commit 0319009 e214d43 cb36823 && git commit
# or, losing the later commits too:
git reset --hard theme-light-2026
```

Tag `theme-light-2026` points at `ab10af6`, the last light-theme commit.
Details and the old token block: `THEMES.md`.

## If something looks wrong

1. Check the head sha and the `?v=` stamp on the live page.
2. Check Pages built the head commit.
3. Query the database directly: `select count(*) from batch_entries;`
4. Reproduce a submission on the live form, read the row, delete it.
