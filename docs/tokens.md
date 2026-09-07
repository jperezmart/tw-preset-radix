# Token notes

The preset maps Radix Themes' CSS variables onto Tailwind's `@theme inline` namespaces, so
most tokens behave exactly like their Radix counterparts. This page collects the ones whose
behaviour is *not* obvious from the class name — the cases where a Tailwind habit gives you
the wrong result.

Everything here is verified against `@radix-ui/themes` v3.

- [Item radius (`rounded-item-*`)](#item-radius-rounded-item)
- [Radius reacts to the theme, not just to the step](#radius-reacts-to-the-theme-not-just-to-the-step)
- [Panel colors (`bg-panel`, `bg-panel-solid`, `bg-panel-translucent`)](#panel-colors)
- [`bg-background` and where the page color actually comes from](#bg-background)
- [`accent` and `gray` are aliases, not palettes](#accent-and-gray-are-aliases-not-palettes)
- [`bg-surface` vs `bg-accent-surface`](#bg-surface-vs-bg-accent-surface)
- [Extra color steps: `contrast`, `surface`, `track`, `indicator`](#extra-color-steps)
- [`shadow-1` is not a shadow](#shadow-1-is-not-a-shadow)
- [The `dark` variant matches `.dark`, not `.dark-theme`](#the-dark-variant)
- [Spacing: `p-2` and `p-rx-2` are different scales](#spacing)
- [Breakpoints and the missing `2xl`](#breakpoints)
- [Why `--radius-2: var(--radius-2)` is not a circular reference](#the-theme-inline-trick)

---

## Item radius (`rounded-item-*`) <a id="item-radius-rounded-item"></a>

`--radius-full` is `0px` under every theme radius setting **except** `radius="full"`, where it
becomes `9999px`. That makes `max(var(--radius-N), var(--radius-full))` read as:

> use step N normally, but become a pill if the theme is set to `radius="full"`.

That is the formula Radix uses for small interactive elements, and it is what
`rounded-item-1` … `rounded-item-6` expose. `rounded-item` (no suffix) is an alias of step 2.

Radix applies it to `Button`, `Badge`, `TextField`, `SelectTrigger`, `SegmentedControl`,
`Avatar`, `Blockquote` and the `ScrollArea` bar and thumb. It does **not** apply it to `Card`,
`Box`, `Dialog`, popovers or panels — those keep a fixed `radius-3` / `radius-4` even at
`radius="full"`, because a pill-shaped panel looks broken.

Which step Radix picks scales with the component size. For `Avatar`:

| Component size | Radius used |
| --- | --- |
| 1–2 | `rounded-item-2` |
| 3–4 | `rounded-item-3` |
| 5 | `rounded-item-4` |
| 6–7 | `rounded-item-5` |
| 8–9 | `rounded-item-6` |

So if you hand-roll a chip that has to sit next to a Radix `Badge` at any theme setting:

```jsx
<span className="rounded-item-2 bg-accent-3 px-rx-2 py-rx-1 text-2">Draft</span>
```

Using plain `rounded-2` there would look identical at the default theme and then fail to go
pill the day someone switches the app to `radius="full"`.

Directional variants work too, since they all derive from the `--radius-*` namespace:
`rounded-t-item-3`, `rounded-l-item-5`, and so on.

## Radius reacts to the theme, not just to the step <a id="radius-reacts-to-the-theme-not-just-to-the-step"></a>

`rounded-1` … `rounded-6` are not fixed pixel values. Radix defines them as
`calc(<px> * var(--scaling) * var(--radius-factor))`, and `--radius-factor` comes from the
`radius` prop on `<Theme>`:

| `<Theme radius>` | `--radius-factor` | `--radius-full` |
| --- | --- | --- |
| `none` | `0` | `0px` |
| `small` | `0.75` | `0px` |
| `medium` (default) | `1` | `0px` |
| `large` | `1.5` | `0px` |
| `full` | `1.5` | `9999px` |

At `radius="none"` every `rounded-N` collapses to `0px`. That is intended — don't "fix" it by
hardcoding `rounded-[4px]`, which is exactly the escape hatch that breaks theming.

## Panel colors <a id="panel-colors"></a>

Three related tokens:

- `bg-panel-solid` — always opaque (`white` in light, `--gray-2` in dark).
- `bg-panel-translucent` — always semi-transparent, meant to sit over a blurred backdrop.
- `bg-panel` — **resolves to one of the two above** depending on the `panelBackground` prop of
  the nearest `<Theme>` (it is set through the `data-panel-background` attribute). The default
  is `translucent`.

Use `bg-panel` for anything that should follow the app-wide setting, and reach for the explicit
ones only when a surface must stay opaque (or translucent) regardless.

Note that Radix pairs the translucent panel with `backdrop-filter: blur(64px)` on its own
components. `bg-panel` gives you the color only — add `backdrop-blur-[64px]` yourself if you
are building the surface by hand.

The preset also ships two custom variants to branch on that setting:

```jsx
<div className="bg-panel solid:shadow-2 translucent:backdrop-blur-[64px]">…</div>
```

## `bg-background` <a id="bg-background"></a>

`--color-background` is `white` in light appearance and `--gray-1` in dark — note that it is
*not* `--gray-1` in both, so it does not match `bg-gray-1` in light mode.

Radix only paints it on the `<Theme>` element when that theme has `data-has-background="true"`,
which happens for the root theme or for a nested one that explicitly sets `appearance`. If a
nested section looks transparent when you expected the page color, that is why — apply
`bg-background` yourself.

## `accent` and `gray` are aliases, not palettes <a id="accent-and-gray-are-aliases-not-palettes"></a>

`bg-accent-9` does not resolve to a fixed hue. `--accent-*` is re-pointed at whichever scale the
`accentColor` prop of `<Theme>` names, so the same class follows the app's accent everywhere and
changes with a theme switch. Same idea for the gray scale, which additionally has an `auto` mode
that picks the gray whose temperature matches the accent.

Prefer `accent`/`gray` over naming a concrete hue (`bg-blue-9`, `bg-slate-3`) unless you
deliberately want that color to stay put when the theme changes.

## `bg-surface` vs `bg-accent-surface` <a id="bg-surface-vs-bg-accent-surface"></a>

Two similarly named tokens for different jobs:

| | `bg-surface` | `bg-accent-surface` |
| --- | --- | --- |
| Color | untinted — `rgba(255,255,255,0.85)` light, `rgba(0,0,0,0.25)` dark | tinted — `#f1f9ffcc` light, `#11213d80` dark (blue) |
| Follows the accent | no, always the same neutral | yes, and also a component's own `color=` prop |

Radix uses `--color-surface` for **input-like** controls in `variant="surface"` — `TextField`,
`TextArea`, `Select.Trigger`, `SegmentedControl`, unchecked `Checkbox` and `Radio`,
`CheckboxCards`, `RadioCards` — and the per-color `--accent-surface` only for `Badge` and
`Button`. The rule of thumb: `bg-surface` is the well of an input, `bg-accent-surface` is the
soft fill of something whose color carries meaning.

```jsx
// hand-rolled input that has to match a Radix TextField
<div className="bg-surface shadow-1 rounded-2 px-rx-2">…</div>

// status badge: the tint is the message
<span className="bg-red-surface rounded-item-2 px-rx-2">Failed</span>
```

Both are deliberately translucent — they are meant to sit *on top of* `bg-panel` and let it show
through, which is what makes them work over a blurred translucent panel. `bg-white/85` looks the
same in light mode and then stays white in dark, where the token flips to black at 25%. There is
also no scale step that substitutes for it: `bg-gray-2` is opaque and blocks the panel.

Mind the naming asymmetry: `--gray-surface` (`#ffffffcc`) is the gray scale's tint and is *not*
the same token as the global neutral `--color-surface`, despite how they read.

## Extra color steps <a id="extra-color-steps"></a>

Beyond the 1–12 scale and the `a1`–`a12` alpha variants, every color exposes four semantic steps:

- `-contrast` — the text color guaranteed to be readable **on top of** step 9. Use
  `bg-accent-9 text-accent-contrast`, never `text-white`, which breaks on light-9 scales such as
  amber, lime, mint, sky and yellow.
- `-surface` — a translucent tinted fill for card- and input-like surfaces.
- `-indicator` and `-track` — the filled and unfilled parts of progress-style components.

## `shadow-1` is not a shadow <a id="shadow-1-is-not-a-shadow"></a>

`--shadow-1` is composed entirely of `inset` layers: it draws an inner border and a subtle inner
highlight, used for inset surfaces like text field wells. `shadow-2` … `shadow-6` are the actual
elevation ramp. If you wanted "a small drop shadow", you wanted `shadow-2`.

## The `dark` variant <a id="the-dark-variant"></a>

The preset defines `dark` as `&:where(.dark, .dark *)`. Radix's own CSS also honours
`.dark-theme`, so if you toggle dark mode by putting `dark-theme` on an element, Radix's tokens
will flip but your `dark:` utilities will not. Use `<Theme appearance="dark">` (which emits the
`dark` class) or set `class="dark"` yourself.

## Spacing <a id="spacing"></a>

Tailwind's own spacing scale is left intact, and Radix's is added alongside under the `rx-`
prefix — `p-2` and `p-rx-2` are both valid and *not* the same value. The Radix one is
`calc(<px> * var(--scaling))`, so it responds to the `scaling` prop on `<Theme>` (90%–110%);
the Tailwind one never does.

Use `rx-` spacing for anything that has to line up with Radix components, and plain Tailwind
spacing for layout that stands on its own.

## Breakpoints <a id="breakpoints"></a>

Matched to the Radix scale: `xs` 520px, `sm` 768px, `md` 1024px, `lg` 1280px, `xl` 1640px.
These are wider than Tailwind's defaults — `lg:` triggers at 1280px here, not 1024px. Tailwind's
`2xl` is unset because Radix has no equivalent, so `2xl:*` classes will not compile.

## The `@theme inline` trick <a id="the-theme-inline-trick"></a>

The generated theme is full of lines that look circular:

```css
--radius-2: var(--radius-2);
--color-panel: var(--color-panel);
```

They are not. The block is `@theme inline`, which tells Tailwind to inline the value into the
generated utilities instead of re-emitting a variable that points at itself. The left-hand name
is Tailwind's namespaced token; the right-hand one is Radix's runtime variable. Keeping the names
identical is deliberate — it means every utility stays live and follows `<Theme>` prop changes at
runtime, rather than baking in whatever the value was at build time.

It also means the utilities are inert without Radix's stylesheet loaded — `bg-panel` compiles to
`background-color: var(--color-panel)`, and nothing defines that variable until
`@radix-ui/themes/styles.css` is present and an element carries the `radix-themes` class. The
all-in-one `@import "tw-preset-radix"` handles this; if you wire the imports yourself, keep the
order shown in the README's *Manual import* section.
