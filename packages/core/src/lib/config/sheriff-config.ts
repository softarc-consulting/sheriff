import { UserSheriffConfig } from './user-sheriff-config';

export type SheriffConfig = Required<UserSheriffConfig> & {
  // dependency rules will skip if `isConfigFileMissing` is true
  isConfigFileMissing: boolean;
  barrelFileName: string;
};
