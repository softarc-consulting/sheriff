import { getEntriesFromCliOrConfig } from './internal/get-entries-from-cli-or-config';
import { cli } from './cli';
import { getProjectData } from '../api/get-project-data';
import getFs from '../fs/getFs';

export function exportData(...args: string[]): void {
  const fs = getFs();
  const projectEntries = getEntriesFromCliOrConfig(args[0], true);

  for (const entry of projectEntries) {
    const data = getProjectData(entry.entryFile, fs.cwd(), {
      includeExternalLibraries: true,
      projectName: entry.projectName,
    });
    cli.log(JSON.stringify(data, null, '  '));
  }
}
