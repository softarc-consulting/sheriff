import { UserSheriffConfig } from './user-sheriff-config';

export type Configuration = Required<
  Omit<
    UserSheriffConfig,
    | 'tagging'
    | 'showWarningOnBarrelCollision'
    | 'encapsulatedFolderNameForBarrelLess'
    | 'entryPoints'
  >
> & {
  // dependency rules will skip if `isConfigFileMissing` is true
  isConfigFileMissing: boolean;
  /**
   * We have to apply here a little hack to ensure correct validation of the config in parseConfig
   */
  entryPoints?: Record<string, string>;
  // ignoreFileExtensions is always present (either user-specified or default)
  ignoreFileExtensions: string[];
};
