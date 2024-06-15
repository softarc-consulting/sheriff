import type { TSESLint } from '@typescript-eslint/utils';

export default (
  plugin: TSESLint.FlatConfig.Plugin,
  parser: TSESLint.FlatConfig.Parser,
): TSESLint.FlatConfig.Config => ({
  name: `@softarc/sheriff/ts-base`,
  languageOptions: {
    parser,
    sourceType: 'module',
  },
  plugins: {
    '@softarc/sheriff': plugin,
  },
});
