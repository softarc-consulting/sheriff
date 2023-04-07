import { FsPath, assertFsPath } from '../2-file-info/fs-path';
import getFs from '../1-fs/getFs';

export const inVfs = (path: string): FsPath => {
  return assertFsPath(getFs().join('/project', path));
};
