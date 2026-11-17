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
| Page structure | Done | 7 pages plus a 404 |
| Event list | Done | 9 competitions, 5 individual and 4 team |
| Design system | Done | Hallmark Sport theme, token-driven, responsive to 360px |
| Colour modes | Done | light and dark from one token system; switch in the masthead, follows the OS until someone chooses |
| Mobile nav | Done | JS enhanced; falls back to a wrapped row without JS |
| Individual form | Built, **not connected** | `register.html`, needs a Formspree ID |
| Team form | Built, **not connected** | `register-team.html`, needs a Formspree ID |
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

The list lives in **four** places and must stay in sync:

1. `index.html`, the nine index rows
2. `events.html`, the same nine rows
3. `register.html`, the individual tick-boxes (five events)
4. `register-team.html`, the team event `<select>` (four events)

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
|-- faq.html          Fifteen questions as native details elements
|-- 404.html          Not-found page
|-- css/style.css     The whole design system. Hallmark stamp on line 1, tokens next
|-- js/site.js        Mobile nav, ?event= preselect on both forms, form guards, footer year
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
| hidden | `_subject`, `_gotcha` | | | Formspree subject and honeypot |

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
| hidden | `_subject`, `_gotcha` | | | Formspree subject and honeypot |

**"Physical events" means every individual event except chess:** table tennis, arm wrestling, penalty shootout and throw in. Tick chess alone and height and weight stop being required, and the hint says why. `js/site.js` moves the `required` attribute as the boxes change; without JavaScript both fields are simply optional.

**There is no email field on either form, on purpose.** Participants are contacted on the phone number. Formspree still emails the *organiser* address each form was created with, so submissions are not lost.

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
| Contact email | footer, `events.html`, `faq.html` | hello@example.com |
| Social link | footer | `href="#"` |
| Organiser name | footer | Organiser TBC |
| Course list | both forms, `<select id="course">` | B.Com, BCA, BBA, BA, B.Sc, Psychology, Other |
| Specialisation list | `register.html` | None, CA, BA, Other |
| Arm wrestling weight classes | `events.html`, `schedule.html`, `faq.html` | not stated |
| Refunds, weather | `faq.html` | written, TBC where unresolved |
| What happens next panel | `register.html`, deliberately blank | TODO comment, nothing promises a timeline |
| Formspree form IDs | both forms, action URLs | `REPLACE_ME` |

## Registration setup

Both forms are committed **switched off**: `js/site.js` finds `REPLACE_ME` in the action, shows the notice, disables the button, and blocks any stray submit. Each form is handled separately, so they can stay off or come on independently.

1. Create the form at https://formspree.io (free tier: 50 submissions a month each).
2. Copy the endpoint, shaped like `https://formspree.io/f/abcdwxyz`.
3. Replace the action URL in `register.html` and / or `register-team.html`.
4. Commit. The notice hides and the button re-enables on that page.

Two endpoints are recommended, so individual and team entries land in separate inboxes. One endpoint also works, since the two `_subject` values differ: `Heartian Hustle 3.0 individual entry` and `Heartian Hustle 3.0 team entry`.

Because there is no email field, **tick "Reply-to" off or leave it empty** in Formspree, or set the reply address in the dashboard rather than from a form field.

Optional: a hidden `_next` field with an absolute URL for a thank-you page, or swap the whole `<form>` for a Tally embed at https://tally.so.

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
curl -X PUT https://api.github.com/repos/unnnii/aquil/contents/register.html -H "Authorization: Bearer $GH_TOKEN" -H "Content-Type: application/json" -d "{\"message\":\"Connect Formspree\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\"}"
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

## Next steps

1. **Connect Formspree**, replacing `REPLACE_ME` in `register.html` and `register-team.html`.
2. **Confirm the split**: five individual events, four team events, and the squad sizes on the team form.
3. **Replace the placeholders**: dates, venue, deadline, contact email, social link, organiser name.
4. **Extend the course and year lists** on **both** forms if the college has more.
5. **Write the "what happens next" panel** on `register.html`; only a TODO comment remains.
6. **Settle the fee question privately**, if there is one, and decide whether it ever appears on the site.
7. **Publish the draw** in `schedule.html` once entries close.

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
a fee. The event list lives in four files: index.html, events.html, register.html,
register-team.html.

Before editing: grep -rn "TODO" *.html

Next task: <say what you want done>
```
