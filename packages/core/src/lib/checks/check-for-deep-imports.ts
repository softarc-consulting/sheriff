import { FsPath } from '../file-info/fs-path';
import { SheriffConfig } from '../config/sheriff-config';
import { ProjectInfo } from '../main/init';
import { FileInfo } from "../modules/file.info";

/**
 * verifies if an existing file has deep imports which are forbidden.
 * Unresolvable imports are skipped.
 *
 * It is up to the caller to decide.
 */
export function checkForDeepImports(
  fsPath: FsPath,
  { rootDir, config, getFileInfo }: ProjectInfo,
): string[] {
  const deepImports: string[] = [];
  const assignedFileInfo = getFileInfo(fsPath);

  const isRootAndExcluded = createIsRootAndExcluded(rootDir, config);
  const isModuleBarrel = (fileInfo: FileInfo) =>
    fileInfo.moduleInfo.hasBarrel &&
    fileInfo.moduleInfo.barrelPath === fileInfo.path;

  for (const importedFileInfo of assignedFileInfo.imports) {
    if (
      !isModuleBarrel(importedFileInfo) &&
      !isRootAndExcluded(importedFileInfo.moduleInfo.path) &&
      importedFileInfo.moduleInfo !== assignedFileInfo.moduleInfo
    ) {
      deepImports.push(
        assignedFileInfo.getRawImportForImportedFileInfo(importedFileInfo.path),
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
  config: SheriffConfig | undefined,
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
