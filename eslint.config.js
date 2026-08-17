import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "scripts/**", "node_modules"] },

  // ---- Browser app code (src/) ----
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // ---- Config files at the repo root ----
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["*.{ts,js}", "*.config.{ts,js}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
  },

  // ---- Supabase edge functions ----
  // These run on Deno, not in a browser, and were previously linted with
  // browser globals — so `Deno` read as undefined while `window` read as
  // available, which is backwards. They also talk to third-party APIs whose
  // payloads are genuinely untyped at the boundary, so `no-explicit-any` is a
  // warning here rather than a hard error that blocks the whole lint run.
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["supabase/functions/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        Deno: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
