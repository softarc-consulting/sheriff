import { ESLint } from 'eslint';

export const legacyBarrelModulesOnly: ESLint.ConfigData = {
  parser: '@typescript-eslint/parser',
  plugins: ['@sheriff-arch/sheriff'],
  rules: {
    '@sheriff-arch/sheriff/dependency-rule': 'error',
    '@sheriff-arch/sheriff/deep-import': 'error',
  },
};

export const legacy: ESLint.ConfigData = {
  parser: '@typescript-eslint/parser',
  plugins: ['@sheriff-arch/sheriff'],
  rules: {
    '@sheriff-arch/sheriff/dependency-rule': 'error',
    '@sheriff-arch/sheriff/encapsulation': 'error',
  },
};
