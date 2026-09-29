import { UserSheriffConfig } from './user-sheriff-config';

export type Configuration = Required<
  Omit<
    UserSheriffConfig,
    | 'tagging'
    | 'showWarningOnBarrelCollision'
    | 'encapsulatedFolderNameForBarrelLess'
    | 'entryPoints'
    | 'barrelFileName'
  >
> & {
  // dependency rules will skip if `isConfigFileMissing` is true
  isConfigFileMissing: boolean;
  /**
   * entryPoints is the merger of the entry file and the entry points
   * from the user's config
   */
  entryPoints?: Record<string, string>;
  // ignoreFileExtensions is always present (either user-specified or default)
  ignoreFileExtensions: string[];
  // barrelFileName is always normalized to an array internally
  barrelFileName: string[];
};
