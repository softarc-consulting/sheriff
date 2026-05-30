import { ESLint } from 'eslint';
import { defaultSupportedFileExtensions } from '@softarc/sheriff-core';

const files = defaultSupportedFileExtensions.map((ext) => `*.${ext}`);

export const legacyBarrelModulesOnly: ESLint.ConfigData = {
  files,
  parser: '@typescript-eslint/parser',
  plugins: ['@softarc/sheriff'],
  rules: {
    '@softarc/sheriff/dependency-rule': 'error',
    '@softarc/sheriff/deep-import': 'error',
  },
};

export const legacy: ESLint.ConfigData = {
  files,
  parser: '@typescript-eslint/parser',
  plugins: ['@softarc/sheriff'],
  rules: {
    '@softarc/sheriff/dependency-rule': 'error',
    '@softarc/sheriff/encapsulation': 'error',
  },
};
