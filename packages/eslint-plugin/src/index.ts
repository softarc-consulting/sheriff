import rules from './lib/rules';
import { legacy, legacyBarrelModulesOnly } from './lib/configs/legacy';
import { all, barrelModulesOnly } from './lib/configs/all';
import {
  name as packageName,
  version as packageVersion,
} from '../package.json';

const meta = { name: packageName, version: packageVersion };

/*
 * The consumer could have a different version of @eslint/core than we have.
 * We use typeof to keep the existing type references through our peers. When
 * the consumer compiles, their compiler takes the types available on their
 * side, including their ESLint version's underlying types.
 *
 * A direct @eslint/core dependency would instead require our selected version
 * for Sheriff's exposed types. It could install version A alongside the
 * consumer's version B; it would not replace B. We avoid that extra coupling
 * because we support multiple ESLint majors (currently 8, 9, and 10).
 *
 * Simplified example trees (A/B are illustrative; pnpm symlinks omitted).
 * The legacy config shows the reference through ESLint; flat configs keep
 * their references through the @typescript-eslint/utils peer instead.
 *
 * With typeof -- consumer-side types are used:
 *
 * Producer (this repo)
 * |-- dist/index.d.ts -> typeof legacy -> ESLint.ConfigData
 * `-- node_modules/eslint/
 *     `-- node_modules/@eslint/core/  [A]
 *
 * Consumer
 * `-- node_modules/
 *     |-- @softarc/eslint-plugin-sheriff/index.d.ts
 *     |   `-> typeof legacy -> ESLint.ConfigData from the consumer's ESLint
 *     `-- eslint/
 *         `-- node_modules/@eslint/core/  [B]
 *
 * With a direct @eslint/core dependency and type import:
 *
 * Producer (this repo)
 * |-- dist/index.d.ts -> import('@eslint/core')
 * `-- node_modules/@eslint/core/  [A]
 *
 * Consumer
 * `-- node_modules/
 *     |-- @softarc/eslint-plugin-sheriff/
 *     |   |-- index.d.ts -> import('@eslint/core') from Sheriff's dependency
 *     |   `-- node_modules/@eslint/core/  [A, required by Sheriff]
 *     `-- eslint/
 *         `-- node_modules/@eslint/core/  [B, required by ESLint]
 *
 * A and B can have incompatible types, though different versions alone do
 * not imply incompatibility. typeof preserves references; it does not choose
 * versions or guarantee compatibility with every supported peer version.
 */
const configs: {
  legacy: typeof legacy;
  legacyBarrelModulesOnly: typeof legacyBarrelModulesOnly;
  barrelModulesOnly: typeof barrelModulesOnly;
  all: typeof all;
} = {
  legacy,
  legacyBarrelModulesOnly,
  barrelModulesOnly,
  all,
};

export { configs, rules, meta };

// Preserve the same type references for the default export.
const plugin: {
  configs: typeof configs;
  rules: typeof rules;
  meta: typeof meta;
} = { configs, rules, meta };

export default plugin;
