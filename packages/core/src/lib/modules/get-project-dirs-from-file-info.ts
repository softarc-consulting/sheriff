import FileInfo from '../file-info/file-info';
import getFs from '../fs/getFs';
import traverseFileInfo from '../file-info/traverse-file-info';

export default (fileInfo: FileInfo): string[] => {
  const fs = getFs();
  const projectDirs = new Set<string>();
  traverseFileInfo(fileInfo, (node) => {
    const paths = fs.normalise(node.path).split('/');
    if (paths.length === 1) {
      projectDirs.clear();
      projectDirs.add('.');
      return false;
    }
    if (node.path.startsWith('..')) {
      throw new Error(`file is outside of project directory: ${node.path}`);
    }
    projectDirs.add(paths[0]);
    return true;
  });

  return Array.from(projectDirs);
};
