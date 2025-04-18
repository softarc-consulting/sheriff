import {
  name as packageName,
  version as packageVersion,
} from '../package.json';
import { all, barrelModulesOnly } from './lib/configs/all';
import { legacy, legacyBarrelModulesOnly } from './lib/configs/legacy';
import rules from './lib/rules';

const meta = { name: packageName, version: packageVersion };

const configs = {
  legacy,
  legacyBarrelModulesOnly,
  barrelModulesOnly,
  all,
};

export { configs, meta, rules };

export default { configs, rules, meta };
