import type { TSESLint } from '@typescript-eslint/utils';
import { parser } from 'typescript-eslint';
import tsAllConfig from './lib/configs/ts-all';

import all from './lib/configs/all.json';
import rules from './lib/rules';

const tsPluginBase = {
  configs: {
    all,
  },
  rules,
};

const tsPlugin: TSESLint.FlatConfig.Plugin = tsPluginBase as Omit<
  typeof tsPluginBase,
  'configs'
>;

const configs = {
  tsAll: tsAllConfig(tsPlugin, parser),
};

export default {
  configs,
  tsPlugin,
};
export { configs, tsPlugin };
