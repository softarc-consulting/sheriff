import { getEntryFromCliOrConfig } from './internal/get-entry-from-cli-or-config';
import { traverseFileInfo } from '../modules/traverse-file-info';

export function exportData(...args: string[]) {
  const projectInfo = getEntryFromCliOrConfig(args[0]);

  for (const fileInfo of traverseFileInfo(projectInfo.fileInfo)) {
    console.log(fileInfo);
  }
}
