import { Configuration } from './configuration';

export const defaultConfig: Configuration = {
  version: 1,
  autoTagging: true,
  modules: {},
  depRules: {},
  excludeRoot: false,
  enableBarrelLess: false,
  encapsulationPattern: 'internal',
  log: false,
  entryFile: '',
  isConfigFileMissing: false,
  barrelFileName: 'index.ts'
};
