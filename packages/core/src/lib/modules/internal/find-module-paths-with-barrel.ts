import { FsPath, toFsPath } from '../../file-info/fs-path';
import getFs from '../../fs/getFs';

export function findModulePathsWithBarrel(
  projectDirs: FsPath[],
  barrelFileName: string,
): FsPath[] {
  return projectDirs.flatMap((projectDir) =>
    getFs()
      .findFiles(projectDir, barrelFileName)
      .map((path) => path.slice(0, -(barrelFileName.length + 1)))
      .map(toFsPath),
  );
}
