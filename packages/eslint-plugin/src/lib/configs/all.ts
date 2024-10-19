import rules from '../rules';
import type { TSESLint } from '@typescript-eslint/utils';

export const barrelModulesOnly: TSESLint.FlatConfig.Config = {
  languageOptions: {
    sourceType: 'module',
  },
  plugins: {
    '@softarc/sheriff': {
      rules,
    },
  },
  rules: {
    '@softarc/sheriff/dependency-rule': 'error',
    '@softarc/sheriff/deep-import': 'error',
  },
};


export const all: TSESLint.FlatConfig.Config = {
  languageOptions: {
    sourceType: 'module',
  },
  plugins: {
    '@softarc/sheriff': {
      rules,
    },
  },
  rules: {
    '@softarc/sheriff/dependency-rule': 'error',
    '@softarc/sheriff/encapsulation': 'error',
  },
};
