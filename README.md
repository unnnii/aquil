# Heartian Hustle 3.0, event website

> **If you are an AI agent opening this repository: read this whole file before you change anything.**
> It is the single source of truth for what exists, what was decided and what is left to do.
> If your context window is nearly full, read this file to the end and continue from "Next steps".
> Do not redesign from scratch and do not introduce a framework.

A static, multi-page website for **Heartian Hustle 3.0**, a two-day, nine-event intra-college multi-sport tournament.

| | |
| --- | --- |
| Live site | https://unnnii.github.io/aquil/ |
| Repository | https://github.com/unnnii/aquil |
| Stack | plain HTML, CSS, JavaScript. No framework, no build step, no bundler |
| Fonts | Saira Condensed 800, Albert Sans 400/500, JetBrains Mono 500, served by Google Fonts |
| Hosting | GitHub Pages, branch `main`, folder `/` |
| Design system | Hallmark v2.0.0, theme "sport", genre editorial |
| Registration | **two forms**: individual, and team |
| Fees | **not mentioned anywhere.** The site says nothing about a price, and nothing about being free |

## Status at a glance

| Area | State | Notes |
| --- | --- | --- |
| Page structure | Done | 7 pages plus a 404 and an unlisted admin console |
| Event list | Done | 9 competitions, 5 individual and 4 team |
| Design system | Done | Hallmark Sport theme, token-driven, responsive to 360px |
| Colour modes | Done | light and dark from one token system; switch in the masthead, follows the OS until someone chooses |
| Mobile nav | Done | JS enhanced; falls back to a wrapped row without JS |
| Questions page | **Disabled** | still linked from the nav and footer, but shows a not-available notice and carries `noindex` |
| Individual form | Done | `register.html`, posts to Supabase `individual_entries` |
| Team form | Done | `register-team.html`, posts to Supabase `team_entries` |
| Entry storage | **Schema to run once** | `supabase/schema.sql`, two tables plus admin accounts and sessions |
| Admin console | Done, **unlisted** | `admin.html`, username and password, per-sport views, search, CSV |
| Form fields | Done | see the two field tables below |
| Event content | **Placeholder** | every `TBC` and TODO comment must be replaced |
| Eligibility | Intra-college | students of the host college only, checked by roll number and ID |
| Hosting | Done | Pages enabled on `main`, repo root |
| Analytics | None | deliberately. No cookies, nothing loaded from third parties except the font files |

## The nine competitions

| Event | Slug | Format | Form |
| --- | --- | --- | --- |
| Table Tennis | `table-tennis` | Singles knockout, best of five games to 11 | Individual |
| Chess | `chess` | Knockout, 10 minutes each side | Individual |
| Arm Wrestling | `arm-wrestling` | Weight-category knockout, best of three pulls | Individual |
| Penalty Shootout | `penalty-shootout` | Five kicks each, sudden death if level | Individual |
| Throw In (Girls) | `throw-in-girls` | Football throw-in for distance, girls only | Individual |
| Carroms | `carroms` | Knockout, two boards side by side | Team, pairs |
| Badminton | `badminton` | Doubles knockout, best of three | Team, pairs |
| Football 7-a-side | `football-7s` | Groups then knockout, squads of 7 to 10 | Team |
| Basketball 3x3 | `basketball-3s` | Groups then knockout, squads of 3 to 4 | Team |

**Open question, recorded here so it is not lost:** the original brief listed "carroms" **twice**. It was treated as a typo and listed once. If carroms is really two events, split it into two rows, two slugs and two tick-boxes.

The list lives in **five** places and must stay in sync:

1. `index.html`, the nine index rows
2. `events.html`, the same nine rows
3. `register.html`, the individual tick-boxes (five events)
4. `register-team.html`, the team event `<select>` (four events)
5. `js/config.js`, `AQUIL_EVENTS`: slug, label and `kind` for all nine. The admin console builds its filter and its stats from this, so a slug that is not here disappears from the console even if rows exist for it. `supabase/schema.sql` carries the same slugs in CHECK constraints; adding an event means editing all six places.

Links of the shape `register.html?event=chess` tick the box, and `register-team.html?event=football-7s` picks the event in the select (see `js/site.js`).

## The two forms

| | Individual | Team |
| --- | --- | --- |
| Page | `register.html` | `register-team.html` |
| Covers | Chess, table tennis, arm wrestling, penalty shootout, throw in | Carroms, badminton, football 7-a-side, basketball 3x3 |
| Submissions | one per person, several events per submission | one per team |
| Reached by | the nav "Register" button, and any individual row | the chooser at the top of `register.html`, and any team row |
| Extra data | height and weight | captain's roll, course, year; squad list |

`register.html` opens with a two-row chooser ("Individual events — this page" / "Team events — team form") before the form, so anyone who lands on Register can pick the right one. The nav deliberately does not have two buttons; the chooser does the routing.

