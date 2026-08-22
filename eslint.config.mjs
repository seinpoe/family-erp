import { FlatCompat } from "@eslint/eslintrc";
import { globalIgnores } from "eslint/config";

const compat = new FlatCompat({ baseDirectory: process.cwd() });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  globalIgnores([".next/**", ".next-dev/**", "node_modules/**", "coverage/**", "public/sw.js", "next-env.d.ts", "eslint.config.mjs", "postcss.config.mjs"]),
];
