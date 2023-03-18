import * as path from 'path';
import type { FsPath } from '../file-info/fs-path';

export abstract class Fs {
  abstract writeFile: (filename: string, contents: string) => void;
  abstract readFile: (path: FsPath) => string;
  abstract removeDir: (path: FsPath) => void;
  abstract createDir: (path: string) => void;
  abstract exists: (path: string) => boolean;

  abstract tmpdir: () => string;

  join = (...paths: string[]) => path.join(...paths);

  abstract cwd: () => string;

  abstract normalise: (path: string) => string;

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

  relativeTo = (from: string, to: string) => path.relative(from, to);

  getParent = (fileOrDirectory: FsPath): FsPath =>
    path.dirname(fileOrDirectory) as FsPath;

  /**
   * Reset the VirtualFs, has no effect on the real `DefaultFs`.
   */
  abstract reset(): void;

  abstract split(path: string): string[];

  abstract isAbsolute(path: string): boolean;
}
