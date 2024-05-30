import type { TSESLint } from '@typescript-eslint/utils';
import { parser } from 'typescript-eslint';
import legacyAll from './lib/configs/legacy-all.json';
import tsAllConfig from './lib/configs/ts-all';
import rules from './lib/rules';

const tsPluginBase = {
  configs: {
    all: legacyAll,
  },
  rules,
};

const tsPlugin: TSESLint.FlatConfig.Plugin = tsPluginBase as Omit<
  typeof tsPluginBase,
  'configs'
>;

const configs = {
  legacy: legacyAll,
  flat: tsAllConfig(tsPlugin, parser),
};

export default {
  configs,
  rules,
  tsPlugin,
};
export { configs, rules, tsPlugin };
