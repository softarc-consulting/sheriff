import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Fs } from './fs';
import {assertFsPath, FsPath, toFsPath} from '../2-file-info/fs-path';
import throwIfNull from '../util/throw-if-null';
import {toOsPath} from "./to-os-path";

export class DefaultFs extends Fs {
  writeFile = (filename: string, contents: string): void =>
    fs.writeFileSync(filename, contents);

  readFile = (path: string): string => fs.readFileSync(path).toString();

  removeDir = (path: string) => fs.rmSync(path, { recursive: true });

  createDir = (path: string) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  };

  override exists(path: string): path is FsPath {
    return fs.existsSync(toOsPath(path as FsPath));
  }

  tmpdir = () => os.tmpdir();

  cwd = () => process.cwd();

  override findFiles = (
    directory: FsPath,
    filename: string,
    found: FsPath[] = [],
    referencePath = ''
  ): FsPath[] => {
    const files = fs.readdirSync(toOsPath(directory));
    referencePath = referencePath || directory;

    for (const file of files) {
      const filePath = toFsPath(path.join(directory, file));
      const info = fs.lstatSync(toOsPath(filePath));
      if (info.isFile() && file.toLowerCase() === filename.toLowerCase()) {
        found.push(filePath);
      }
      if (info.isDirectory()) {
        this.findFiles(filePath, filename, found, referencePath);
      }
    }
    return found;
  };

  reset(): void {
    return void true;
  }

  findNearestParentFile = (referenceFile: FsPath, filename: string): FsPath => {
    let current = path.dirname(toOsPath(referenceFile));
    while (current) {
      try {
        const files = fs.readdirSync(current);

        for (const file of files) {
          const filePath = path.join(current, file);
          const info = fs.lstatSync(filePath);

          if (info.isFile() && file === filename) {
            return toFsPath(filePath);
          }
        }
      } catch (e: unknown) {
        if (
          !(
            e instanceof Error &&
            (e.message.startsWith('EPERM: operation not permitted') || e.message.startsWith('EBUSY'))
          )
        ) {
          throw new Error(
            `encountered unknown error while reading from ${current}: ${e}`
          );
        }
      }

      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }

    throw new Error(`cannot find ${filename} near ${referenceFile}`);
  };

  override isAbsolute = (p: string) => path.isAbsolute(p);

  override split = (p: string) => p.split(path.sep);

  override join(...paths: string[]): string {
    return path.join(...paths);
  }

  print = () => void true;
}

const defaultFs = new DefaultFs();
export default defaultFs;
