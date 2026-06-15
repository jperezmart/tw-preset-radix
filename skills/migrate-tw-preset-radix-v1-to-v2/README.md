# Migration skill — `tw-preset-radix` v1 → v2

Skill de migración automática para proyectos que consumen `tw-preset-radix` y
necesitan actualizar de la serie `1.x` a la `2.x`.

Sigue el estándar de [Agent Skills](https://www.skills.sh/) (`SKILL.md` con
frontmatter), por lo que es compatible con Claude Code, Cursor, Codex, GitHub
Copilot y cualquier cliente que entienda ese formato.

## Qué automatiza

1. Detecta el uso del paquete en el repo (incluyendo monorepos con catalog).
2. Sube la versión a `^2.0.0` y regenera el lockfile.
3. Renombra las clases de color alfa `{color}A-{n}` → `{color}-a{n}`
   (`bg-grayA-5` → `bg-gray-a5`) en todo el código — JSX, plantillas, MDX y CSS
   con `@apply` — derivando la lista exacta de colores del propio paquete.
4. Localiza las variantes `2xl:` (breakpoint eliminado en v2) y las migra a
   `xl:` o a un breakpoint propio, decidiéndolo contigo.
5. Avisa del cambio no-breaking en `font-sans`/`font-mono` (ahora apuntan a la
   tipografía de Radix).
6. Ejecuta build / typecheck / lint y reporta el resultado.

## Instalación

Vía [skills.sh](https://www.skills.sh/):

```bash
npx skills add jperezmart/tw-preset-radix
```

Esto registra el skill en el directorio de skills de tu cliente.

## Uso

Desde tu cliente, lanza el comando:

```
/migrate-tw-preset-radix-v1-to-v2
```

El agente leerá `SKILL.md` y aplicará la migración sobre el proyecto activo.
Revisa el diff resultante antes de commitear.

## Limpieza

Una vez la migración esté hecha y commiteada, elimina el skill para no
contaminar el contexto de futuras sesiones:

```bash
npx skills remove migrate-tw-preset-radix-v1-to-v2
```

O bórralo manualmente del directorio de skills de tu cliente:

| Cliente     | Ruta                                                        |
| ----------- | ---------------------------------------------------------- |
| Claude Code | `~/.claude/skills/migrate-tw-preset-radix-v1-to-v2/`       |
| Cursor      | `~/.cursor/skills/migrate-tw-preset-radix-v1-to-v2/`       |
| Otros       | Consulta la doc del cliente.                               |

## Compatibilidad

- Target: `tw-preset-radix` ≥ `2.0.0`.
- Framework-agnóstico (Next.js, Vite, Astro, Remix, SvelteKit…). El codemod opera
  sobre clases en `*.tsx/jsx/ts/js/astro/vue/svelte/html/mdx/css/scss`.

## Licencia

MIT © [Javier Pérez](https://github.com/jperezmart)
