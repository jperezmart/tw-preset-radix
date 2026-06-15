---
name: migrate-tw-preset-radix-v1-to-v2
description: |
  Usa este skill para migrar proyectos de tw-preset-radix v1.x a v2.x. Cubre el
  rename de las clases de color alfa (`grayA-5` → `gray-a5`) en todo el código,
  la eliminación del breakpoint `2xl`, y las nuevas utilidades de fuente
  (`font-sans` / `font-mono` mapeadas a Radix).
command: /migrate-tw-preset-radix-v1-to-v2
---

# Migración tw-preset-radix v1 → v2

`tw-preset-radix` es un preset de Tailwind CSS v4 que expone los tokens de Radix
Themes como clases de Tailwind. La migración v1 → v2 es **un rename de clases en
el código del consumidor** (no hay API de JS/TS), más la retirada de un
breakpoint.

## Breaking changes

1. **Colores alfa renombrados** de `{color}A-{n}` a `{color}-a{n}`, para
   reflejar las variables CSS de Radix (`--gray-a5`, `--accent-a11`). Afecta a
   **todos** los colores (accent, white, black y los named colors de Radix) en
   los escalones `1`–`12` y a **cualquier** utilidad que use ese color:
   `bg-`, `text-`, `border-`, `ring-`, `fill-`, `stroke-`, `from-`, `via-`,
   `to-`, `outline-`, `decoration-`, `divide-`, `caret-`, `accent-`, `shadow-`,
   etc. Ejemplos:
   - `bg-grayA-5` → `bg-gray-a5`
   - `text-accentA-11` → `text-accent-a11`
   - `border-whiteA-3` → `border-white-a3`
   - `hover:bg-blackA-6/50` → `hover:bg-black-a6/50`
2. **Breakpoint `2xl` eliminado**. Radix no tiene `2xl`; v2 lo desactiva
   (`--breakpoint-2xl: initial`) para que no quede por debajo de `xl` (1640px).
   Cualquier variante `2xl:` deja de existir y hay que migrarla a mano.

> No-breaking (informativo): v2 mapea `font-sans` → `--default-font-family` y
> `font-mono` → `--code-font-family`. Si el proyecto ya usaba `font-sans`/
> `font-mono`, ahora resolverán a la tipografía de Radix. No requiere acción,
> pero avisa al usuario por si dependía de las fuentes por defecto de Tailwind.

## Orden de migración

### Paso 1 — Comprueba que aplica

Lee el `package.json` del proyecto. Si `tw-preset-radix` no aparece, aborta y
avisa al usuario. Si la versión ya es `^2.0.0` o mayor, aborta.

En monorepos, busca también en `pnpm-workspace.yaml` bajo `catalog:` y en los
`package.json` de cada `apps/*` y `packages/*`.

### Paso 2 — Sube la versión

Actualiza la versión a `^2.0.0`:

- `package.json` directo: edita la línea correspondiente.
- pnpm catalog: actualiza `pnpm-workspace.yaml` → `catalog.tw-preset-radix: ^2.0.0`.

Ejecuta el package manager del proyecto para regenerar el lockfile (lee
`packageManager` en el `package.json` raíz). Ej.: `pnpm install`, `npm install`,
`yarn install`.

### Paso 3 — Pasa el codemod en dry-run

Este skill incluye un codemod determinista, `codemod.mjs` (en el mismo
directorio que este `SKILL.md`). NO hagas el rename a mano ni con `sed`/`perl`
improvisado: ejecuta el script, que deriva la lista exacta de colores del propio
paquete instalado y aplica el reemplazo de forma reproducible.

Primero en seco, para ver el alcance sin tocar nada (sustituye `<skill-dir>` por
la ruta de este skill, p. ej. `~/.claude/skills/migrate-tw-preset-radix-v1-to-v2`):

```bash
node <skill-dir>/codemod.mjs <ruta-del-proyecto> --dry-run
```

Sólo dependencias de Node 18+ (sin instalar nada). El script recorre
`*.tsx/jsx/ts/js/mjs/cjs/astro/vue/svelte/html/mdx/md/css/scss`, ignorando
`node_modules`, `dist`, `.next`, etc.

### Paso 4 — Revisa el reporte

El dry-run imprime:

- Cuántos archivos cambiarían y cuántas clases alfa.
- **Usos de `2xl:`** (breakpoint eliminado en v2) con `archivo:línea`.
- **Clases construidas dinámicamente** (p. ej. `` `bg-${c}A-${n}` ``) que el
  codemod NO puede tocar con seguridad — las arreglarás a mano en el paso 6.

