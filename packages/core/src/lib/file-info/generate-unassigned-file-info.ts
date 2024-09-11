import { UnassignedFileInfo } from './unassigned-file-info';
import { FsPath } from './fs-path';
import { formatFileInfo } from './format-file-info';
import { logger } from '../log';
import { TsData } from './ts-data';
import { traverseFilesystem } from './traverse-filesystem';

const log = logger('core.file-info.generate-and-root-dir');

/**
 * initialises the generation of the `FileInfo` tree. If @fileContent
 * is available, it will not read from @fsPath.
 *
 * @param fsPath path of a file or the content as string (used by ESLint in IDE)
 * @param runOnce do not traverse the chain of imports.
 * @param tsData misc. data around TS config
 * @param fileContent optional file content (used by ESLint in IDE)
 */
export const generateUnassignedFileInfo = (
  fsPath: FsPath,
  runOnce = false,
  tsData: TsData,
  fileContent?: string,
): UnassignedFileInfo => {
  const fileInfoDict = new Map<FsPath, UnassignedFileInfo>();

  const fileInfo = traverseFilesystem(
    fsPath,
    fileInfoDict,
    tsData,
    runOnce,
    fileContent,
  );

  log.info(formatFileInfo(fileInfo));

  return fileInfo;
};
