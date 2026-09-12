import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";
import query from "@tanstack/eslint-plugin-query";

const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "dist/**",
      "node_modules/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  ...query.configs["flat/recommended"],
  {
    // shadcn primitives are vendored: keep them byte-compatible with the registry
    files: ["src/components/ui/**"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];

export default config;
