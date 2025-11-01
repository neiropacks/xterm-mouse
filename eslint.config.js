import eslint from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importPlugin, { createNodeResolver } from 'eslint-plugin-import-x';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import biome from 'eslint-config-biome';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  // Global ignores
  {
    ignores: ['dist/**'],
  },

  // Base configs
  eslint.configs.recommended,
  tseslint.configs.strict,

  // React specific configs
  {
    files: ['**/*.{ts,tsx}'],
    ...react.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ...react.configs.flat['jsx-runtime'],
  },

  // React Hooks
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Import plugin configs
  {
    ...importPlugin.flatConfigs.recommended,
    ...importPlugin.flatConfigs.typescript,
    ...importPlugin.flatConfigs.react,
    settings: {
      // This is the new, correct way for flat config
      'import-x/resolver-next': [createTypeScriptImportResolver(), createNodeResolver()],
    },
  },

  // Custom rules and overrides
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
      import: importPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      // Your custom import order
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'import/no-cycle': 'error',
      'import/no-useless-path-segments': 'error',

      // Unused imports
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Other custom rules
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/prop-types': 'off', // Often not needed in TypeScript projects
    },
  },
  {
    files: ['examples/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: 'examples/tsconfig.json',
      },
    },
  },
  biome,
);
