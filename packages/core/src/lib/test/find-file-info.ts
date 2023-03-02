import FileInfo from '../file-info/file-info';
import traverseFileInfo from '../file-info/traverse-file-info';

export default (fi: FileInfo, path: string): FileInfo | undefined => {
  for (const { fileInfo } of traverseFileInfo(fi)) {
    if (fileInfo.path === path) {
      return fileInfo;
    }
  }

  return undefined;
};
