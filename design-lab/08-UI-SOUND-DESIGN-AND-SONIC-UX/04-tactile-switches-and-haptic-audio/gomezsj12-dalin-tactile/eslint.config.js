// Flat ESLint config for @dalin/tactile.
//
// Scope: the TypeScript SOURCE in `src/` only. The committed build output in
// `dist/`, the dependency-free demo, and Node scripts are intentionally not
// linted here (dist is generated; the demo is a plain browser script).
//
// Tier note: this uses the NON-type-checked `recommended` preset to stay fast
// and low-noise. A stricter type-aware tier (`recommendedTypeChecked` +
// `no-non-null-assertion`) is a documented upgrade; see docs/TOOLING.md.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // dist is generated; demo is a plain browser script; scripts/ + *.mjs are Node
  // tooling (linting them needs Node globals and isn't worth the noise here).
  { ignores: ["dist/**", "node_modules/**", "demo/**", "scripts/**", "**/*.mjs", "**/*.cjs"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      // The library deliberately swallows best-effort failures (vibrate, audio,
      // DOM injection): empty catch blocks are intentional, so allow them.
      "no-empty": ["error", { allowEmptyCatch: true }],
      // Unused vars are an error, but allow leading-underscore opt-outs.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "prefer-const": "error",
    },
  },
  // Keep ESLint out of Prettier's lane (formatting handled by Prettier).
  prettier,
);
