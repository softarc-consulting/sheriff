import UnassignedFileInfo from './unassigned-file-info';
import traverseUnassignedFileInfo from './traverse-unassigned-file-info';
import { EOL } from 'os';

export const formatFileInfo = (fileInfo: UnassignedFileInfo, indent = 2): string => {
  const output: string[] = [];
  for (const entry of traverseUnassignedFileInfo(fileInfo)) {
    const prefix = ' '.repeat(indent * entry.level);
    output.push(`${prefix}${entry.fileInfo.path}`);
  }

  return output.join(EOL);
};
