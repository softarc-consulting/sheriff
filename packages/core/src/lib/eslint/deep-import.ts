import { FsPath, toFsPath } from '../file-info/fs-path';
import { findConfig } from '../config/find-config';
import { parseConfig } from '../config/parse-config';
import { init } from '../main/init';
import FileInfo from '../file-info/file-info';
import { analyseProject } from '../main/analyse-project';

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
    const { tsData } = init(toFsPath(filename), false);
    const { rootDir } = tsData;
    const { getAfi, modulePaths, fileInfo } = analyseProject(
      toFsPath(filename),
      false,
      tsData,
      fileContent
    );
    cachedFileInfo = fileInfo;

    const isRootAndExcluded = createIsRootAndExcluded(rootDir);
    const isModuleIndex = (fsPath: FsPath) => !modulePaths.has(fsPath);

    const assignedFileInfo = getAfi(fileInfo.path);

    for (const importedFileInfo of assignedFileInfo.imports) {
      const importedAfi = getAfi(importedFileInfo.path);
      if (
        !isModuleIndex(importedAfi.path) &&
        !isRootAndExcluded(importedAfi.moduleInfo.path) &&
        importedAfi.moduleInfo !== assignedFileInfo.moduleInfo
      ) {
        cache.push(
          assignedFileInfo.getRawImportForImportedFileInfo(importedAfi.path)
        );
      }
    }
  }

  if (cachedFileInfo.isUnresolvableImport(importCommand)) {
    return `import ${importCommand} cannot be resolved`;
  }

  return cache.includes(importCommand)
    ? "Deep import is not allowed. Use the module's index.ts or path."
    : '';
};

/**
 * creates a function which returns allows a deep import, if
 * `excludeRoot` in the config is `true` and the
 * importedModulePath is the root module.
 */
const createIsRootAndExcluded = (rootDir: FsPath) => {
  let excludeRoot = false;
  const configFile = findConfig(rootDir);
  if (configFile === undefined) {
    excludeRoot = false;
  } else {
    const config = parseConfig(configFile);
    excludeRoot = Boolean(config.excludeRoot);
  }

  return (importedModulePath: string): boolean =>
    excludeRoot && importedModulePath === rootDir;
};
