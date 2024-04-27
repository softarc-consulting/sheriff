// create a function that creates a file sheriff.config.ts in the current directory

import getFs from '../fs/getFs';
import { Cli } from './util';

export function init(cli: Cli, args: string[]) {
  const fs = getFs();
  if (fs.exists('sheriff.config.ts')) {
    cli.log('');
    cli.log('sheriff.config.ts does already exist. Aborting...');
    cli.log('');
    cli.endProcessOk();
  }

  fs.writeFile(
    'sheriff.config.ts',
    `\
import { SheriffConfig } from '@softarc/sheriff-core';

/**
  * Minimal configuration for Sheriff
  * Assigns the 'noTag' tag to all modules and
  * allows all modules to depend on each other.
  */

export const config: SheriffConfig = {
  tagging: {}, // apply tags to your modules
  depRules: {
    // root is a virtual module, which contains all files not being part
    // of any module, e.g. application shell, main.ts, etc.
    'root': 'noTag',
    'noTag': 'noTag',

    // add your dependency rules here
  },
};
`,
  );

  cli.log('');
  cli.log('sheriff.config.ts has been created successfully.');
  cli.log('');
  cli.endProcessOk();
}
