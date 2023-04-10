import * as nodePath from 'path';
import type { FsPath } from './fs-path';
import { PotentialFsPath } from './potential-fs-path';

export abstract class Fs {
  abstract writeFile: (filename: PotentialFsPath, contents: string) => void;
  abstract readFile: (path: FsPath) => string;
  abstract removeDir: (path: FsPath) => void;
  abstract createDir: (path: PotentialFsPath) => FsPath;
  abstract tmpdir: () => FsPath;
  abstract cwd: () => string;
  abstract findFiles: (path: FsPath, filename: string) => FsPath[];
  abstract print: () => void;
  /**
   * Used for finding the nearest `tsconfig.json`. It traverses through the
   * parent folder and includes the directory of the referenceFile.
   * @param referenceFile
   * @param filename
   */
  abstract findNearestParentFile: (
    referenceFile: FsPath,
    filename: string
  ) => FsPath;
  pathSeparator = nodePath.sep;

  abstract exists(path: PotentialFsPath): path is FsPath;

  abstract join(...paths: string[]): PotentialFsPath;

  getParent = (fileOrDirectory: FsPath): FsPath =>
    nodePath.dirname(fileOrDirectory) as FsPath;

  /**
   * Reset the VirtualFs, has no effect on the real `DefaultFs`.
   */
  abstract reset(): void;

  split(path: PotentialFsPath) {
    return path.split('/');
  }
}
