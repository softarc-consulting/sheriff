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

const sheriffConfig: TSESLint.FlatConfig.Config = {
  files: ['sheriff.config.ts'],
  languageOptions: {
    sourceType: 'module',
  },
  plugins: {
    '@softarc/sheriff-config': {
      sheriffConfig,
    },
  },
  rules: {
    '@softarc/sheriff-config/module-paths': 'error',
    '@softarc/sheriff-config/barrel-less': 'error',
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
  sheriffConfig,
];

export const all: TSESLint.FlatConfig.ConfigArray = [
  {
    ...commonConfig,
    rules: {
      '@softarc/sheriff/dependency-rule': 'error',
      '@softarc/sheriff/encapsulation': 'error',
    },
  },
  sheriffConfig,
];
