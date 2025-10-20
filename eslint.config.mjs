import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import pluginImport from "eslint-plugin-import";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(["**/dist/", "**/node_modules/", "**/.splashify/"]),
  {
    extends: compat.extends(
      "plugin:@typescript-eslint/recommended",
      "prettier",
    ),

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "module",
    },

    plugins: {
      "@typescript-eslint": tsEslintPlugin,
      import: pluginImport,
      "simple-import-sort": pluginSimpleImportSort,
    },

    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^node:.*", "^@?\\w"],
            ["^@/(.*)"],
            ["^[./]"],
            ["^\\u0000"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
    },
  },
]);
