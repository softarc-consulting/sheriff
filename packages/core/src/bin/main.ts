#!/usr/bin/env node

/** TODO
 * - Show tags in list
 * - Add entryFile property in sheriff.config.ts
 * - Add documentation
 */

import * as process from 'process';
import { verify } from '../lib/cli/verify';
import { list } from '../lib/cli/list';
import { Cli } from '../lib/cli/util';
import { init } from '../lib/cli/init';

const [, , cmd, ...args] = process.argv;

const cli: Cli = {
  endProcessOk: () => process.exit(0),
  endProcessError: () => process.exit(1),
  log: (message: string) => console.log(message),
  logError: (message: string) => console.error(message),
};

switch (cmd) {
  case 'init':
    init(cli, args);
    break;
  case 'verify':
    verify(process.cwd(), cli, args);
    break;
  case 'list':
    list(args);
    break;
  default:
    console.log(
      '\u001b[1m' + 'Sheriff - Modularity for TypeScript Projects\x1b[0m',
    );
    console.log('');
    console.log('Commands:');
    console.log(
      '  sheriff init [main.ts]: initializes Sheriff by adding a sheriff.config.ts. If eslint is installed, it also adds the plugin',
    );
    console.log(
      '  sheriff list [main.ts]: lists the current modules of the project.',
    );
    console.log(
      '  sheriff verify [main.ts]: runs the verification process for the project',
    );

    break;
}
