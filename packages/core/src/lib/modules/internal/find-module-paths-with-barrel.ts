import { FsPath, toFsPath } from '../../file-info/fs-path';
import getFs from '../../fs/getFs';

export function findModulePathsWithBarrel(
  projectDirs: FsPath[],
  barrelFileNames: string[],
): FsPath[] {
  const modulePaths = new Set<string>();

  for (const barrelFileName of barrelFileNames) {
    for (const projectDir of projectDirs) {
      const found = getFs().findFiles(projectDir, barrelFileName);
      for (const filePath of found) {
        const lastSep = Math.max(
          filePath.lastIndexOf('/'),
          filePath.lastIndexOf('\\'),
        );
        modulePaths.add(filePath.substring(0, lastSep));
      }
    }
  }

  return Array.from(modulePaths).map(toFsPath);
}
