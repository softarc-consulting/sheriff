import { ESLint } from "eslint";

export const legacyBarrelModulesOnly: ESLint.ConfigData = {
  parser: '@typescript-eslint/parser',
  plugins: ['@softarc/sheriff'],
  rules: {
    '@softarc/sheriff/dependency-rule': 'error',
    '@softarc/sheriff/deep-import': 'error',
  },
}

export const legacy: ESLint.ConfigData = {
  parser: '@typescript-eslint/parser',
  plugins: ['@softarc/sheriff'],
  rules: {
    '@softarc/sheriff/dependency-rule': 'error',
    '@softarc/sheriff/encapsulation': 'error',
  },
}

