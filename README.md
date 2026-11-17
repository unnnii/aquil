# Aquil Open, event website

> **If you are an AI agent opening this repository: read this whole file before you change anything.**
> It is the single source of truth for what exists, what was decided and what is left to do.
> If your context window is nearly full, read this file to the end and continue from "Next steps".
> Do not redesign from scratch and do not introduce a framework.

A static, multi-page website for **Aquil Open**, a two-day, six-competition multi-sport tournament.

| | |
| --- | --- |
| Live site | https://unnnii.github.io/aquil/ |
| Repository | https://github.com/unnnii/aquil |
| Owner | https://github.com/unnnii |
| Stack | plain HTML, CSS, JavaScript. No framework, no build step, no bundler |
| Fonts | Saira Condensed 800, Albert Sans 400/500, JetBrains Mono 500, served by Google Fonts |
| Hosting | GitHub Pages, branch `main`, folder `/` |
| Design system | Hallmark v2.0.0, theme "sport", genre editorial |

## Status at a glance

| Area | State | Notes |
| --- | --- | --- |
| Page structure | Done | 6 pages plus a 404 |
| Design system | Done | Hallmark Sport theme, token-driven, responsive to 360px |
| Mobile nav | Done | JS enhanced; falls back to a wrapped row without JS |
| Registration form | Built, **not connected** | needs a Formspree form ID, currently `REPLACE_ME` |
| Event content | **Placeholder** | every `TBC` and TODO comment must be replaced |
| Hosting | Done | Pages enabled on `main`, repo root |
| Custom domain | Not set | optional, Settings then Pages |
| Analytics | None | deliberately. No cookies, nothing loaded from third parties except the font files |

## File map

```
aquil/
|-- index.html        Hero, six-competition index, programme teaser, entry, questions
|-- events.html       All six competitions as a ruled index, roster rules
|-- schedule.html     Day one and day two sheets, on-the-day facts
|-- register.html     Formspree form, competition selector, what-happens-next
|-- faq.html          Ten questions as native details elements
|-- 404.html          Not-found page
|-- css/style.css     The whole design system. Hallmark stamp on line 1, tokens next
|-- js/site.js        Mobile nav, ?event= preselect, form guard, footer year
|-- .nojekyll         Stops GitHub Pages running Jekyll
|-- README.md         This file
```

No `package.json`, no lockfile, no build output. The repository is the site.

## The design system

