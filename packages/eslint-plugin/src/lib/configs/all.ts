import type { TSESLint } from '@typescript-eslint/utils';
import rules from '../rules';

const commonConfig: TSESLint.FlatConfig.Config = {
  files: ['*.ts, *.js'],
  ignores: ['sheriff.config.ts'],
  languageOptions: {
    sourceType: 'module',
  },
  plugins: {
    '@softarc/sheriff': {
      rules,
    },
  },
};

export const barrelModulesOnly: TSESLint.FlatConfig.ConfigArray = [
  {
    ...commonConfig,
    rules: {
      '@softarc/sheriff/dependency-rule': 'error',
      '@softarc/sheriff/deep-import': 'error',
    },
  },
];

export const validateSheriffConfig: TSESLint.FlatConfig.Config = {
  files: ['sheriff.config.ts'],
  languageOptions: {
    sourceType: 'module',
  },
  plugins: {
    '@softarc/sheriff-config': {
      rules,
    },
  },
  rules: {
    '@softarc/sheriff-config/validate-sheriff-config': 'error',
  },
};

export const all: TSESLint.FlatConfig.ConfigArray = [
  {
    ...commonConfig,
    rules: {
      '@softarc/sheriff/dependency-rule': 'error',
      '@softarc/sheriff/encapsulation': 'error',
    },
  },
  validateSheriffConfig,
];
