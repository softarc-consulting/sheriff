import FileInfo from '../2-file-info/file-info';
import getFs from '../1-fs/getFs';
import traverseFileInfo from '../2-file-info/traverse-file-info';
import { FsPath, assertFsPath } from '../2-file-info/fs-path';
import { log } from '../util/log';

export const getProjectDirsFromFileInfo = (
  fileInfo: FileInfo,
  rootDir: FsPath
): FsPath[] => {
  const fs = getFs();
  const rootDirPartsLength = fs.split(rootDir).length;
  const projectDirs = new Set<FsPath>();
  for (const {
    fileInfo: { path },
  } of traverseFileInfo(fileInfo)) {
    if (!path.startsWith(rootDir)) {
      throw new Error(`file ${path} is outside of root directory: ${rootDir}`);
    }
    if (fs.getParent(path) === rootDir) {
      projectDirs.add(rootDir);
      break;
    }

    const parts = fs.split(path);
    const projectDirPart = parts[rootDirPartsLength];
    const projectDir = fs.join(rootDir, projectDirPart);
    projectDirs.add(assertFsPath(projectDir));
  }

  log('Project Directories', Array.from(projectDirs).join(', '));
  return Array.from(projectDirs);
};
