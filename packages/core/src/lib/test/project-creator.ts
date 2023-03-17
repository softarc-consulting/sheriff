import { FileTree } from './project-configurator';
import { EOL } from 'os';
import * as crypto from 'crypto';
import getFs from '../fs/getFs';
import { toFsPath } from '../file-info/fs-path';

export class ProjectCreator {
  fs = getFs();
  create = (fileTree: FileTree, testDirName?: string) => {
    if (testDirName === undefined) {
      testDirName = this.fs.join(
        this.fs.tmpdir(),
        'sheriff',
        crypto.randomUUID()
      );
    } else if (this.fs.exists(testDirName)) {
      this.fs.removeDir(toFsPath(testDirName));
    }

    this.fs.createDir(testDirName);
    this.traverseFileTree(testDirName, fileTree);
  };

  traverseFileTree = (currentDir: string, fileTree: FileTree) => {
    this.fs.createDir(currentDir);
    for (const child in fileTree) {
      const value = fileTree[child];
      if (Array.isArray(value)) {
        this.fs.writeFile(
          `${currentDir}/${child}`,
          value.map((imp) => `import '${imp}';`).join(EOL)
        );
      } else if (typeof value === 'string') {
        this.fs.writeFile(`${currentDir}/${child}`, value);
      } else {
        this.traverseFileTree(`${currentDir}/${child}`, value);
      }
    }
  };
}
