# Heartian Hustle 3.0, event website

> **If you are an AI agent opening this repository: read this whole file before you change anything.**
> It is the single source of truth for what exists, what was decided and what is left to do.
> If your context window is nearly full, read this file to the end and continue from "Next steps".
> Do not redesign from scratch and do not introduce a framework.

A static, multi-page website for **Heartian Hustle 3.0**, a two-day, nine-event multi-sport tournament.

| | |
| --- | --- |
| Live site | https://unnnii.github.io/aquil/ |
| Repository | https://github.com/unnnii/aquil |
| Stack | plain HTML, CSS, JavaScript. No framework, no build step, no bundler |
| Fonts | Saira Condensed 800, Albert Sans 400/500, JetBrains Mono 500, served by Google Fonts |
| Hosting | GitHub Pages, branch `main`, folder `/` |
| Design system | Hallmark v2.0.0, theme "sport", genre editorial |
| Registration | **one form per participant**, several events per entry, no email address |
| Entry fee | **None** | free entry, no payment step anywhere |
| Eligibility | Inter-college | students of any college, roll number plus college ID |

## Status at a glance

| Area | State | Notes |
| --- | --- | --- |
| Page structure | Done | 6 pages plus a 404 |
| Event list | Done | 9 competitions, defined in three places (see below) |
| Design system | Done | Hallmark Sport theme, token-driven, responsive to 360px |
| Mobile nav | Done | JS enhanced; falls back to a wrapped row without JS |
| Registration form | Built, **not connected** | needs a Formspree form ID, currently `REPLACE_ME` |
| Form fields | Done | 8 required details plus an event tick-list; no email field |
| Event content | **Placeholder** | every `TBC` and TODO comment must be replaced |
| Hosting | Done | Pages enabled on `main`, repo root |
| Analytics | None | deliberately. No cookies, nothing loaded from third parties except the font files |

## The nine competitions

Defined once in the build script and written into three files. Slugs are what `?event=` links and the form use.

| Event | Slug | Format | Entry |
| --- | --- | --- | --- |
| Table Tennis | `table-tennis` | Singles knockout, best of five games to 11 | Singles |
| Carroms | `carroms` | Knockout, two boards side by side | Singles or pairs |
| Chess | `chess` | Knockout, 10 minutes each side | Singles |
| Arm Wrestling | `arm-wrestling` | Weight-category knockout, best of three pulls | Singles |
| Penalty Shootout | `penalty-shootout` | Five kicks each, sudden death if level | Singles |
| Throw In (Girls) | `throw-in-girls` | Football throw-in for distance | Girls only |
| Badminton | `badminton` | Singles and doubles knockout, best of three | Singles or pairs |
| Football 7-a-side | `football-7s` | Groups then knockout, squads of 7 to 10 | Team |
| Basketball 3x3 | `basketball-3s` | Groups then knockout, squads of 3 to 4 | Team |

**Open question, recorded here so it is not lost:** the original brief listed "carroms" **twice**. It was treated as a typo and listed once. If carroms is really two events (singles and doubles, or junior and senior), split it into two rows, two slugs and two tick-boxes.

The list lives in **three** places and must stay in sync:

1. `index.html`, the nine index rows
2. `events.html`, the same nine rows plus format text
3. `register.html`, the tick-boxes; values are the slugs above. Links of the shape `register.html?event=table-tennis` tick that box on arrival (see `js/site.js`).

## File map

```
aquil/
|-- index.html        Hero, nine-competition index, programme teaser, entry, questions
|-- events.html       All nine competitions as a ruled index, entry rules, height and weight
|-- schedule.html     Day one and day two sheets, on-the-day facts
|-- register.html     Per-participant form with an event tick-list
|-- faq.html          Fifteen questions as native details elements
|-- 404.html          Not-found page
|-- css/style.css     The whole design system. Hallmark stamp on line 1, tokens next
|-- js/site.js        Mobile nav, ?event= tick, form guard, footer year
|-- .nojekyll         Stops GitHub Pages running Jekyll
|-- README.md         This file
```

No `package.json`, no lockfile, no build output. The repository is the site.

## The registration form

One submission per person. Fields, in page order:

