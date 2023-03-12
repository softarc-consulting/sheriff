export default interface Fs {
  writeFile: (filename: string, contents: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  removeDir: (path: string) => Promise<void>;
  createDir: (path: string) => Promise<void>;
  exists: (path: string) => boolean;

  tmpdir: () => string;

  join: (...paths: string[]) => string;

  cwd: () => string;

  normalise: (path: string) => string;

  findFiles: (path: string, filename: string) => Promise<string[]>;

  /**
   * Used for finding the nearest `tsconfig.json`. It traverses through the
   * parent folder and includes the directory of the referenceFile.
   * @param referenceFile
   * @param filename
   */
  findNearestParentFile: (
    referenceFile: string,
    filename: string
  ) => Promise<string>;

  /**
   * Reset the VirtualFs, has no effect on the real `DefaultFs`.
   */
  reset(): void;
}
