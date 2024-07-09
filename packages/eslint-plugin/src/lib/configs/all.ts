import rules from '../rules';
import { parser } from 'typescript-eslint';

export const all = {
  languageOptions: { parser, sourceType: 'module' },
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
