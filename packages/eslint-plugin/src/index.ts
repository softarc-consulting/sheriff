import rules from './lib/rules';
import { legacy } from "./lib/configs/legacy";
import { all } from "./lib/configs/all";

const configs = {
  legacy,
  all
};

export {configs, rules};

export default { configs, rules };
