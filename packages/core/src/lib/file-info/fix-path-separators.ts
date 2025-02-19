import { FsPath, toFsPath } from './fs-path';
import getFs from '../fs/getFs';

/**
 * Ensures that `FsPath` uses the separator from the OS and not always '/'
 *
 * @param path
 */
export function fixPathSeparators(path: string): FsPath {
  const fs = getFs();

  if (fs.pathSeparator !== '/') {
    return toFsPath(path.replace(/\//g, fs.pathSeparator));
  }

  return toFsPath(path);
}
