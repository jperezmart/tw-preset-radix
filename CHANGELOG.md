# tw-preset-radix

## 2.2.0

### Minor Changes

- [#3](https://github.com/jperezmart/tw-preset-radix/pull/3) [`a138b92`](https://github.com/jperezmart/tw-preset-radix/commit/a138b923d297b43720485c6113fc67a647a555ba) Thanks [@jperezmart](https://github.com/jperezmart)! - Add the full item radius scale and expose the neutral surface token.
  
  - `rounded-item-1` through `rounded-item-6`, each mapping to Radix's `max(var(--radius-N), var(--radius-full))` formula. `rounded-item` keeps its current behaviour as an alias of step 2.
  - `bg-surface` (`--color-surface`), the untinted translucent fill Radix uses for `variant="surface"` inputs — `TextField`, `TextArea`, `Select.Trigger`, `SegmentedControl`, `Checkbox`, `Radio`, `CheckboxCards` and `RadioCards`. Distinct from the per-color `bg-accent-surface`, which is tinted and only used by `Badge` and `Button`.

### Patch Changes

- [#3](https://github.com/jperezmart/tw-preset-radix/pull/3) [`a138b92`](https://github.com/jperezmart/tw-preset-radix/commit/a138b923d297b43720485c6113fc67a647a555ba) Thanks [@jperezmart](https://github.com/jperezmart)! - Document the non-obvious tokens in `docs/tokens.md`: the item radius formula, panel colors and the `panelBackground` prop, `bg-background`, `accent`/`gray` as aliases, the `-contrast` / `-surface` / `-track` / `-indicator` steps, `shadow-1` being inset-only, the `dark` variant matching `.dark` only, `p-2` vs `p-rx-2`, breakpoints, and the `@theme inline` self-reference trick.

## 2.1.1

### Patch Changes

- [`0d0124a`](https://github.com/jperezmart/tw-preset-radix/commit/0d0124a3b6d7ec7fe7e9c3ef59a306995929788e) - Add npm version and license badges to the README.
  
  The README ships in the tarball and is what npmjs.com renders, so this reaches
  the registry page rather than only GitHub. The version badge reads live from the
  registry, which makes "what is actually published right now" answerable at a
  glance and removes a number nobody has to remember to update.
  
  This is also the first release under the publishing standard: changesets plus npm
  OIDC trusted publishing, with provenance and no npm token anywhere.
