import FileInfo from '../file-info/file-info';
import traverseFileInfo from '../file-info/traverse-file-info';

export default (fileInfo: FileInfo, path: string): FileInfo | undefined => {
  let returner: FileInfo | undefined;
  traverseFileInfo(fileInfo, (fi) => {
    if (fi.path === path) {
      returner = fi;
      return false;
    }
    return true;
  });

  return returner;
};
