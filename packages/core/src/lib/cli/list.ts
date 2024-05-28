import { FsPath, toFsPath } from '../file-info/fs-path';
import { ProjectInfo } from '../main/init';
import { calcTagsForModule } from '../tags/calc-tags-for-module';
import { getEntryFromCliOrConfig } from './internal/get-entry-from-cli-or-config';
import getFs from '../fs/getFs';
import { cli } from './cli';

export function list(args: string[]) {
  const projectInfo = getEntryFromCliOrConfig(args[0]);
  // root doesn't count
  const modulesCount = projectInfo.modules.length - 1;

  cli.log(`This project contains ${modulesCount} modules:`);
  cli.log('');

  cli.log('. (root)');
  const directory = mapModulesToDirectory(
    Array.from(
      projectInfo.modules
        .filter((module) => !module.isRoot)
        .map((module) => toFsPath(module.directory)),
    ),
    projectInfo,
  );
  printDirectory(directory);
}

type Directory = Record<
  string,
  { children: Directory; tags: string; isModule: boolean }
>;

function mapModulesToDirectory(
  modulePaths: FsPath[],
  projectInfo: ProjectInfo,
): Directory {
  const fs = getFs();
  const directory: Directory = {};
  for (const modulePath of modulePaths) {
    const cleanedModulePath = fs.relativeTo(projectInfo.rootDir, modulePath);
    const folders = cleanedModulePath.split('/');

    let currentEntry: Directory = directory;
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      currentEntry[folder] = currentEntry[folder] || {
        children: {},
        tags: '',
        isModule: false,
      };

      if (i === folders.length - 1) {
        currentEntry[folder].tags =
          ` (${getTags(modulePath, projectInfo).join(', ')})`;
        currentEntry[folder].isModule = true;
      } else {
        currentEntry = currentEntry[folder].children;
      }
    }
  }

  return directory;
}

function printDirectory(directory: Directory, indent = 0): void {
  const entries = Object.entries(directory);
  // Iterate through each key in the directory
  entries.forEach(([key, { children, tags, isModule }], ix) => {
    const symbol = ix === entries.length - 1 ? '└── ' : '├── ';
    cli.log(
      ' '.repeat(indent) + symbol + (isModule ? cli.bold(key) + tags : key),
    );

    if (Object.entries(children).length) {
      printDirectory(children, indent + 2);
    }
  });
}

function getTags(module: FsPath, projectInfo: ProjectInfo): string[] {
  return calcTagsForModule(
    module,
    projectInfo.rootDir,
    projectInfo.config.tagging,
    projectInfo.config.autoTagging,
  );
}
