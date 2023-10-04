#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('sheriff')
  .description('Modularity for TypeScript Applications')
  .version('0.14.0');

program
  .option('-f --file', 'Entry file. Usually main.ts or index.ts')
  .option(
    '-t --type',
    'Type of the Application. Sheriff will pickup the default entry file automatically.'
  )
  .option('-sdi --skip-deep-import', 'Skip deep import checks')
  .option('-sdr --skip-dependency-rules', 'Skip dependency rules');

program.parse();
const opts = program.opts();
const file = program.args[0];
