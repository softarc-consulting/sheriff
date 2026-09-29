import type { TSESLint } from '@typescript-eslint/utils';
import rules from '../rules';

const commonConfig: TSESLint.FlatConfig.Config = {
  files: ['**/*.ts', '**/*.js'],
  ignores: ['sheriff.config.ts'],
  languageOptions: {
    sourceType: 'module',
  },
  plugins: {
    '@sheriff-arch/sheriff': {
      rules,
    },
  },
};

export const barrelModulesOnly: TSESLint.FlatConfig.Config = {
  ...commonConfig,
  rules: {
    '@sheriff-arch/sheriff/dependency-rule': 'error',
    '@sheriff-arch/sheriff/deep-import': 'error',
  },
};

export const all: TSESLint.FlatConfig.Config = {
  ...commonConfig,
  rules: {
    '@sheriff-arch/sheriff/dependency-rule': 'error',
    '@sheriff-arch/sheriff/encapsulation': 'error',
  },
};
