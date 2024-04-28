import * as path from 'path';
import * as process from 'process';
import { toFsPath } from '../file-info/fs-path';
import { init } from '../main/init';
import { assertNotNull } from '../util/assert-not-null';
import { Cli } from './util';

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

// ChatGPT
function createDirectory(filenames: string[]): Directory {
  // Create an object to store filenames based on folders
  const directory: Directory = {};

  // Iterate through each filename
  filenames.forEach((filename) => {
    // Split the filename into an array based on the folder structure
    const folders = filename.split('/');

    // Get the last element (file name) and remove it from the array
    const file = folders.pop();
    assertNotNull(file);

    // Create nested objects based on the folder structure
    let currentObject: Directory = directory;
    folders.forEach((folder) => {
      // Create a new object if it doesn't exist
      currentObject[folder] = currentObject[folder] || {};

      // Move to the next level in the hierarchy
      const next = currentObject[folder];
      if (typeof next === 'object') {
        currentObject = next;
      }
    });

    // Add the file to the final nested object
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
