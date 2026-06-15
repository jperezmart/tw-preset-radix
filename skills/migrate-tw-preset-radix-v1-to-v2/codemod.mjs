#!/usr/bin/env node
// @ts-check
/**
 * Codemod: tw-preset-radix v1 -> v2
 *
 * 1. Renames alpha color classes `{color}A-{n}` -> `{color}-a{n}`
 *    (e.g. `bg-grayA-5` -> `bg-gray-a5`) across the codebase.
 * 2. Reports `2xl:` variant usages (breakpoint removed in v2), and can
 *    optionally rewrite them to another breakpoint.
 * 3. Reports dynamically-built classes the rename can't safely touch.
 *
 * No external dependencies — Node 18+ built-ins only.
 *
 * Usage:
 *   node codemod.mjs [projectDir] [options]
 *
 * Options:
 *   --dry-run               Don't write files; just report what would change.
 *   --replace-2xl-with=xl   Rewrite `2xl:` variants to the given breakpoint
 *                           (e.g. `xl`). Omitted = report only, never touch.
 *   --help                  Show this help.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const EXTENSIONS = new Set([
  ".tsx", ".jsx", ".ts", ".js", ".mjs", ".cjs",
  ".astro", ".vue", ".svelte", ".html",
  ".mdx", ".md", ".css", ".scss",
]);

const IGNORED_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "out", ".next", ".turbo",
  ".svelte-kit", ".astro", ".cache", "coverage", ".vercel", ".output",
]);

// Fallback list of Radix color names that have an alpha scale. The codemod
// prefers deriving this from the installed package (see deriveColors), so this
// only kicks in when the package can't be located.
const FALLBACK_COLORS = [
  "accent", "amber", "black", "blue", "bronze", "brown", "crimson", "cyan",
  "gold", "grass", "gray", "green", "indigo", "iris", "jade", "lime", "mauve",
  "mint", "olive", "orange", "pink", "plum", "purple", "red", "ruby", "sage",
  "sand", "sky", "slate", "teal", "tomato", "violet", "white", "yellow",
];

function parseArgs(argv) {
  const opts = { dryRun: false, replace2xlWith: null, help: false, root: null };
  for (const arg of argv) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg.startsWith("--replace-2xl-with=")) {
      opts.replace2xlWith = arg.slice("--replace-2xl-with=".length).trim();
    } else if (!arg.startsWith("-") && !opts.root) {
      opts.root = arg;
    }
  }
  opts.root = path.resolve(opts.root || process.cwd());
  return opts;
}

/** Derive the alpha color list from the installed tw-preset-radix, else fall back. */
function deriveColors(root) {
  try {
    const require = createRequire(path.join(root, "__codemod__.js"));
    const pkgPath = require.resolve("tw-preset-radix/package.json");
    const cssPath = path.join(path.dirname(pkgPath), "src", "index.css");
    const css = fs.readFileSync(cssPath, "utf8");
    const found = new Set();
    const re = /--color-([a-z]+)-a1:/g;
    let m;
    while ((m = re.exec(css))) found.add(m[1]);
    if (found.size > 0) return { colors: [...found].sort(), source: cssPath };
  } catch {
    /* ignore — fall back below */
  }
  return { colors: FALLBACK_COLORS, source: "fallback (package not found)" };
}

function* walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        // allow non-ignored dotted dirs through? skip them to be safe
        continue;
      }
      yield* walk(full);
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(
      "Usage: node codemod.mjs [projectDir] [--dry-run] [--replace-2xl-with=xl]"
    );
    process.exit(0);
  }

  const { colors, source } = deriveColors(opts.root);
  const colorAlt = colors.join("|");
  const alphaRe = new RegExp(
    `(?<![A-Za-z])(${colorAlt})A-(1[0-2]|[1-9])(?![0-9])`,
    "g"
  );
  // `2xl:` preceded by start, whitespace, or a class-string delimiter.
  const twoXlRe = /(^|[\s"'`:{(\[])2xl:/g;
  // Dynamically-composed alpha classes the rename can't reach.
  const dynamicRe = /(?:[A-Za-z]A-\$\{|\$\{[^}]*\}A-)/;

  console.log(`tw-preset-radix v1 -> v2 codemod`);
  console.log(`  root:    ${opts.root}`);
  console.log(`  colors:  ${colors.length} (from ${source})`);
  console.log(`  mode:    ${opts.dryRun ? "dry-run" : "write"}`);
  console.log("");

  let filesChanged = 0;
  let alphaReplacements = 0;
  const twoXlHits = [];
  const dynamicHits = [];

  for (const file of walk(opts.root)) {
    const original = fs.readFileSync(file, "utf8");
    const rel = path.relative(opts.root, file);

    // alpha rename
    let count = 0;
    let updated = original.replace(alphaRe, (_m, c, n) => {
      count++;
      return `${c}-a${n}`;
    });

    // optional 2xl rewrite
    if (opts.replace2xlWith) {
      updated = updated.replace(
        twoXlRe,
        (_m, pre) => `${pre}${opts.replace2xlWith}:`
      );
    }

    // report 2xl usages (on the ORIGINAL, so we report them whether or not we rewrote)
    const lines = original.split("\n");
    lines.forEach((line, i) => {
      twoXlRe.lastIndex = 0;
      if (twoXlRe.test(line)) twoXlHits.push(`${rel}:${i + 1}: ${line.trim()}`);
      if (dynamicRe.test(line)) dynamicHits.push(`${rel}:${i + 1}: ${line.trim()}`);
    });

    if (updated !== original) {
      filesChanged++;
      alphaReplacements += count;
      if (!opts.dryRun) fs.writeFileSync(file, updated);
      console.log(`  ${opts.dryRun ? "would update" : "updated"}  ${rel}  (${count} alpha)`);
    }
  }

  console.log("");
  console.log(`Summary`);
  console.log(`  files ${opts.dryRun ? "to change" : "changed"}: ${filesChanged}`);
  console.log(`  alpha class replacements: ${alphaReplacements}`);

  if (twoXlHits.length) {
    console.log("");
    console.log(
      opts.replace2xlWith
        ? `  2xl: usages rewritten to ${opts.replace2xlWith}: (${twoXlHits.length}) — review:`
        : `  2xl: usages found (${twoXlHits.length}) — breakpoint removed in v2, migrate manually:`
    );
    for (const hit of twoXlHits) console.log(`    ${hit}`);
  }

  if (dynamicHits.length) {
    console.log("");
    console.log(`  Dynamically-built alpha classes (NOT auto-fixed, check by hand):`);
    for (const hit of dynamicHits) console.log(`    ${hit}`);
  }

  console.log("");
  console.log(opts.dryRun ? "Dry run complete — no files written." : "Done.");
}

main();
