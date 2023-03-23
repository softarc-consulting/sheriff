import configs from './lib/config';
import { deepImport } from './lib/rules/deep-import';
import { dependencyRule } from './lib/rules/dependency-rule';

export = {
  rules: {
    'deep-import': deepImport,
    'dependency-rule': dependencyRule,
  },
  configs,
};
