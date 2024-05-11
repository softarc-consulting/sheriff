import * as path from 'path';
import * as process from 'process';
import { FsPath, toFsPath } from '../file-info/fs-path';
import { init, ProjectInfo } from '../main/init';
import { assertNotNull } from '../util/assert-not-null';
import { Cli } from './util';
import { calcTagsForModule } from '../tags/calc-tags-for-module';

export function list(args: string[], cli: Cli) {
  const [main] = args;
  const mainPath = path.join(path.resolve(process.cwd(), main));
  const projectConfig = init(toFsPath(mainPath));

  cli.log(`This project contains ${projectConfig.modulePaths.size} modules:`);
  cli.log('');

  cli.log('.');
  const cleanedPaths = Array.from(projectConfig.modulePaths).map((modulePath) =>
    path.relative(process.cwd(), modulePath),
  );
  const directory = createDirectory(cleanedPaths);
  printDirectory(directory, cli);
}

interface Directory {
  [key: string]: Directory | string;
}

function createDirectory(filenames: string[]): Directory {
  const directory: Directory = {};
  filenames.forEach((filename) => {
    const folders = filename.split('/');
    const file = folders.pop();
    assertNotNull(file);

    let currentObject: Directory = directory;
    folders.forEach((folder) => {
      currentObject[folder] = currentObject[folder] || {};

      const next = currentObject[folder];
      if (typeof next === 'object') {
        currentObject = next;
      }
    });

    currentObject[file] = '';
  });

  return directory;
}

function printDirectory(
  directory: Directory,
  cli: Cli,
  indent = 0,
  prefix: string[] = [],
): void {
  if (Object.entries(directory).length === 1) {
    const [path, value] = Object.entries(directory)[0];
    prefix.push(path);
    if (typeof value === 'object') {
      printDirectory(value, cli, indent, prefix);
    }
  } else {
    if (prefix.length) {
      cli.log(' '.repeat(indent) + '├── ' + prefix.join('/'));
      indent += 2;
    }
    // Iterate through each key in the directory
    const entries = Object.entries(directory);
    for (let ix = 0; ix < entries.length; ix++) {
      const [key, value] = entries[ix];
      const symbol = ix === entries.length - 1 ? '└── ' : '├── ';
      cli.log(' '.repeat(indent) + symbol + key);

      if (typeof value === 'object') {
        printDirectory(value, cli, indent + 2);
      }
    }
  }
}

function getTags(module: FsPath, projectInfo: ProjectInfo): string[] {
  return calcTagsForModule(
    module,
    projectInfo.rootDir,
    projectInfo.config.tagging,
    projectInfo.config.autoTagging,
  );
}
