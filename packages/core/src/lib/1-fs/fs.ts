import * as path from 'path';
import type { FsPath } from '../2-file-info/fs-path';
import { PotentialFsPath } from './potential-fs-path';

export abstract class Fs {
  abstract writeFile: (filename: PotentialFsPath, contents: string) => void;
  abstract readFile: (path: FsPath) => string;
  abstract removeDir: (path: FsPath) => void;
  abstract createDir: (path: PotentialFsPath) => void;
  abstract exists(path: PotentialFsPath): path is FsPath;

  abstract tmpdir: () => FsPath;

  abstract join(...paths: string[]): PotentialFsPath;

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

  getParent = (fileOrDirectory: FsPath): FsPath =>
    path.dirname(fileOrDirectory) as FsPath;

  pathSeparator = path.sep;

  /**
   * Reset the VirtualFs, has no effect on the real `DefaultFs`.
   */
  abstract reset(): void;

  abstract split(path: PotentialFsPath): string[];

  abstract isAbsolute(path: PotentialFsPath): boolean;
}
