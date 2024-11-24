import { ESLint } from 'eslint';

const commonConfig: ESLint.ConfigData = {
  parser: '@typescript-eslint/parser',
  plugins: ['@softarc/sheriff'],
  ignorePatterns: ['sheriff.config.ts'],
};

export const legacyBarrelModulesOnly: ESLint.ConfigData = {
  ...commonConfig,
  rules: {
    '@softarc/sheriff/dependency-rule': 'error',
    '@softarc/sheriff/deep-import': 'error',
  },
};

export const legacy: ESLint.ConfigData = {
  ...commonConfig,
  rules: {
    '@softarc/sheriff/dependency-rule': 'error',
    '@softarc/sheriff/encapsulation': 'error',
  },
};
