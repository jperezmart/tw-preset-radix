# Simple [Tailwind](https://tailwindcss.com/) preset for [Radix Themes](https://www.radix-ui.com/themes/docs/overview/getting-started)

## Compatibility

| Tailwind CSS Version | Radix themes Version | Preset Version |
| -------------------- | -------------------- | -------------- |
| v4                   | v3                   | v1 (current)   |

## Installation

```bash
npm install tw-preset-radix --dev
```

## Tokens and Classes

This preset overrides the default tailwind classes with the radix ones, except for the space tokens that starts with the rx suffix (for example you can use both `px-2` based on tailwind spacing and `px-rx-2` based on radix spacing).

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
