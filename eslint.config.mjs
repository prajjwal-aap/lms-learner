import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Architecture boundaries
  // 1. Anyone outside a feature may only import its public API: "@/features/orders",
  //    never "@/features/orders/components/OrderTable". Inside a feature, use relative imports.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*"],
              message: "Import from the feature's public API (e.g. '@/features/orders'), not its internals.",
            },
          ],
        },
      ],
    },
  },
  // 2. Shared layers sit *below* features and must never depend on them.
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/lib/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
      "src/config/**/*.{ts,tsx}",
      "src/store/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features", "@/features/**"],
              message: "Shared code must not import features. Pass data in via props/slots instead.",
            },
          ],
        },
      ],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
