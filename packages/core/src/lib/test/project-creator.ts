import { FileTree, isSheriffConfigContent } from './project-configurator';
import { EOL } from 'os';
import * as crypto from 'crypto';
import getFs, { useVirtualFs } from '../fs/getFs';
import { toFsPath } from '../file-info/fs-path';
import { SheriffConfig } from '../config/sheriff-config';

export function createProject(fileTree: FileTree) {
  useVirtualFs();
  getFs().reset();

  new ProjectCreator().create(fileTree, '/project');
}

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
      } else if (isSheriffConfigContent(value)) {
        const serializedConfig = JSON.stringify(serializeDepRules(value.content)).replace(/"α([^ω]+)ω"/g, '$1');
        this.fs.writeFile(
          `${currentDir}/${child}`,
          `export const config = ${serializedConfig};`
        );
      } else {
        this.traverseFileTree(`${currentDir}/${child}`, value);
      }
    }
  };
}

function serializeDepRules(config: SheriffConfig): SheriffConfig {
  return {
    ...config,
    depRules: Object.entries(config.depRules).reduce(
      (current, [from, tos]) => ({
        ...current,
        [from]: (Array.isArray(tos) ? tos : [tos]).map(matcher => typeof matcher === 'function' ? `α${matcher.toString()}ω` : matcher)
      }),
      {}
    ),
  };
}
