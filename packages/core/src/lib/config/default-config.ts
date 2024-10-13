import { SheriffConfig } from './sheriff-config';

export const defaultConfig: SheriffConfig = {
  version: 1,
  autoTagging: true,
  tagging: {},
  depRules: {},
  excludeRoot: false,
  enableBarrelLess: false,
  encapsulatedFolderNameForBarrelLess: 'internal',
  showWarningOnBarrelCollision: true,
  log: false,
  entryFile: '',
  isConfigFileMissing: false,
  barrelFileName: 'index.ts'
};
