import { FsPath, toFsPath } from '../file-info/fs-path';
import getFs from '../fs/getFs';

export const inVfs = (path: string): FsPath => {
  return toFsPath(getFs().join('/project', path));
};
