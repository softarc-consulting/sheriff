import getFs from '../1-fs/getFs';
import { FsPath } from '../2-file-info/fs-path';

export const findConfig = (rootDir: FsPath): FsPath | undefined => {
  const fs = getFs();
  const configFilePath = fs.join(rootDir, 'sheriff.config.ts');
  if (fs.exists(configFilePath)) {
    return configFilePath;
  }

  return undefined;
};
