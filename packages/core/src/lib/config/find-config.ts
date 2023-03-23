import getFs from '../fs/getFs';
import { FsPath } from '../file-info/fs-path';

export const findConfig = (rootDir: FsPath): FsPath | undefined => {
  const fs = getFs();
  const configFilePath = fs.join(rootDir, 'sheriff.config.ts');
  if (fs.exists(configFilePath)) {
    return configFilePath;
  }

  return undefined;
};
