import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";

export default tseslint.config(
  {
    ignores: ["eslint.config.js"],
  },
  [
    globalIgnores(["dist"]),
    {
      plugins: { react },
      files: ["**/*.{ts,tsx}"],
      extends: [
        js.configs.recommended,
        tseslint.configs.recommended,
        reactHooks.configs["recommended-latest"],
        reactRefresh.configs.vite,
        prettier,
        eslintPluginPrettierRecommended,
      ],
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
      },
      rules: {
        "@typescript-eslint/ban-ts-ignore": "off",

        "react/jsx-filename-extension": [
          "warn",
          {
            extensions: [".ts", ".tsx"],
          },
        ],

        "no-use-before-define": "off",
        "no-extra-boolean-cast": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-use-before-define": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "no-console": "off",
        "no-unused-vars": "off",
        "react/react-in-jsx-scope": "off",

        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            vars: "all",
            args: "after-used",
            ignoreRestSiblings: true,
          },
        ],

        "react/no-unescaped-entities": "warn",
        "react/jsx-key": "warn",
        "react/display-name": "warn",
        "react/prop-types": "off",

        "lines-between-class-members": [
          "error",
          "always",
          {
            exceptAfterSingleLine: true,
          },
        ],

        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        camelcase: "off",

        indent: [
          "warn",
          2,
          {
            SwitchCase: 1,
          },
        ],

        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],

        "prettier/prettier": [
          "warn",
          {
            useTabs: false,
            tabWidth: 2,
            printWidth: 120,
            trailingComma: "es5",
            vueIndentScriptAndStyle: true,
            singleQuote: false,
            semi: true,
            jsxSingleQuote: false,
          },
          {
            usePrettierrc: true,
          },
        ],
      },
    },
  ],
);
