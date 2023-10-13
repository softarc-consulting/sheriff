import { Module } from '../modules/module';
import { AssignedFileInfo } from '../modules/assigned-file.info';
import { FsPath } from '../file-info/fs-path';
import { SheriffConfig } from '../config/sheriff-config';
import { getAfi } from './get-afi';

export interface DeepImport {
  file: AssignedFileInfo;
  deepImport: AssignedFileInfo;
}

export function checkDeepImports(
  moduleInfos: Module[],
  config: SheriffConfig | undefined,
  rootDir: FsPath,
  modulePaths: Set<FsPath[]>,
  assignedFileInfoMap: Map<FsPath, AssignedFileInfo>
): DeepImport | undefined {
  const deepImports: DeepImport[] = [];
  const isRootAndExcluded = createIsRootAndExcluded(rootDir, config);
  const isModuleIndex = (fsPath: FsPath) => !modulePaths.has(fsPath);

  for (const importedFileInfo of assignedFileInfo.imports) {
    const importedAfi = getAfi(importedFileInfo.path, assignedFileInfoMap);
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

/**
 * creates a function which returns allows a deep import, if
 * `excludeRoot` in the config is `true` and the
 * importedModulePath is the root module.
 */
const createIsRootAndExcluded = (
  rootDir: FsPath,
  config: SheriffConfig | undefined
) => {
  let excludeRoot = false;
  if (config === undefined) {
    excludeRoot = false;
  } else {
    excludeRoot = Boolean(config.excludeRoot);
  }

  return (importedModulePath: string): boolean =>
    excludeRoot && importedModulePath === rootDir;
};
