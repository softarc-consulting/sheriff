import { toFsPath } from '../file-info/fs-path';
import { init } from '../main/init';
import FileInfo from '../file-info/file-info';
import { checkForDeepImports } from '../checks/check-for-deep-imports';

/**
 * This is the adapter for the ESLint plugin
 * This file needs to store the deep imports in a
 * cache because ESLint requests for every import
 * separately.
 *
 * We need both variables in order to distinguish
 * if we have an existing cache.
 * In case `cache` is empty we can't say if that
 * is because we never or run or because there no
 * deep imports.
 */
let cache: string[] = [];
let cachedFileInfo: FileInfo | undefined;

export const hasDeepImport = (
  filename: string,
  importCommand: string,
  isFirstRun: boolean,
  fileContent: string
): string => {
  if (isFirstRun) {
    cache = [];
    cachedFileInfo = undefined;
  }

  if (!cachedFileInfo) {
    const fsPath = toFsPath(filename);
    const projectInfo = init(fsPath, {
      traverse: false,
      entryFileContent: fileContent,
      returnOnMissingConfig: false,
    });

    cachedFileInfo = projectInfo.fileInfo;
    cache = checkForDeepImports(fsPath, projectInfo);
  }

  if (cachedFileInfo.isUnresolvableImport(importCommand)) {
    return `import ${importCommand} cannot be resolved`;
  }

  return cache.includes(importCommand)
    ? "Deep import is not allowed. Use the module's index.ts or path."
    : '';
};