Comprueba el número de colores que reporta y de dónde sale la lista (`from
.../index.css` si encontró el paquete; `fallback` si no lo encontró — en ese
caso revisa que el paquete esté instalado, pero la lista de respaldo cubre todos
los colores de Radix Themes 3.x igualmente).

### Paso 5 — Aplica el codemod

Ejecuta el script en modo escritura. Si en el paso 4 viste usos de `2xl:` y
acordaste con el usuario mapearlos a `xl:` (el breakpoint más grande de v2,
1640px), pásale la opción:

```bash
node <skill-dir>/codemod.mjs <ruta-del-proyecto> --replace-2xl-with=xl
```

Sin `--replace-2xl-with`, el script renombra los colores alfa y sólo **reporta**
los `2xl:` sin tocarlos (para que decidas, ver paso 6).

Tras ejecutarlo, **revisa el diff** (`git diff`). Debe cambiar únicamente
segmentos de clase de color (y `2xl:`→`xl:` si lo pediste).

### Paso 6 — Resuelve lo que el script no toca

- **Clases dinámicas** que reportó el codemod: arréglalas a mano.

  ```tsx
  // antes (v1)        ->  después (v2)
  `bg-${color}A-${n}`  ->  `bg-${color}-a${n}`
  ```

- **`2xl:` sin mapear**: el breakpoint ya no existe. Lo habitual es `xl:` (que
  podías aplicar con `--replace-2xl-with=xl` en el paso 5). Si el proyecto
  realmente necesita un punto > 1640px, reintroduce uno propio en el CSS del
  proyecto (no en el preset) y deja los `2xl:` como están:

  ```css
  @theme {
    --breakpoint-2xl: 1920px;
  }
  ```

### Paso 7 — Verifica build, typecheck y lint

Lee los `scripts` del `package.json` del proyecto y ejecuta lo que aplique:

```bash
pnpm build       # o el build del framework (next build, vite build, astro build…)
pnpm typecheck   # si existe
pnpm lint        # si existe
```

El error más probable tras la migración es una clase que el codemod no alcanzó
porque se construye dinámicamente (ver Patrón B). Si Tailwind avisa de clases
desconocidas o ves estilos perdidos, revisa esos casos.

## Patrones comunes

### Patrón A — Clases en `cva`, `clsx`, `cn`, `tailwind-merge`

El codemod opera sobre el texto del archivo, así que cubre `cva({...})`,
`clsx("bg-grayA-5", ...)`, `cn(...)` y `tw\`...\`` siempre que la clase sea un
literal de cadena. No hace falta nada especial.

### Patrón B — Clases construidas dinámicamente

Si el código compone la clase concatenando partes, el codemod **no** la
reescribe (no es seguro), pero **sí la reporta** en su salida bajo
"Dynamically-built alpha classes". Arregla a mano cada una:

```tsx
// antes (v1)              después (v2)
`bg-${color}A-${shade}` -> `bg-${color}-a${shade}`
```

### Patrón C — `@apply` en CSS/SCSS

Cubierto por el codemod (los `--include='*.css'/'*.scss'` del paso 5). Verifica
igualmente bloques como `@apply bg-grayA-5;` en el diff.

### Patrón D — Safelist / config de Tailwind

Si el proyecto tiene un `tailwind.config.*` o un `@source`/safelist con clases
alfa listadas como strings, el codemod las alcanza si el archivo entra en los
`--include`. Revisa que la safelist también quedó migrada.

### Patrón E — Monorepo con varias apps

Ejecuta los pasos 3–7 desde la raíz del monorepo (los greps son recursivos) o
repítelos por app si cada una fija su propia versión del preset. Asegúrate de
que todas las apps suben a `^2.0.0`.

## Cierre

Reporta al usuario:

1. Archivos modificados (cuenta) y nº de reemplazos de color alfa.
2. Usos de `2xl:` encontrados y qué se hizo con cada uno (o que no había).
3. Resultado de build / typecheck / lint.
4. Si el proyecto dependía de las fuentes por defecto de Tailwind en
   `font-sans`/`font-mono` (ahora apuntan a Radix).
5. Clases dinámicas (Patrón B) que requirieron arreglo manual, si las hubo.

Indica al usuario que elimine este skill cuando la migración esté commiteada:

```bash
npx skills remove migrate-tw-preset-radix-v1-to-v2
```

O bórralo manualmente del directorio de skills de su cliente (Claude Code:
`~/.claude/skills/`, Cursor: `~/.cursor/skills/`, etc.). Mantener skills de
migración antiguos contamina el contexto en sesiones futuras.
