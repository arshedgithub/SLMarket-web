import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Build output, installed and copied vendor code, generated files.
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "logs/**",
      "node_modules/**",
      "public/vendor/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Image routes render through next/og, which only accepts <img>. The rule
  // skips these files itself on Linux but not on Windows, so turn it off here.
  {
    files: ["app/**/{opengraph-image,twitter-image,icon}.{js,jsx,ts,tsx}"],
    rules: { "@next/next/no-img-element": "off" },
  },
];

export default eslintConfig;
