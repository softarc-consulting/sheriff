import configs from './lib/config';
import deepImport from './lib/rules/deep-import';

export default {
  rules: {
    'deep-import': deepImport,
  },
  configs,
};
