import { FsPath } from '../file-info/fs-path';
import { SheriffConfig } from '../config/sheriff-config';
import { getAfi } from './get-afi';
import throwIfNull from '../util/throw-if-null';
import { ProjectInfo } from '../main/init';

/**
 * verifies if an existing file has deep imports which are forbidden.
 * Unresolvable imports are skipped.
 *
 * It is up to the caller to decide.
 */
export function checkForDeepImports(
  fsPath: FsPath,
  { assignedFileInfoMap, rootDir, config, modulePaths }: ProjectInfo
): string[] {
  const deepImports: string[] = [];
  const assignedFileInfo = throwIfNull(assignedFileInfoMap.get(fsPath));

  const isRootAndExcluded = createIsRootAndExcluded(rootDir, config);
  const isModuleIndex = (fsPath: FsPath) => modulePaths.has(fsPath);

  for (const importedFileInfo of assignedFileInfo.imports) {
    const importedAfi = getAfi(importedFileInfo.path, assignedFileInfoMap);
    if (
      !isModuleIndex(importedAfi.path) &&
      !isRootAndExcluded(importedAfi.moduleInfo.path) &&
      importedAfi.moduleInfo !== assignedFileInfo.moduleInfo
    ) {
      deepImports.push(
        assignedFileInfo.getRawImportForImportedFileInfo(importedAfi.path)
      );
    }
  }

  return deepImports;
}

/**
 * creates a function which allows a deep import, if
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
