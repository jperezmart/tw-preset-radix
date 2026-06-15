# Simple [Tailwind](https://tailwindcss.com/) preset for [Radix Themes](https://www.radix-ui.com/themes/docs/overview/getting-started)

## Compatibility

| Tailwind CSS Version | Radix themes Version | Preset Version |
| -------------------- | -------------------- | -------------- |
| v4                   | v3                   | v2 (current)   |
| v4                   | v3                   | v1             |

## Installation

```bash
npm install tw-preset-radix --dev
```

## Tokens and Classes

This preset overrides the default tailwind classes with the radix ones, except for the space tokens that starts with the rx suffix (for example you can use both `px-2` based on tailwind spacing and `px-rx-2` based on radix spacing).

A few things to note:

- **Alpha colors** follow Radix's own naming: `bg-gray-a5`, `text-accent-a11`, `border-white-a3`, `bg-black-a6` (mirroring the `--gray-a5` / `--accent-a11` CSS variables).
- **Font families** are mapped to Radix, so `font-sans` uses `--default-font-family` and `font-mono` uses `--code-font-family`.
- **Breakpoints** match the Radix scale: `xs` (520px), `sm` (768px), `md` (1024px), `lg` (1280px), `xl` (1640px). Tailwind's default `2xl` is unset because Radix has no equivalent.

For the complete list of tokens check the radix documentation: https://www.radix-ui.com/themes/docs/theme/overview#tokens

For the tailwind classes check the preset theme: https://github.com/jperezmart/tw-preset-radix/blob/main/src/index.css

## Usage

### 1. All-in-one import (recommended)

When importing the styles, instead of importing the tailwind css file, importing this preset in the css file:

```css
@import "tw-preset-radix";
```

That's it!

Now you can use tailwind with radix-themes's style applied:

```tsx
export default function Page() {
  // `bg-tomato-1` will be `background-color: var(--tomato-1)`
  // `text-accent-contrast` will be `color: var(--accent-contrast);`
  return <div className="bg-tomato-1 text-accent-contrast">Hello</div>;
}
```

### 2. Manual import (advanced)

Note that you don't have to import tailwind or radix-themes styles, this preset will handle that for you. If you want to import it yourself, you can use the `./theme.css` file:

```css
@layer theme, base, radix-themes, components, utilities;

@import "tailwindcss"; /* <-- import the tailwind styles (they have theme, base, components, utilities layers already assigned) */
@import "@radix-ui/themes/styles.css" layer(radix-themes); /* <-- import the radix-themes styles */

@import "tw-preset-radix/theme.css"; /* <-- import the preset */
```

## Migrating from v1 to v2

> 💡 There's a migration skill that automates this. From any AI client that
> supports [Agent Skills](https://www.skills.sh/) (Claude Code, Cursor, …):
>
> ```bash
> npx skills add jperezmart/tw-preset-radix
> ```
>
> then run `/migrate-tw-preset-radix-v1-to-v2`. It renames the alpha color
> classes across your codebase, migrates `2xl:` usages, and bumps the version.
> See [`skills/migrate-tw-preset-radix-v1-to-v2`](./skills/migrate-tw-preset-radix-v1-to-v2).

v2 contains breaking changes to better match Radix and Tailwind conventions:

- **Alpha color classes were renamed** from `…A-{n}` to `…-a{n}`, matching Radix's CSS variables. Rename your classes:
  - `bg-grayA-5` → `bg-gray-a5`
  - `text-accentA-11` → `text-accent-a11`
  - `border-whiteA-3` → `border-white-a3`, `bg-blackA-6` → `bg-black-a6`
- **The `2xl` breakpoint was removed** (Radix has no `2xl`). Replace `2xl:` usages with `xl:` or a custom breakpoint.

New, non-breaking additions: `font-sans` / `font-mono` now resolve to Radix font families.
