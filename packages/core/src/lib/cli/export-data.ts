import { getEntryFromCliOrConfig } from './internal/get-entry-from-cli-or-config';
import { cli } from './cli';
import { getProjectData } from '../api/get-project-data';
import getFs from '../fs/getFs';

export function exportData(...args: string[]): void {
  const fs = getFs();
  const entryFile = getEntryFromCliOrConfig(args[0], false);

  const data = getProjectData(entryFile, fs.cwd());
  cli.log(JSON.stringify(data, null, '  '));
}
