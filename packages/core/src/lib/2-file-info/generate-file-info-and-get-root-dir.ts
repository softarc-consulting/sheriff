import FileInfo from './file-info';
import { generateTsData } from './generate-ts-data';
import traverseFilesystem from './traverse-filesystem';
import getFs from '../1-fs/getFs';
import { FsPath, toFsPath } from './fs-path';
import { log } from '../util/log';
import { formatFileInfo } from './format-file-info';

/**
 * initialises the generation of the `FileInfo` tree.
 * @param fsPath
 * @param runOnce: do not traverse the chain of imports.
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

  const fileInfo = traverseFilesystem(fsPath, fileInfoDict, tsData, runOnce);

  log('FileInfo', formatFileInfo(fileInfo));

  return {
    fileInfo,
    rootDir: tsData.rootDir,
  };
};
