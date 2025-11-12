import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser },
    plugins: { "@typescript-eslint": tseslint, react: reactPlugin, "react-hooks": hooks, import: importPlugin },
    rules: {
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "import/order": ["error", { "newlines-between": "always" }],
      "react/jsx-no-useless-fragment": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    },
    settings: { react: { version: "detect" } }
  }
];
