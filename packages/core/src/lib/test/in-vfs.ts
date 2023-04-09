import { FsPath, toFsPath } from '../2-file-info/fs-path';
import getFs from '../1-fs/getFs';

export const inVfs = (path: string): FsPath => {
  return toFsPath(getFs().join('/project', path));
};
