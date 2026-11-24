import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'build/',
      'node_modules/',
      '.react-router/',
      'design/',
      'test-results/',
      'playwright-report/',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat['recommended-latest'], jsxA11y.flatConfigs.strict],
    languageOptions: { globals: globals.browser },
    rules: {
      // A labelled region that scrolls must be focusable so keyboard users can scroll it
      // (axe: scrollable-region-focusable). Allow that pattern alongside the default tabpanel.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: [], roles: ['tabpanel', 'region'] }],
    },
  },
  {
    files: ['*.{js,ts}', 'scripts/**/*.{js,ts}', 'e2e/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    // Named exports everywhere except where a framework requires a default export.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/root.tsx', 'src/routes.ts', 'src/routes/**'],
    rules: {
      'no-restricted-exports': ['error', { restrictDefaultExports: { direct: true } }],
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
);
