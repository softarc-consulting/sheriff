import { UserSheriffConfig } from './user-sheriff-config';

export type Configuration = Required<
  Omit<
    UserSheriffConfig,
    | 'tagging'
    | 'showWarningOnBarrelCollision'
    | 'encapsulatedFolderNameForBarrelLess'
  >
> & {
  // dependency rules will skip if `isConfigFileMissing` is true
  isConfigFileMissing: boolean;
};
