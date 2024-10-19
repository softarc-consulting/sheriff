import rules from './lib/rules';
import { legacy, legacyBarrelModulesOnly } from "./lib/configs/legacy";
import { all, barrelModulesOnly } from "./lib/configs/all";
import {
  name as packageName,
  version as packageVersion,
} from '../package.json';

const meta = { name: packageName, version: packageVersion };

const configs = {
  legacy,
  legacyBarrelModulesOnly,
  barrelModulesOnly,
  all
};

export {configs, rules, meta};

export default { configs, rules, meta };
