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
}
