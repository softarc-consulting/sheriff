import { deepImport } from './deep-import';
import { dependencyRule } from './dependency-rule';
import { encapsulation } from './encapsulation';
import { validateSheriffConfig } from './validate-sheriff-config';

export default {
  'deep-import': deepImport,
  'dependency-rule': dependencyRule,
  encapsulation: encapsulation,
  'validate-sheriff-config': validateSheriffConfig,
};