Built with the **Hallmark** skill, version 2.0.0 (https://github.com/nutlope/hallmark). Read `skills/hallmark/SKILL.md` before changing the visual layer, and `references/themes/sport.md` for this theme's rules.

- **Theme:** sport, chosen by hand from `references/themes/index.json` because Node was not available for `theme.mjs deal`. The stamp records `deal: manual`.
- **Material:** cool concrete paper (`oklch(98% 0.005 250)`), blue-black ink, Saira Condensed 800 in capitals for display, Albert Sans for body, JetBrains Mono for times and fees. Volt `oklch(88% 0.2 120)` is the only accent and it is always a **fill** with ink on top, never type.
- **Surfaces:** two rule weights, no boxed cards, no shadows. Rows and tables are separated by hairlines; a 2px bar rule opens and closes a table.
- **Labels:** body face, one step smaller, sentence case, untracked. No eyebrows, no tracked capitals anywhere.
- **Motion:** state only. A row lifts one paper step on hover, a link grows a deep-volt underline. No reveals, no parallax, nothing looping.

The skill's floor is binding: tokens for every colour and font, `overflow-x: clip` on html and body, `:focus-visible` on every control, reduced-motion fallback, no invented metrics or quotes. The stamp on line 1 of the stylesheet must stay there; it records the theme, the deal, the critique line and any waivers.

**sloplint was not run.** It is a Node script and this machine has no Node. On a machine with Node, do:

```bash
npx skills add nutlope/hallmark -g
node ~/.claude/skills/hallmark/scripts/sloplint.mjs css/style.css --genre editorial --render
```

Fix every FAIL and waive or fix every REFLEX, recording waivers under the stamp.

## Decisions, and why

1. **Static HTML instead of a framework.** Six pages of content. A build step would add Node and a deploy pipeline for no benefit and would make the site uneditable from a phone.
2. **A ruled index, not cards.** The Sport theme refuses boxed cards: a competition is one row with name, format, fee and an enter link. It reads like a start list.
3. **The programme is a sheet.** Times in mono, hairline rows, a bar rule top and bottom. That is the theme's signature and the page's most useful furniture.
4. **Registration without a backend.** Formspree handles submissions and confirmations, so there is no server, no database and no credential to leak. Competitions link to `register.html?event=slug`, JavaScript preselects the sport, and the submission carries it as a field.
5. **No photography.** The repo stays text-only so every change is diffable. If photos arrive, put them in `assets/`, follow the theme's duotone treatment, and credit them in the footer.

## Placeholders to replace

Every placeholder is either visible text (`TBC`) or an HTML comment (`<!-- TODO: ... -->`) beside it.

```bash
grep -rn "TODO" *.html
grep -rn "TBC" *.html
```

| What | Where | Currently |
| --- | --- | --- |
| Event name | `<title>`, wordmark, hero `h1`, footer, all pages | Aquil Open |
| Dates | hero facts on index, schedule hero, footer | TBC |
| Venue and city | hero facts, schedule court columns | TBC |
| Entry deadline | hero facts on index and register, FAQ | TBC |
| Entry fee | `events.html` rows, `faq.html`, register facts | TBC |
| Team and solo counts | `events.html` hero facts | 3 and 3 |
| Match times and draw | `schedule.html` sheets | provisional |
| Contact email | footer, `events.html`, `register.html`, `faq.html` | hello@example.com |
| Social link | footer | `href="#"` |
| Organiser name | footer | Organiser TBC |
| Eligibility, refunds, weather, spectators | `faq.html` | answers written, TBC where unresolved |
| Formspree form ID | `register.html` form action | `REPLACE_ME` |

The competition list lives in **three** places and must stay in sync:

1. `index.html`, the six index rows
2. `events.html`, the full index
3. `register.html`, the `<select>` options; values are the slugs used in `?event=` links

Slugs: `football-5s`, `basketball-3x3`, `volleyball`, `badminton-doubles`, `table-tennis-singles`, `100m-sprint`, plus `other`.

## Registration setup

The form is committed **switched off**: `js/site.js` finds `REPLACE_ME` in the action, shows the notice and disables the submit button.

1. Create a form at https://formspree.io (free tier: 50 submissions a month).
2. Copy the endpoint, shaped like `https://formspree.io/f/abcdwxyz`.
3. In `register.html`, replace the action URL.
4. Commit. The notice hides and the button re-enables on its own.

Fields: `competition`, `team`, `captain`, `email`, `phone`, `squad_size`, `level`, `notes`, `agree_rules`, plus hidden `_subject` and `_gotcha`.

Optional: a hidden `_next` field with an absolute URL for a thank-you page, or swap the whole `<form>` for a Tally embed at https://tally.so (you lose the `?event=` preselect).

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
| `--font-outlier` | JetBrains Mono 500 | times, fees |

Type scale is 1.25 from a 16px body. Display heads are clamped and capped so the hero headline, sentence and actions fit 1280 x 800.

## Session log

### 2026-11-17, initial build

- Repository `unnnii/aquil` created empty and public, default branch `main`.
- Built from a shared Windows machine with **no git, no gh CLI and no Node**, so every file went in through the GitHub REST API: seed `PUT /contents/index.html` (GitHub refuses to create a tree in an empty repo, 409), then `POST /git/trees` with inline content, `POST /git/commits`, `PATCH /git/refs/heads/main`. No clone, no local files, nothing installed.
- Pages enabled on `main` at the root.

### 2026-11-17, Hallmark pass

- Pulled the Hallmark skill from GitHub instead of `npx skills add`, because there is no npm or npx here. Read `SKILL.md`, `anatomy.md`, the editorial genre, `themes/sport.md` and gates sections 1 to 3.
- Dealt the **sport** theme by hand (`deal: manual`) and rebuilt the visual layer to its rules: condensed caps, concrete paper, volt as fill, two rule weights, no boxed cards, no shadows.
- Removed everything the skill's floor bans: every eyebrow, every tracked-capital label, the arrow gluing itself to link text, the slash-joined meta string, the literal colours that were sitting outside the token block.
- Added the stamp and critique line to line 1 of `css/style.css`, `overflow-x: clip`, `:focus-visible` on all controls, and a reduced-motion fallback.
- `sloplint` was not run: it needs Node. Results in the stamp say so rather than claiming a pass.

## Next steps

1. **Replace the placeholders**, starting with name, dates, venue and deadline, since they appear on every page.
2. **Create the Formspree form** and swap `REPLACE_ME`.
3. **Set the contact email and social link** in the footer of all six pages.
4. **Confirm fees** and put them in the `events.html` rows and the FAQ.
5. **Publish the draw** in `schedule.html` once entries close.
6. Optional: `thanks.html` and a `_next` redirect on the form.
7. Optional: an OG image at `assets/og.png` plus an `og:image` tag.
8. On a machine with Node: run `sloplint` on `css/style.css` and record the result in the stamp.

## Cleanup checklist, original machine

- [ ] Token `opencode-event-site` revoked at https://github.com/settings/tokens?type=beta
- [ ] GitHub signed out in the browser
- [ ] Chat session deleted
- [ ] Nothing was written to that machine's disk: no clone, no temp files

## Resuming in a new session

```text
I am continuing work on the Aquil Open event site: https://github.com/unnnii/aquil

Read README.md first. It covers the structure, the Hallmark design system in use,
the placeholders and the next steps. Do not redesign from scratch.

Stack: plain HTML, CSS and JS. No framework, no build step, GitHub Pages from main.
Design system: Hallmark v2.0.0, theme "sport". Keep the stamp on line 1 of css/style.css
and keep every colour and font behind a token.

Before editing: grep -rn "TODO" *.html

Next task: <say what you want done>
```
