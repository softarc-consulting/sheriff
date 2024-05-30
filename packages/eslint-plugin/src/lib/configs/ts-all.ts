import type { TSESLint } from '@typescript-eslint/utils';
import tsBaseConfig from './ts-base';

export default (
  plugin: TSESLint.FlatConfig.Plugin,
  parser: TSESLint.FlatConfig.Parser,
): TSESLint.FlatConfig.ConfigArray => [
  tsBaseConfig(plugin, parser),
  {
    name: `@softarc/sheriff/ts-all`,
    rules: {
      '@softarc/sheriff/deep-import': 'error',
      '@softarc/sheriff/dependency-rule': 'error',
    },
  },
];
