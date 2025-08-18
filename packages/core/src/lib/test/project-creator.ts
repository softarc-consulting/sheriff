import { FileTree, isSheriffConfigContent } from './project-configurator';
import { EOL } from 'os';
import * as crypto from 'crypto';
import getFs, { useVirtualFs } from '../fs/getFs';
import { toFsPath } from '../file-info/fs-path';
import { Configuration } from '../config/configuration';
import { defaultConfig } from '../config/default-config';
import { Fs } from '../fs/fs';
import { UserSheriffConfig } from '../config/user-sheriff-config';

export function createProject(
  fileTree: FileTree,
  testDirName = '/project',
): Fs {
  const fs = useVirtualFs();
  fs.reset();

  new ProjectCreator().create(fileTree, testDirName);
  return fs;
}

class ProjectCreator {
  fs = getFs();
  create = (fileTree: FileTree, testDirName?: string) => {
    if (testDirName === undefined) {
      testDirName = this.fs.join(
        this.fs.tmpdir(),
        'sheriff',
        crypto.randomUUID(),
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
          value.map((imp) => `import '${imp}';`).join(EOL),
        );
      } else if (typeof value === 'string') {
        this.fs.writeFile(`${currentDir}/${child}`, value);
      } else if (isSheriffConfigContent(value)) {
        let serializedConfig = JSON.stringify(
          serializeEncapsulationPattern(serializeDepRules(value.content)),
        );

        if (value.content.encapsulationPattern instanceof RegExp) {
          serializedConfig = serializedConfig.replace(
            /"Δ.*Δ"/,
            value.content.encapsulationPattern.toString(),
          );
        }

        serializedConfig = serializedConfig.replace(/"α([^ω]+)ω"/g, '$1');
        this.fs.writeFile(
          `${currentDir}/${child}`,
          `export const config = ${serializedConfig};`,
        );
      } else {
        this.traverseFileTree(`${currentDir}/${child}`, value);
      }
    }
  };
}

function serializeDepRules(config: UserSheriffConfig): Configuration {
  const mergedConfig = { ...defaultConfig, ...config };
  const ignoreFileExtensions =
    typeof mergedConfig.ignoreFileExtensions === 'function'
      ? mergedConfig.ignoreFileExtensions(defaultConfig.ignoreFileExtensions)
      : mergedConfig.ignoreFileExtensions;

  return {
    ...mergedConfig,
    depRules: Object.entries(mergedConfig.depRules).reduce(
      (current, [from, tos]) => ({
        ...current,
        [from]: (Array.isArray(tos) ? tos : [tos]).map((matcher) =>
          typeof matcher === 'function' ? `α${matcher.toString()}ω` : matcher,
        ),
      }),
      {},
    ),
    ignoreFileExtensions,
  };
}

function serializeEncapsulationPattern(config: Configuration): Configuration {
  if (typeof config.encapsulationPattern === 'string') {
    return config;
  } else {
    return {
      ...config,
      encapsulationPattern: `Δ${config.encapsulationPattern.toString()}Δ`,
    };
  }
}
