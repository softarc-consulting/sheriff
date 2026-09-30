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
   * entryPoints is the merger of the entry file and the entry points
   * from the user's config
   */
  entryPoints?: Record<string, string>;
  // ignoreFileExtensions is always present (either user-specified or default)
  ignoreFileExtensions: string[];
  // excludeFromChecks is always present (either user-specified or default)
  excludeFromChecks: (string | RegExp)[];
};