| Field | `name` | Control | Required | Notes |
| --- | --- | --- | --- | --- |
| Full name | `full_name` | text, autocomplete name | yes | |
| Roll number | `roll_number` | text | yes | checked at the desk on the day |
| Course | `course` | select | yes | B.Com, BCA, BBA, BA, B.Sc, Psychology, Other |
| Specialisation | `specialisation` | select | no | None, CA, BA, Other |
| Year | `year` | select | yes | 1, 2, 3 |
| Contact number | `phone` | tel, autocomplete tel | yes | WhatsApp accepted; this replaces email |
| Height | `height_cm` | number, 100 to 250 | yes | arm wrestling brackets |
| Weight | `weight_kg` | number, 25 to 200, 0.5 steps | yes | arm wrestling brackets |
| Events | `events` | checkbox group, one per event | at least one | enforced by `js/site.js` |
| Rules | `agree_rules` | checkbox | yes | |
| hidden | `_subject`, `_gotcha` | | | Formspree email subject and honeypot |

**There is no email field, on purpose.** Participants are contacted on the phone number. Formspree still emails the *organiser* address the form was created with, so submissions are not lost.

The course, specialisation and year option lists are the obvious things to extend: they are plain `<option>` elements in `register.html`. Anything added there also needs a matching row in this README, nothing else.

## The design system

