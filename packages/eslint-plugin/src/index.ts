import configs from './lib/config';
import deepImport from './lib/rules/deep-import';

export = {
  rules: {
    'deep-import': deepImport,
  },
  configs,
};
