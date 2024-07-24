import rules from '../rules';
import { parser } from 'typescript-eslint';
import type { TSESLint } from '@typescript-eslint/utils';

export const all: TSESLint.FlatConfig.Config = {
  languageOptions: {
    parser,
    sourceType: 'module',
  },
  plugins: {
    '@softarc/sheriff': {
      rules,
    },
  },
  rules: {
    '@softarc/sheriff/deep-import': 'error',
    '@softarc/sheriff/dependency-rule': 'error',
  },
};