Built with the **Hallmark** skill, version 2.0.0 (https://github.com/nutlope/hallmark). Read `skills/hallmark/SKILL.md` before changing the visual layer, and `references/themes/sport.md` for this theme's rules.

- **Theme:** sport, chosen by hand from `references/themes/index.json` because Node was not available for `theme.mjs deal`. The stamp records `deal: manual`.
- **Material:** cool concrete paper (`oklch(98% 0.005 250)`), blue-black ink, Saira Condensed 800 in capitals for display, Albert Sans for body, JetBrains Mono for times. Volt `oklch(88% 0.2 120)` is the only accent and always a **fill** with ink on top, never type.
- **Surfaces:** two rule weights, no boxed cards, no shadows. Rows and tables are separated by hairlines; a 2px bar rule opens and closes a table.
- **Labels:** body face, one step smaller, sentence case, untracked. No eyebrows, no tracked capitals anywhere.
- **Motion:** state only. A row lifts one paper step on hover, a link grows a deep-volt underline. No reveals, no parallax, nothing looping.

The skill's floor is binding: tokens for every colour and font, `overflow-x: clip` on html and body, `:focus-visible` on every control, reduced-motion fallback, no invented metrics or quotes. The stamp on line 1 of the stylesheet records the theme, the deal, the critique line and any waivers. Keep it there.

**sloplint was not run.** It is a Node script and the build machine has no Node. On a machine with Node:

```bash
npx skills add nutlope/hallmark -g
node ~/.claude/skills/hallmark/scripts/sloplint.mjs css/style.css --genre editorial --render
```

Fix every FAIL and waive or fix every REFLEX, recording waivers under the stamp.

## Decisions, and why

1. **Static HTML instead of a framework.** Six pages of content. A build step would add Node and a deploy pipeline for no benefit and would make the site uneditable from a phone.
2. **Registration is per person, not per team.** The form collects a roll number, course, year, height and weight, all of which belong to one individual. Team events therefore take the team name in the notes field rather than a squad table.
3. **Events are tick-boxes, not a dropdown.** People commonly enter several events at once, and a single `<select>` can only carry one. `?event=slug` still pre-ticks the box.
4. **No email anywhere.** A college event confirms on WhatsApp or a phone call. Removing the field also removes a whole class of "email never arrived" support.
5. **A ruled index, not cards.** The Sport theme refuses boxed cards: a competition is one row with name, format and an enter link.
6. **The programme is a sheet.** Times in mono, hairline rows, a bar rule top and bottom, and a horizontal scroller on narrow screens.
7. **No photography.** The repo stays text-only so every change is diffable. If photos arrive, put them in `assets/`, follow the theme's duotone treatment, and credit them in the footer.
8. **Free entry, and open to other colleges.** With no fee there is no payment step, no refunds policy and no cash at the desk. Roll number plus college ID is the whole eligibility check, which also covers visiting colleges.
9. **The what-happens-next panel is deliberately blank.** No confirmation timing has been agreed, so `register.html` promises nothing beyond a screen message once the form is live. Put the panel back when the process is settled.

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
| Entry deadline | hero facts on index and register, FAQ | TBC |
| Match times and draw | `schedule.html` sheets | provisional |
| Contact email | footer, `events.html`, `register.html`, `faq.html` | hello@example.com |
| Social link | footer | `href="#"` |
| Organiser name | footer | Organiser TBC |
| What happens next panel | `register.html`, deliberately blank | TODO comment in the markup, nothing promises a timeline |
| Course list | `register.html` `<select id="course">` | B.Com, BCA, BBA, BA, B.Sc, Psychology, Other |
| Specialisation list | `register.html` `<select id="specialisation">` | None, CA, BA, Other |
| Arm wrestling weight classes | `events.html`, `schedule.html`, `faq.html` | not stated |
| Refunds, weather, spectators | `faq.html` | written, TBC where unresolved |
| Formspree form ID | `register.html` form action | `REPLACE_ME` |

## Registration setup

The form is committed **switched off**: `js/site.js` finds `REPLACE_ME` in the action, shows the notice, disables the button, and blocks any stray submit.

1. Create a form at https://formspree.io (free tier: 50 submissions a month).
2. Copy the endpoint, shaped like `https://formspree.io/f/abcdwxyz`.
3. In `register.html`, replace the action URL.
4. Commit. The notice hides and the button re-enables on its own.

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

- Registration rewritten from "enter a team" to **one form per participant**: full name, roll number, course, specialisation, year, contact number, height, weight, and a tick-box per event.
- **Email removed everywhere** in the form. Confirmation now happens on the phone number.
- Event list replaced: table tennis, carroms, chess, arm wrestling, penalty shootout, throw in (girls), badminton, football 7-a-side, basketball 3x3. Volleyball and the 100m sprint are gone.
- Old per-team machinery deleted: team name, captain, squad size, level. Team events take a team name in the notes.
- New CSS for the tick-box grid (`.checks`, `.field-label`, `.field-error`), one column on narrow screens.
- `js/site.js` now ticks a checkbox from `?event=`, requires at least one event, and blocks submits while `REPLACE_ME` is still in the action.

### 2026-11-17, free entry, inter-college, blank next steps

- Every fee reference removed. The index lost its fee column (~~.index-row~~ is three columns now, not four), hero facts read Free, and the FAQ answers "Nothing".
- Entry widened to **students of any college**. The roll number is still collected, now as the check-in key rather than a residency check.
- The register page's "What happens next" panel was removed, replaced by a TODO comment. The page is single-column (~~.entry-single~~) until it returns.
- Course list: **B.Tech replaced with Psychology**. Options are B.Com, BCA, BBA, BA, B.Sc, Psychology, Other.
- "Can I get a refund?" became "Can I change my events after registering?", since free entry has nothing to refund.

## Next steps

1. **Connect Formspree**, replacing `REPLACE_ME` in `register.html`. Everything else on the form works already.
2. **Confirm the event list**, especially the duplicate "carroms" in the brief, and set arm wrestling weight classes.
3. **Replace the placeholders**: dates, venue, deadline, contact email, social link, organiser name.
4. **Extend the course, specialisation and year option lists** if the college has more.
5. **Write the "what happens next" panel** on `register.html`: the four-step list was removed, only a TODO comment remains.
6. **Publish the draw** in `schedule.html` once entries close.
7. Optional: a `thanks.html` page and a `_next` redirect on the form.
8. On a machine with Node: run `sloplint` on `css/style.css` and record the result in the stamp.

## Cleanup checklist, build machine

- [ ] GitHub token used during the build revoked at https://github.com/settings/tokens?type=beta
- [ ] GitHub signed out in the browser
- [ ] Chat session deleted
- [ ] Nothing was written to that machine's disk: no clone, no temp files

## Resuming in a new session

```text
I am continuing work on the Heartian Hustle 3.0 event site: https://github.com/unnnii/aquil

Read README.md first. It covers the structure, the Hallmark design system in use,
the nine events and their slugs, the registration fields, the placeholders and
the next steps. Do not redesign from scratch.

Stack: plain HTML, CSS and JS. No framework, no build step, GitHub Pages from main.
Design system: Hallmark v2.0.0, theme "sport". Keep the stamp on line 1 of css/style.css
and keep every colour and font behind a token.

Registration is one form per participant, not per team, and there is no email field.
The event list lives in three files: index.html, events.html, register.html.

Before editing: grep -rn "TODO" *.html

Next task: <say what you want done>
```
