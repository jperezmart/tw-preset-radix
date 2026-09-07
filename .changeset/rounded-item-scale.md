---
"tw-preset-radix": minor
---

Add the full item radius scale and expose the neutral surface token.

- `rounded-item-1` through `rounded-item-6`, each mapping to Radix's `max(var(--radius-N), var(--radius-full))` formula. `rounded-item` keeps its current behaviour as an alias of step 2.
- `bg-surface` (`--color-surface`), the untinted translucent fill Radix uses for `variant="surface"` inputs — `TextField`, `TextArea`, `Select.Trigger`, `SegmentedControl`, `Checkbox`, `Radio`, `CheckboxCards` and `RadioCards`. Distinct from the per-color `bg-accent-surface`, which is tinted and only used by `Badge` and `Button`.
