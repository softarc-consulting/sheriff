import type { TSESLint } from '@typescript-eslint/utils';
import tsBaseConfig from './ts-base';

const { name } = require('../../../package.json') as {
  name: string;
};

export default (
  plugin: TSESLint.FlatConfig.Plugin,
  parser: TSESLint.FlatConfig.Parser,
): TSESLint.FlatConfig.ConfigArray => [
  tsBaseConfig(plugin, parser),
  {
    name: `${name}/ts-all`,
    rules: {
      '@softarc/sheriff/deep-import': 'error',
      '@softarc/sheriff/dependency-rule': 'error',
    },
  },
];
