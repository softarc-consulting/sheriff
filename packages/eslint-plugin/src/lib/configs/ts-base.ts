import type { TSESLint } from '@typescript-eslint/utils';

const { name } = require('../../../package.json') as {
  name: string;
};

export default (
  plugin: TSESLint.FlatConfig.Plugin,
  parser: TSESLint.FlatConfig.Parser,
): TSESLint.FlatConfig.Config => ({
  name: `${name}/ts-base`,
  languageOptions: {
    parser,
    sourceType: 'module',
  },
  plugins: {
    '@softarc/eslint-plugin-sheriff': plugin,
  },
});
