#!/usr/bin/env node

import * as process from 'process';
import { list } from './internal/list';
import { verify } from './internal/verify';

const [, , cmd, ...args] = process.argv;

switch (cmd) {
  case 'init':
    console.log('init');
    break;
  case 'verify':
    verify(args);
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
      '  sheriff init [main.ts]: initialises Sheriff by adding a sheriff.config.ts and registering the eslint-plugin, if available',
    );
    console.log(
      '  sheriff list [main.ts]: lists the current modules of the project.',
    );
    console.log(
      '  sheriff verify [main.ts]: runs the verification process for the project',
    );

    break;
}
