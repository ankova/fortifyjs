// eslint.config.js
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': hooks,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
      'import/order': ['warn', { 'newlines-between': 'always' }],
    },
    settings: { react: { version: 'detect' }, 'import/resolver': { typescript: true } },
  },
];
