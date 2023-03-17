import FileInfo from './file-info';
import { generateTsData } from './generate-ts-data';
import traverseFilesystem from './traverse-filesystem';
import getFs from '../fs/getFs';
import { FsPath, toFsPath } from './fs-path';

/**
 * initialises the generation of the `FileInfo` tree.
 * @param fsPath
 */
export const generateFileInfoAndGetRootDir = (
  fsPath: FsPath,
  runOnce = false
): { fileInfo: FileInfo; rootDir: FsPath } => {
  const fs = getFs();
  const tsConfigPath = toFsPath(
    fs.findNearestParentFile(fsPath, 'tsconfig.json')
  );
  const fileInfoDict = new Map<FsPath, FileInfo>();
  const tsData = generateTsData(tsConfigPath);

  return {
    fileInfo: traverseFilesystem(fsPath, fileInfoDict, tsData, runOnce),
    rootDir: tsData.rootDir,
  };
};
