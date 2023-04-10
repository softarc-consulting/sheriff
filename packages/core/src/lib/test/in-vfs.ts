import { FsPath, toFsPath } from '../1-fs/fs-path';
import getFs from '../1-fs/getFs';

export const inVfs = (path: string): FsPath => {
  return toFsPath(getFs().join('/project', path));
};
