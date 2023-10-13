import { FsPath, toFsPath } from '../file-info/fs-path';
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
