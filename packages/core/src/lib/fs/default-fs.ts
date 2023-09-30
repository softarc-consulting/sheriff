import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Fs } from './fs';
import { FsPath, toFsPath } from '../file-info/fs-path';

export class DefaultFs extends Fs {
  override appendFile(filename: string, contents: string): void {
    fs.appendFileSync(filename, contents, { encoding: 'utf-8' });
  }

  writeFile = (filename: string, contents: string): void => {
    fs.writeFileSync(filename, contents);
  };

  readFile = (path: string): string =>
    fs.readFileSync(path, { encoding: 'utf-8' }).toString();

  removeDir = (path: string) => {
    fs.rmSync(path, { recursive: true });
  };

  createDir = (path: string) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  };

  override exists(path: string): path is FsPath {
    return fs.existsSync(path);
  }

  tmpdir = () => os.tmpdir();

  cwd = () => process.cwd();

  override findFiles = (
    directory: FsPath,
    filename: string,
    found: FsPath[] = [],
    referencePath = ''
  ): FsPath[] => {
    const files = fs.readdirSync(directory);
    referencePath = referencePath || directory;

    for (const file of files) {
      const filePath = toFsPath(path.join(directory, file));
      const info = fs.lstatSync(filePath);
      if (info.isFile() && file.toLowerCase() === filename.toLowerCase()) {
        found.push(toFsPath(filePath));
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
    let current = path.dirname(referenceFile);
    while (current) {
      const files = fs.readdirSync(current);

      for (const file of files) {
        const filePath = path.join(current, file);
        const info = fs.lstatSync(filePath);

        if (info.isFile() && file === filename) {
          return toFsPath(filePath);
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

  isAbsolute = (p: string) => path.isAbsolute(p);

  override split = (p: string) => p.split(path.sep);

  print = () => void true;
}

const defaultFs = new DefaultFs();
export default defaultFs;
