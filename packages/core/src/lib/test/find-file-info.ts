import UnassignedFileInfo from '../file-info/unassigned-file-info';
import traverseUnassignedFileInfo from '../file-info/traverse-unassigned-file-info';

export default (fi: UnassignedFileInfo, path: string): UnassignedFileInfo | undefined => {
  for (const { fileInfo } of traverseUnassignedFileInfo(fi)) {
    if (fileInfo.path === path) {
      return fileInfo;
    }
  }

  return undefined;
};
