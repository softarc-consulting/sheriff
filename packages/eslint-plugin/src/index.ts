import rules from './lib/rules';
import { legacy } from "./lib/configs/legacy";
import { all } from "./lib/configs/all";
import {
  name as packageName,
  version as packageVersion,
} from '../package.json';

const meta = { name: packageName, version: packageVersion };

const configs = {
  legacy,
  all
};

export {configs, rules, meta};

export default { configs, rules, meta };