## File map

```
aquil/
|-- index.html        Hero, nine-competition index, programme teaser, entry, questions
|-- events.html       All nine competitions, entry rules, height and weight
|-- schedule.html     Day one and day two sheets, on-the-day facts
|-- register.html     Individual form, with the chooser above it
|-- register-team.html Team form: event, captain, squad list
|-- admin.html        Unlisted organiser console: sign in, filter, CSV
|-- faq.html          Disabled placeholder; 15 questions kept in git history
|-- 404.html          Not-found page
|-- css/style.css     The whole design system. Hallmark stamp on line 1, tokens next
|-- js/config.js      Supabase URL, publishable key, the nine events
|-- js/site.js        Mobile nav, ?event= preselect, body-data rule, mode, footer year
|-- js/register.js    Validates and posts both forms to Supabase
|-- js/admin.js       Sign in, per-sport filters, sortable table, CSV export
|-- supabase/schema.sql  Tables, constraints, RLS, admin login functions
|-- apps-script/Code.gs  Superseded Google Sheets receiver, kept as a fallback
|-- .nojekyll         Stops GitHub Pages running Jekyll
|-- README.md         This file
```

No `package.json`, no lockfile, no build output. The repository is the site.

## The individual form fields

| Field | `name` | Control | Required | Notes |
| --- | --- | --- | --- | --- |
| Full name | `full_name` | text, autocomplete name | yes | |
| Roll number | `roll_number` | text | yes | checked at the desk on the day |
| Course | `course` | select | yes | B.Com, BCA, BBA, BA, B.Sc, Psychology, Other |
| Specialisation | `specialisation` | select | no | None, CA, BA, Other |
| Year | `year` | select | yes | 1, 2, 3 |
| Contact number | `phone` | tel, autocomplete tel | yes | WhatsApp accepted; this replaces email |
| Height | `height_cm` | number, 100 to 250 | physical events | arm wrestling brackets |
| Weight | `weight_kg` | number, 25 to 200, 0.5 steps | physical events | arm wrestling brackets |
| Events | `events` | checkbox group, five individual events | at least one | enforced by `js/site.js` |
| Rules | `agree_rules` | checkbox | yes | |
| hidden | `_subject`, `_gotcha` | | | routes the entry, and traps bots |

## The team form fields

| Field | `name` | Control | Required | Notes |
| --- | --- | --- | --- | --- |
| Event | `event` | select, four team events | yes | preset by `?event=` |
| Team name | `team` | text | yes | |
| Captain | `captain` | text | yes | |
| Captain roll number | `captain_roll` | text | yes | |
| Captain course | `captain_course` | select | yes | same course list as the individual form |
| Captain year | `captain_year` | select | yes | 1, 2, 3 |
| Contact number | `phone` | tel | yes | |
| Squad | `squad` | textarea | yes | one player per line: full name, roll number |
| Notes | `notes` | textarea | no | |
| Rules | `agree_rules` | checkbox | yes | |
| hidden | `_subject`, `_gotcha` | | | routes the entry, and traps bots |

**"Physical events" means every individual event except chess:** table tennis, arm wrestling, penalty shootout and throw in. Tick chess alone and height and weight stop being required, and the hint says why. `js/site.js` moves the `required` attribute as the boxes change; without JavaScript both fields are simply optional.

**There is no email field on either form, on purpose.** Participants are contacted on the phone number, and the confirmation page tells them no email is coming. Every submission is a row in a Google Sheet, so nothing depends on an inbox.

The course and year option lists now exist **twice**, once per form. Anything added to one must be added to the other.

## The design system

