import { SheriffConfig } from './sheriff-config';

export const defaultConfig: SheriffConfig = {
  version: 1,
  autoTagging: true,
  tagging: {},
  depRules: {},
  excludeRoot: false,
  log: false,
  entryFile: '',
  isConfigFileMissing: false,
};
