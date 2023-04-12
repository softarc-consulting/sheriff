import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Fs } from './fs';
import { FsPath, toFsPath } from './fs-path';
import { toOsPath } from './to-os-path';
import { PotentialFsPath, toPotentialFsPath } from './potential-fs-path';

export class DefaultFs extends Fs {
  override writeFile = (filename: string, contents: string): void =>
    fs.writeFileSync(filename, contents);

  override readFile = (path: string): string =>
    fs.readFileSync(path).toString();

  override removeDir = (path: FsPath) =>
    fs.rmSync(toOsPath(path), { recursive: true });

  override createDir = <Path extends string>(
    path: PotentialFsPath<Path>
  ): FsPath => {
    const osPath = toOsPath(path);
    if (!fs.existsSync(osPath)) {
      fs.mkdirSync(osPath, { recursive: true });
    }

    return toFsPath(path);
  };

  override exists<Path extends string>(
    path: PotentialFsPath<Path>
  ): path is FsPath {
    return fs.existsSync(toOsPath(path));
  }

  override tmpdir = () => toFsPath(os.tmpdir());

  override cwd = () => process.cwd();

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

  override reset(): void {
    throw new Error();
  }

  override findNearestParentFile = (
    referenceFile: FsPath,
    filename: string
  ): FsPath => {
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
            (e.message.startsWith('EPERM: operation not permitted') ||
              e.message.startsWith('EBUSY'))
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

  override join(...paths: string[]): PotentialFsPath<string> {
    return toPotentialFsPath(path.join(...paths));
  }

  override print = () => {
    throw new Error();
  };
}

const defaultFs = new DefaultFs();
export default defaultFs;
