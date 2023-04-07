import FileInfo from './file-info';
import traverseFileInfo from './traverse-file-info';
import { EOL } from 'os';

export const formatFileInfo = (fileInfo: FileInfo, indent = 2): string => {
  const output: string[] = [];
  for (const entry of traverseFileInfo(fileInfo)) {
    const prefix = ' '.repeat(indent * entry.level);
    output.push(`${prefix}${entry.fileInfo.path}`);
  }

  return output.join(EOL);
};
