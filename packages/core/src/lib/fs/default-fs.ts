import fsa from 'fs/promises';
import fsn from 'fs';
import * as os from 'os';
import path from 'path';
import Fs from './fs';

export class DefaultFs implements Fs {
  writeFile = async (filename: string, contents: string) =>
    fsa.writeFile(filename, contents);

  readFile = async (path: string) =>
    fsa.readFile(path).then((content) => content.toString());

  removeDir = async (path: string) => fsa.rm(path, { recursive: true });

  createDir = async (path: string) => {
    if (!fsn.existsSync(path)) {
      await fsa.mkdir(path, { recursive: true });
    }
  };

  exists = (path: string) => {
    return fsn.existsSync(path);
  };

  tmpdir = () => os.tmpdir();

  join = (...paths: string[]) => path.join(...paths);

  cwd = () => process.cwd();

  normalise = (unnormalisedPath: string) => path.normalize(unnormalisedPath);

  findFiles = async (
    directory: string,
    filename: string,
    found: string[] = [],
    referencePath = ''
  ) => {
    const files = await fsa.readdir(directory);
    referencePath = referencePath || directory;

    for (const file of files) {
      const filePath = path.join(directory, file);
      const info = await fsa.lstat(filePath);
      if (info.isFile() && file.toLowerCase() === filename.toLowerCase()) {
        found.push(filePath.substring(referencePath.length + 1));
      }
      if (info.isDirectory()) {
        await this.findFiles(filePath, filename, found, referencePath);
      }
    }
    return found;
  };
}

const defaultFs = new DefaultFs();
export default defaultFs;
