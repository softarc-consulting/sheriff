import FileInfo from './file-info';
import traverseFileInfo from './traverse-file-info';

export default (fileInfo: FileInfo, indent = 2): void => {
  for (const entry of traverseFileInfo(fileInfo)) {
    const prefix = ' '.repeat(indent * entry.level);
    console.log(`${prefix}${entry.fileInfo.path}`);
  }
};
