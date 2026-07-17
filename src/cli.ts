import {
  generateTheme,
  generateThemeWithImports,
  generateTypography,
} from "./generate";

const generators = {
  theme: () => generateTheme({ showComments: true }),
  "theme-with-imports": generateThemeWithImports,
  typography: generateTypography,
};

const type = (process.argv[2] || "theme") as keyof typeof generators;

if (type in generators) {
  console.log(generators[type]());
} else {
  console.error(
    `Invalid type. Use one of: ${Object.keys(generators).join(", ")}`
  );
  process.exit(1);
}
