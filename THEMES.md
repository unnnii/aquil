# Themes

Two themes have shipped. This file exists so a later change — by a person or an
agent — can put either one back without guessing.

## Now: the deck palette

Taken from the 2026 sponsorship deck on 19 Nov 2026.

- Page: indigo night `#080d29`, with a fixed magenta/cyan/orange glow painted by
  `body::before` (the block after the base rules in `css/style.css`).
- Text: cream `#fff4da`, headings `#ffedbc`.
- Rules and borders: gold `#c9a65c`, hairlines at `rgba(255,240,183,0.18)`.
- Action colour: lime `#9ccb3b` with indigo text `#0a1030`; hover orange `#ff8a3d`.
- Type: Albert Sans everywhere, JetBrains Mono for numbers.
- `color-scheme: dark`, favicon lime on indigo, `theme-color` `#080d29`.

## Before: paper and volt

The original light theme, live until 19 Nov 2026. Its last commit is tagged
**`theme-light-2026`**. To bring it back:

```sh
git revert --no-commit 0319009 e214d43 cb36823 && git commit   # keeps history and this file
```

A hard reset does the same in one step but also throws away every commit after
the theme, including this file:

```sh
git reset --hard theme-light-2026
```

Either way the tag keeps the code. If this file is gone, the old stylesheet is
still readable with `git show theme-light-2026:css/style.css`.

The token block of that theme, for a partial restore:

```css
--color-paper: oklch(98% 0.005 250);
--color-paper-2: oklch(95% 0.006 250);
--color-paper-3: oklch(91.5% 0.007 250);
--color-ink: oklch(16% 0.08 260);
--color-ink-2: oklch(22% 0.06 258);
--color-muted: oklch(50% 0.02 250);
--color-rule: oklch(78% 0.008 250);
--color-rule-2: oklch(36% 0.06 255);
--color-accent: oklch(88% 0.2 120);
--color-accent-ink: oklch(16% 0.08 260);
--color-accent-deep: oklch(58% 0.145 125);
--color-focus: oklch(58% 0.145 125);
--color-slot: oklch(76% 0.07 258);
--font-display: "Saira Condensed", "Arial Narrow", sans-serif;
--font-body: "Albert Sans", ui-sans-serif, system-ui, sans-serif;
--font-outlier: "JetBrains Mono", ui-monospace, monospace;
--tracking-display: -0.015em;
```

A full restore also means `color-scheme: light`, the `.mast` background back to
`var(--color-paper)`, the three glow lines and the `.nav a.btn-volt` block
removed, the Saira Condensed font link back in every page head, and the favicon
and `theme-color` back to `#0d1220` / `#f7f8fa`.
