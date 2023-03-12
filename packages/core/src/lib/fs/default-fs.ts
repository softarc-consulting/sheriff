import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import Fs from './fs';

export class DefaultFs implements Fs {
  writeFile = (filename: string, contents: string): void =>
    fs.writeFileSync(filename, contents);

  readFile = (path: string): string => fs.readFileSync(path).toString();

  removeDir = (path: string) => fs.rmSync(path, { recursive: true });

  createDir = (path: string) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  };

  exists = (path: string) => {
    return fs.existsSync(path);
  };

  tmpdir = () => os.tmpdir();

  join = (...paths: string[]) => path.join(...paths);

  cwd = () => process.cwd();

  normalise = (unnormalisedPath: string) => path.normalize(unnormalisedPath);

  findFiles = (
    directory: string,
    filename: string,
    found: string[] = [],
    referencePath = ''
  ): string[] => {
    const files = fs.readdirSync(directory);
    referencePath = referencePath || directory;

    for (const file of files) {
      const filePath = path.join(directory, file);
      const info = fs.lstatSync(filePath);
      if (info.isFile() && file.toLowerCase() === filename.toLowerCase()) {
        found.push(filePath.substring(referencePath.length + 1));
      }
      if (info.isDirectory()) {
        this.findFiles(filePath, filename, found, referencePath);
      }
    }
    return found;
  };

  reset(): void {}

  findNearestParentFile = (referenceFile: string, filename: string): string => {
    let current = path.dirname(referenceFile);
    while (true) {
      const files = fs.readdirSync(current);

      for (const file of files) {
        const filePath = path.join(current, file);
        const info = fs.lstatSync(filePath);

        if (info.isFile() && file === filename) {
          return filePath;
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
}

const defaultFs = new DefaultFs();
export default defaultFs;
