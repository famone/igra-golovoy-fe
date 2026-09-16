import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', 'stroustrup'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],

      'vue/html-indent': ['error', 2],
      'vue/script-indent': ['error', 2, { baseIndent: 0 }],
      'vue/max-attributes-per-line': ['error', { singleline: 1, multiline: 1 }],
      'vue/multi-word-component-names': 'off',
      // Опциональность пропов описана в TS-типе, дублировать её в withDefaults не нужно.
      'vue/require-default-prop': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/define-macros-order': ['error', {
        order: ['defineOptions', 'defineModel', 'defineProps', 'defineEmits', 'defineSlots'],
      }],

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      '@stylistic/indent': 'off',
    },
  },
);