Built with the **Hallmark** skill, version 2.0.0 (https://github.com/nutlope/hallmark). Read `skills/hallmark/SKILL.md` before changing the visual layer, and `references/themes/sport.md` for this theme's rules.

- **Theme:** sport, chosen by hand from `references/themes/index.json` because Node was not available for `theme.mjs deal`. The stamp records `deal: manual`.
- **Material:** cool concrete paper (`oklch(98% 0.005 250)`), blue-black ink, Saira Condensed 800 in capitals for display, Albert Sans for body, JetBrains Mono for times. Volt `oklch(88% 0.2 120)` is the only accent and always a **fill** with ink on top, never type.
- **Surfaces:** two rule weights, no boxed cards, no shadows. Rows and tables are separated by hairlines; a 2px bar rule opens and closes a table.
- **Labels:** body face, one step smaller, sentence case, untracked. No eyebrows, no tracked capitals anywhere.
- **Motion:** state only. A row lifts one paper step on hover, a link grows a deep-volt underline. No reveals, no parallax, nothing looping.
- **Modes:** light and dark from the same tokens, never inverted. Dark re-derives each colour per the Hallmark recipe: paper at L 15% (never black), elevation stepping lighter, ink at 94% (never white), accent chroma down and lightness up, and both hues held at 250 and 120. `[data-mode]` on `html` wins; a `prefers-color-scheme` block covers scripting-off visitors. Body text drops to weight 350 in dark. The switch sits in the masthead and remembers the choice in `localStorage`.

The skill's floor is binding: tokens for every colour and font, `overflow-x: clip` on html and body, `:focus-visible` on every control, reduced-motion fallback, no invented metrics or quotes. The stamp on line 1 of the stylesheet records the theme, the deal, the critique line and any waivers. Keep it there.

**sloplint: clean.** Run on 2026-11-17 on a machine with Node, after the spacing, state, contrast and column-gap fixes:

```bash
node ~/.agents/skills/hallmark/scripts/sloplint.mjs css/style.css --genre editorial
```

Result: **0 FAIL, 0 REFLEX, 0 WARN.** The render tier needs `puppeteer-core`, which was not installed, so the sweep also included a hand check in a real browser in both modes. Re-run this after any change to `css/style.css` and record the result in the stamp on line 1.

## Decisions, and why

1. **Static HTML instead of a framework.** Seven pages of content. A build step would add Node and a deploy pipeline for no benefit and would make the site uneditable from a phone.
2. **Two forms, split by event type.** The individual events need one person's details and several ticks; the team events need a captain and a roster. One form doing both would be heavy for a chess entrant and thin for a football squad.
3. **The chooser lives on the Register page.** The nav has one Register button, not two, so the first thing a visitor sees is the choice, not a guess at which button is theirs.
4. **Solid and paired events are team events.** Carroms and badminton are pairs, which the brief groups with football and basketball, and they register like teams: one submission with a partner named.
5. **Events are tick-boxes on the individual form.** People commonly enter several at once, and a single `<select>` can only carry one.
6. **No email anywhere.** Both forms confirm on WhatsApp or a phone call, which also removes a whole class of "email never arrived" support.
7. **No fee in the copy.** The site does not advertise a price and does not advertise free entry either, because neither has been settled. When it is, it needs a decision and a place on the page.
8. **A ruled index, not cards.** The Sport theme refuses boxed cards: a competition is one row with its name and an enter link.
9. **The programme is a sheet.** Times in mono, hairline rows, a bar rule top and bottom, and a horizontal scroller on narrow screens.
10. **No photography.** The repo stays text-only so every change is diffable. If photos arrive, put them in `assets/`, follow the theme's duotone treatment, and credit them in the footer.

11. **Two modes from one token system.** Dark is a second rendering, not an inversion: every colour is re-derived per the Hallmark recipe and every pairing was checked numerically in both modes (ink on paper 16.50:1, muted on paper-2 7.05:1, accent ink on volt 15.88:1). The switch is one button in the masthead, the choice is remembered, and the OS preference is honoured until someone overrides it. There is no flash: an inline script in the head sets the mode before first paint.

12. **Height and weight only where they are used.** They exist for arm wrestling brackets, so chess alone no longer asks for them. The rule is data-driven: a tick-box carries `data-body="required"` when it is a physical event, and `js/site.js` moves the `required` attribute to match. Adding a physical event later is one attribute, not a code change.

13. **Supabase, not a form service and not a server of our own.** Formspree's free tier is 50 submissions a month per form, which individual entries alone would pass, and a rejected submission is silent. Apps Script works but needs a Google account deploying and redeploying it. Supabase gives a Postgres table per form, constraints that reject malformed rows at the database, and a REST endpoint the browser can call directly, so there is still no framework, no build step and no server to run.

14. **Username and password for organisers, not email.** Supabase Auth is email-based and the organisers asked for a username. Instead of bending Auth, `admin_login()` checks a bcrypt hash inside Postgres and returns a random session token, which is what Auth would have done underneath anyway. It also means there is no email deliverability to debug at 11pm before an event.

15. **The publishable key in the page, the service key nowhere.** The key in `js/config.js` is meant to be public: RLS lets it INSERT entries and nothing else. All reads go through a `security definer` function that first proves the caller holds a live token. Anyone can read the JavaScript; nobody can read the entries from it.

## Placeholders to replace

Every placeholder is either visible text (`TBC`) or an HTML comment (`<!-- TODO: ... -->`) beside it.

```bash
grep -rn "TODO" *.html
grep -rn "TBC" *.html
```

| What | Where | Currently |
| --- | --- | --- |
| Dates | hero facts on index and schedule, footer | TBC |
| Venue and city | hero facts, schedule venue columns | TBC |
| Entry deadline | hero facts on index, both forms, FAQ | TBC |
| Match times and draw | `schedule.html` sheets | provisional |
| Social link | footer | `href="#"` |
| Organiser name | footer | Organiser TBC |
| Course list | both forms, `<select id="course">` | B.Com, BCA, BBA, BA, B.Sc, Psychology, Other |
| Specialisation list | `register.html` | None, CA, BA, Other |
| Arm wrestling weight classes | `events.html`, `schedule.html`, `faq.html` | not stated |
| Refunds, weather | `faq.html` | written, TBC where unresolved |
| What happens next panel | `register.html`, deliberately blank | TODO comment, nothing promises a timeline |
| Registration endpoint | `js/config.js` and `supabase/schema.sql` | connected; rerun the SQL if the project changes |

## Registration endpoint (Supabase)

Both forms post straight to Supabase's REST API. There is no server of our own: the browser sends JSON to `/rest/v1/individual_entries` or `/rest/v1/team_entries` with the publishable key, and Postgres enforces every rule.

| | |
| --- | --- |
| Project | `https://rbmmhasdshbgxhjmshdk.supabase.co` |
| Key in the page | publishable key, in `js/config.js`. Public by design |
| Tables | `individual_entries`, `team_entries` |
| Admin | `admin.html`, username and password, server-side session token |
| Schema | `supabase/schema.sql` |

### One-time setup

1. Open the project's **SQL Editor**, paste all of `supabase/schema.sql`, change the seeded password (`CHANGE-ME-BEFORE-RUNNING`), and run it.
2. Check that the three verify queries at the bottom of the file return rows.
3. Open `https://unnnii.github.io/aquil/admin.html`, sign in as `admin` with the password you set.
4. Submit one individual and one team entry on the site, confirm they appear under the right sport, then delete the test rows in the Supabase table editor.

Re-running the SQL is safe. To change the password later:

```sql
update public.admins
   set password_hash = extensions.crypt('new-password', extensions.gen_salt('bf', 12))
 where username = 'admin';
```

### Security model

- The publishable key can **insert** entries and nothing else. `select`, `update` and `delete` are revoked and RLS carries an insert-only policy.
- Reading is only possible through `admin_entries(token)`, and a token only exists after `admin_login(username, password)` succeeds.
- Passwords are bcrypt hashes (`pgcrypto`), never stored or sent in clear text.
- Five wrong passwords lock that username for 15 minutes.
- Sessions last 12 hours and live in `admin_sessions`; signing out deletes the row.
- The `service_role` key is not used by the site at all. Do not put it in `js/config.js`.

### Why not Supabase Auth

Auth is email-based and the organisers wanted a username and a password. `admin_login()` gives exactly that with the same properties: a random server-side token, an expiry and a lockout.

### Spam

The honeypot (`_gotcha`) now traps bots in `js/register.js`, and the CHECK constraints reject malformed rows. There is no CAPTCHA: verifying one needs a server, which this stack does not have. If junk arrives, add Cloudflare Turnstile and verify it in an Edge Function.

### What is stored

| Individual | Team |
| --- | --- |
| received, full name, roll number, course, specialisation, year, contact, height, weight, events, anything else | received, event, team name, captain, captain roll, captain course, captain year, contact, squad, anything else |

`events` is a Postgres `text[]`: one entrant ticking three events is one row with three values, not three rows. The console expands slugs to labels and shows the row under every sport it belongs to.

### Exporting

`admin.html` → choose Individual or Team, filter by sport if needed, **Download CSV**. The file is UTF-8 with a BOM so Excel opens it cleanly, and dates are left as ISO 8601 rather than formatted, so sorting the column in Excel works.

## Admin console

`admin.html`. Unlisted and `noindex`: not in the nav, not in the footer, not linked from any page. Knowing the URL is not enough, because the page renders only a sign-in card until `admin_login()` returns a token.

| | |
| --- | --- |
| Username | `admin`, unless you changed it in the seed `INSERT` |
| Password | the one you put in `supabase/schema.sql` before running it |
| Sign-in | `admin_login(username, password)`, checked in Postgres, not Supabase Auth |
| Session | a random 32-byte token in `sessionStorage`, 12 hours, gone when the tab closes |
| Read | `admin_entries(token)` returns both tables as one JSON object |
| Sign-out | `admin_logout(token)` deletes the session row server-side |

What it does:

- **Totals** across the top: individual, team, total, and a count for each of the nine sports. "Table Tennis 6" counts rows where `events` contains `table-tennis`, so a person in three sports is counted in each and once in the individual total.
- **Two tables**, Individual and Team, newest first. Pick a sport and the entry kind switches with it, since a sport only belongs to one kind.
- **Search** runs across every column at once, including the readable form the table shows, so "Ananya", "Table Tennis", "BCA" and "2nd year" all match a row that stores a name, a slug or a code.
- **Sortable headers**. Click once for ascending, again for descending; the timestamp column defaults to newest first.
- **Download CSV** exports what is currently filtered, not everything, with readable labels (`BCA`, `2nd year`, `Table Tennis`) rather than stored values.

It fetches every row in one request and filters in the browser. That is instant at a few hundred entries, which is the scale here. If it ever gets slow, add `?select=` and server-side filters to `admin_entries()`.

**Whoever has the password is an organiser.** There are no per-person accounts and no audit trail beyond `created_at`. Two people signing in from two laptops both get valid independent sessions. The lockout is per username, so five wrong guesses block everyone for 15 minutes; that is the intended trade for having one shared account.

The token is readable by any script on the page. That is why the site loads no analytics, no CDN and no third-party JavaScript, and why the console is `noindex`. If a third-party script is ever added to `admin.html`, it can read the token and the entry sheet.

## Registration endpoint, fallback (Google Apps Script)

`apps-script/Code.gs` stays in the repository but is no longer wired to anything. It still appends to a Google Sheet if Supabase becomes a problem. The notes below describe it.

Both forms post to a **Google Apps Script web app** (`apps-script/Code.gs`). It appends each submission as a row in a Google Sheet and returns a small confirmation page. No third party sits in the middle, there is no monthly cap, and the entries land somewhere organisers can filter and sort when seeding draws and weight brackets.

The old `REPLACE_ME` guard has been removed: `js/site.js` no longer touches submission, `js/register.js` owns it.

### One-time setup

1. Create a Google Sheet, for example "Heartian Hustle 3.0 entries".
2. In that sheet: **Extensions → Apps Script**, and delete the `myFunction` stub.
3. Paste all of `apps-script/Code.gs` in, then save.
4. **Deploy → New deployment → Web app.**
   - Description: `Heartian Hustle entries`
   - Execute as: **Me**
   - Who has access: **Anyone** — not "Anyone with a Google account", entrants do not sign in.
5. Authorise it. Google warns that the app is unverified because you are the developer; **Advanced → Go to … (unsafe)** is expected here, the script is your own.
6. Copy the **Web app URL**, which ends in `/exec`.
7. Switching back now means editing `js/register.js`, not the markup. The forms are `action="#"` and `data-register-form`; the script intercepts submission and calls Supabase. To use Apps Script instead, either add a `fetch` to the `/exec` URL inside `send()` in `js/register.js` (a `FormData` POST, no CORS preflight), or delete the intercept and set `action` on both forms to the `/exec` URL. Restore a `_subject` input in each form in the second case: the script still reads it to choose the tab.

One deployment serves both forms. In the `FormData` path the script tells them apart by `_subject`, so the two tabs stay separate without a second deployment.

### What the sheet looks like

Two tabs, created on the first submission, each with a frozen and styled header row:

| Tab | Columns |
| --- | --- |
| **Individual entries** | received, full name, roll number, course, specialisation, year, contact, height, weight, events, anything else |
| **Team entries** | received, event, team name, captain, captain roll, captain course, captain year, contact, squad, anything else |

Ticked events are joined with commas, and slugs are turned into labels — `table-tennis, chess` is stored as `Table Tennis, Chess` — by the `LABELS` map at the top of the script. Roll numbers and phone numbers are written as plain text so leading zeros and long numbers survive.

The script does three other things worth knowing:

- It **locks** while appending, so two people submitting at the same moment cannot collide on a row.
- It ignores `_gotcha` if that hidden field is filled, which is what a bot does, and stores nothing.
- If a field the form requires arrives empty, it saves nothing and says so rather than writing a half row. The browser's own validation means this should never happen through the site.

### Testing it

1. Open the `/exec` URL directly. It should say the receiver is live. If it asks you to sign in, step 4 is wrong.
2. Submit one real individual entry on the site. The row should appear within a second, and the browser should land on "Entry received".
3. Submit one team entry. It should land in the other tab.
4. Delete both test rows.

### Changing things later

The script reads fields by name, so a new optional field is ignored until it is added to the column list and redeployed.

**Editing the script is not enough on its own.** The live `/exec` URL keeps serving the last deployed version, so after any change: **Deploy → Manage deployments → pencil → Version: New version → Deploy**. Keeping the URL, which is the point of "Manage deployments".

If a submission fails, the visitor sees "Something went wrong, try again", and the reason is written to the Apps Script execution log (**Executions** in the editor sidebar).

### Privacy

The sheet holds roll numbers, phone numbers, heights and weights. Keep it **restricted to organiser accounts** — Share → General access → Restricted — and do not hand out the `/exec` URL as if it were a link to the entries. It only accepts POSTs, but there is no reason to advertise it.

### If Apps Script does not work out

The endpoint is one attribute in each form. Tally (free, unlimited) and Formspree (free for 50 a month per form) both slot into the same markup; only the URL, and the extra hidden fields, change.

## Deploying

Pages is already enabled: `main`, root, rebuilds on every push.

**Going private breaks this.** Free accounts only serve Pages from **public** repositories. If `unnnii/aquil` goes private on the free plan, the live URL dies. Either keep it public, move hosting to Cloudflare Pages or Netlify (free for private repos, no build command, publish directory `/`), or pay for GitHub Pro.

## Local preview

Open `index.html` in a browser, or serve the folder so query links behave as in production:

```bash
python -m http.server 8000
```

## Editing without git

The repository was never cloned on the machine that built it, so everything below works without git.

**Web UI:** open a file, pencil icon, commit. *Add file, Create new file* for new pages.

**REST API**, one file at a time:

```bash
SHA=$(curl -s https://api.github.com/repos/unnnii/aquil/contents/register.html -H "Authorization: Bearer $GH_TOKEN" | python -c "import sys,json;print(json.load(sys.stdin)['sha'])")
CONTENT=$(base64 -w0 register.html)
curl -X PUT https://api.github.com/repos/unnnii/aquil/contents/register.html -H "Authorization: Bearer $GH_TOKEN" -H "Content-Type: application/json" -d "{\"message\":\"Connect the registration endpoint\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\"}"
```

On a normal machine, `git clone https://github.com/unnnii/aquil.git` and work normally.

## Design tokens

Declared once at `:root` in `css/style.css`. No literal colour or font-family appears outside that block.

| Token | Value | Use |
| --- | --- | --- |
| `--color-paper` | `oklch(98% 0.005 250)` | page ground, cool concrete |
| `--color-paper-2` | `oklch(95% 0.006 250)` | alternating sections, row hover |
| `--color-ink` | `oklch(16% 0.08 260)` | text, bar rules, filled controls |
| `--color-ink-2` | `oklch(22% 0.06 258)` | secondary copy |
| `--color-muted` | `oklch(50% 0.02 250)` | labels, captions, table heads |
| `--color-rule` | `oklch(78% 0.008 250)` | hairlines |
| `--color-rule-2` | `oklch(36% 0.06 255)` | 2px bar rules |
| `--color-accent` | `oklch(88% 0.2 120)` | volt fill, primary buttons, selection |
| `--color-accent-deep` | `oklch(58% 0.145 125)` | link underlines, hover fills |
| `--color-focus` | `oklch(58% 0.145 125)` | focus rings |
| `--font-display` | Saira Condensed 800 | heads, wordmark, buttons, figures |
| `--font-body` | Albert Sans 400/500 | body, labels, nav |
| `--font-outlier` | JetBrains Mono 500 | times |

Type scale is 1.25 from a 16px body. Display heads are clamped and capped so the hero headline, sentence and actions fit 1280 x 800.

## Session log

### 2026-11-17, initial build

- Repository `unnnii/aquil` created empty and public, default branch `main`.
- Built from a shared Windows machine with **no git, no gh CLI and no Node**, so every file went in through the GitHub REST API: seed `PUT /contents/index.html` (GitHub refuses to create a tree in an empty repo, 409), then `POST /git/trees` with inline content, `POST /git/commits`, `PATCH /git/refs/heads/main`. No clone, no local files, nothing installed.
- Pages enabled on `main` at the root.

### 2026-11-17, Hallmark pass

- Pulled the Hallmark skill from GitHub instead of `npx skills add`, because there is no npm or npx on that machine. Read `SKILL.md`, `anatomy.md`, the editorial genre, `themes/sport.md` and gates sections 1 to 3.
- Dealt the **sport** theme by hand (`deal: manual`) and rebuilt the visual layer to its rules.
- Removed everything the skill's floor bans: every eyebrow, every tracked-capital label, the arrow glued to link text, the slash-joined meta string, the literal colours outside the token block.
- `sloplint` was not run: it needs Node. The stamp says so rather than claiming a pass.

### 2026-11-17, event named

- Event name set to **Heartian Hustle 3.0**. The repository slug stays `unnnii/aquil` so the live URL does not change.

### 2026-11-17, individual registration and the nine-event list

- Registration rewritten from "enter a team" to one form per participant: full name, roll number, course, specialisation, year, contact number, height, weight, plus a tick-box per event.
- **Email removed** from the form. Confirmation happens on the phone number.
- Event list replaced: table tennis, carroms, chess, arm wrestling, penalty shootout, throw in (girls), badminton, football 7-a-side, basketball 3x3. Volleyball and the 100m sprint are gone.

### 2026-11-17, free entry, eligibility, blank next steps

- Every fee reference removed. Eligibility is **intra-college**: students of this college only, verified by roll number at check-in.
- The register page's "What happens next" panel was removed, replaced by a TODO comment.
- Course list: B.Tech replaced with Psychology.
- "Can I get a refund?" became "Can I change my events after registering?".

### 2026-11-17, two forms

- Registration split by event type. `register.html` now covers the five individual events and opens with a chooser; the new `register-team.html` covers carroms, badminton, football 7-a-side and basketball 3x3, with the captain's details and a squad textarea.
- Team rows on the home page and competitions page now link to `register-team.html?event=<slug>`.
- `js/site.js` handles two forms: it preselects a checkbox or a select from `?event=`, guards both dead endpoints, and requires at least one event on the individual form.
- **Fees removed from the copy entirely.** No price, and no "free" either. The FAQ question about cost was deleted, and the spectator answer no longer says "free".
- The footer now links both forms.

### 2026-11-17, modes, conditional body data, sloplint

- **sloplint run for the first time** on a machine with Node: 0 FAIL, 0 REFLEX, 0 WARN. It found 8 REFLEX and 3 WARN, all fixed: six off-scale values now sit on the 4px scale, `:active` states were added everywhere, `.btn-volt:hover` went from 3.89:1 to 4.74:1 by switching to ink on the deep accent, the three column gaps collapsed into `--col-gap`, and the scrollbar is themed. The stamp on line 1 now records the pass instead of claiming Node was missing.
- **Light and dark mode.** Every colour was re-derived per the Hallmark dark recipe rather than inverted: paper L 15%, elevation stepping lighter, ink 94%, accent chroma down and lightness up, hues held. All pairings were checked numerically in both modes. The switch is in the masthead, the choice persists in `localStorage`, the OS preference is honoured until overridden, and an inline script in the head sets the mode before first paint so there is no flash. `color-scheme` follows the mode so native controls and scrollbars match.
- **Height and weight are no longer required from everyone.** They are asked for only when a physical event is ticked; chess alone makes them optional and says so in the hint. The rule lives in the markup (`data-body="required"`), not in the script, so changing which events need body data is an attribute edit.

### 2026-11-17, contact details, footer credit, questions disabled

- **The placeholder email is gone.** Every `hello@example.com` reference was removed: the footer on all seven pages, the "not listed" note on `events.html`, and the two answers that told people to write in. The contact details are still unconfirmed, so the site no longer offers an address that does not work.
- **Footer credit.** The colophon on every page reads "made with <3 by unni for SHC". The "No cookies, no analytics" line was removed.
- **The questions page is disabled, not deleted.** `faq.html` keeps its place in the nav and footer, but the body is now a short not-available notice, it carries `<meta name="robots" content="noindex">`, and its title and description were updated to match. The fifteen questions remain in git history and can be restored by reverting this commit.
- **"Read the rules" now points at the rules.** `events.html` gained `id="rules"` on "How entries work"; the buttons on `events.html` and `schedule.html`, and the agreement links on both forms, point there instead of at the disabled page.

### 2026-11-17, registration endpoint moved to Apps Script

- Formspree's free tier is 50 submissions a month per form, and individual entries alone will pass that. A rejected submission is silent, which is the worst failure available for a registration form.
- `apps-script/Code.gs` is the replacement: a web app that takes either form's POST, appends one row to a Google Sheet, and returns a confirmation page in the site's type and colour. Free, no cap, and the entries end up where organisers seed draws from.
- One deployment serves both forms; the hidden `_subject` decides which tab the row goes to. Checkbox slugs are joined and expanded to labels, so the sheet reads "Table Tennis, Chess" rather than `table-tennis, chess`.
- Rows are appended under a script lock, the `_gotcha` honeypot is honoured, and required fields are checked server-side. Roll numbers and phones are forced to plain text.
- The script is committed here but **not deployed**, so both forms still carry `REPLACE_ME` and stay switched off. The `/exec` URL is the last missing piece.
- The Formspree notes in this file were replaced rather than deleted: Formspree is still the fallback if Apps Script turns out to be a problem.

### 2026-11-18, registration moved to Supabase, admin console rebuilt

- **The endpoint is Supabase now.** Both forms write straight to Postgres through PostgREST with the publishable key. `apps-script/Code.gs` is kept as a fallback but is no longer referenced by any page.
- `supabase/schema.sql` creates `individual_entries`, `team_entries`, `admins`, `admin_sessions` and `login_attempts`, with CHECK constraints on every field, a GIN index on the events array, insert-only RLS for `anon`, and `admin_entries()` for reads.
- **Username and password, no email.** `admin_login()` verifies a bcrypt hash with `pgcrypto`, returns a random 32-byte session token, and locks a username for 15 minutes after five failures. Sessions expire after 12 hours and can be revoked by `admin_logout()`.
- **The admin console is rebuilt** at `admin.html` against the `.admin-*` classes that were already in `style.css` but had no markup: sign-in, totals per sport, search, per-sport filter, sortable table, CSV export. The page is `noindex` and unlinked.
- `js/config.js` holds the project URL, the publishable key and the nine events in one place. `js/register.js` replaced the `REPLACE_ME` guard in `js/site.js`: it validates the phone number and events, posts JSON, and shows an inline confirmation instead of navigating.
- The honeypot moved from `type="hidden"` to a positioned text input, since bots parse hidden fields.
- Known limit: submission now requires JavaScript. Without it the form shows a `noscript` notice telling the entrant to find an organiser.

### 2026-11-18, Supabase commit published, console verified in a browser

- Pushed as [`cd6589a`](https://github.com/unnnii/aquil/commit/cd6589ae4e163fa53b625aeb61f70130744253d2) through the Git Data API: nine files in one commit, parent `5abc4fce` with tree `7504883e`, new tree `965b0080`. No clone, no local git.
- Pages rebuilt from that commit (`built`, 2026-11-18T03:14:51Z). `admin.html`, `js/config.js`, `js/admin.js`, `js/register.js`, `register.html`, `register-team.html` and `supabase/schema.sql` all return 200 on `unnnii.github.io/aquil/`. The first check inside the first minute after the build returned 404s on every new path; they came up shortly after, which is the propagation delay, not a bad commit.
- **The project had no tables.** PostgREST answered every table with `PGRST205` before this work, so there was nothing to migrate and no data to lose. That is also why the forms and the console both say "database not set up" until the SQL is run.
- **`supabase/schema.sql` is publicly readable**, because Pages serves the repository root and there is no way to exclude one file. It holds no key and no real password: the seed only has the placeholder. When the real SQL is run, do not commit a version with the real password in it, and keep the actual password in a password manager rather than in this repo. The same goes for `apps-script/Code.gs`, which already sits at a public path.
- Tested against a local server with the real pages and the real key, then checked again against the deployed site:
  - Both forms produce the exact column set the tables expect. Team payload verified field by field, including `squad` with embedded newlines.
  - Success panels render: "Probe Person · Table Tennis, Chess" and "Badminton · Probe Pair".
  - A missing table surfaces the friendly "not set up yet" sentence, not a raw PostgREST error.
  - CORS and preflight to `rbmmhasdshbgxhjmshdk.supabase.co` succeed from a browser origin, so the live site will not be blocked.
  - Admin console exercised against mocked rows: per-sport stats, the kind switch when a sport is picked, search, reset, both sort directions, the empty state, and the CSV (BOM, ISO dates, labels).
  - No console errors on `admin.html`, `register.html` or `register-team.html`.
- **Not tested, because it cannot be:** a real insert or a real sign-in. Running `supabase/schema.sql` needs the dashboard SQL editor, which is the one step left for an organiser.

## Next steps

1. **Run `supabase/schema.sql`** in the SQL editor and replace the seeded password. Registration is dead until that is done; the forms will show "not set up yet".
2. **Change the admin password** from `CHANGE-ME-BEFORE-RUNNING` and keep it off the site.
3. **Confirm the split**: five individual events, four team events, and the squad sizes on the team form.
4. **Replace the placeholders**: dates, venue, deadline, social link, organiser name.
5. **Extend the course and year lists** on **both** forms and in `supabase/schema.sql` if the database ever constrains them.
6. **Write the "what happens next" panel** on `register.html`; only a TODO comment remains.
7. **Settle the fee question privately**, if there is one, and decide whether it ever appears on the site.
8. **Publish the draw** in `schedule.html` once entries close.

**Done since this list was written:** `sloplint` has been run and is clean; the site ships light and dark; height and weight are conditional. See the session log above.

## Cleanup checklist, build machine

- [ ] GitHub token used during the build revoked at https://github.com/settings/tokens?type=beta
- [ ] GitHub signed out in the browser
- [ ] Chat session deleted
- [ ] Nothing was written to that machine's disk: no clone, no temp files

## Resuming in a new session

```text
I am continuing work on the Heartian Hustle 3.0 event site: https://github.com/unnnii/aquil

Read README.md first. It covers the structure, the Hallmark design system in use,
the nine events and their slugs, the two registration forms, the placeholders and
the next steps. Do not redesign from scratch.

Stack: plain HTML, CSS and JS. No framework, no build step, GitHub Pages from main.
Design system: Hallmark v2.0.0, theme "sport". Keep the stamp on line 1 of css/style.css
and keep every colour and font behind a token.

Registration is two forms: register.html for the five individual events (per person,
several ticks) and register-team.html for carroms, badminton, football and basketball
(one submission per team). Neither form has an email field and the site never mentions
a fee. The event list lives in five files: index.html, events.html, register.html,
register-team.html and js/config.js, plus the CHECK constraints in supabase/schema.sql.

Entries go to Supabase (project rbmmhasdshbgxhjmshdk), not Apps Script and not Formspree.
Both forms post JSON with the publishable key in js/config.js; anon may INSERT only.
Organisers read through admin.html, which signs in with a username and password via
admin_login() and reads through admin_entries(token). Do not put the service_role key
in the page. The schema in supabase/schema.sql has to be run once in the SQL editor.

Before editing: grep -rn "TODO" *.html

Next task: <say what you want done>
```
