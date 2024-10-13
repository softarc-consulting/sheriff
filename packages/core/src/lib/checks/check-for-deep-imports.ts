import { FsPath } from '../file-info/fs-path';
import { SheriffConfig } from '../config/sheriff-config';
import { ProjectInfo } from '../main/init';
import { FileInfo } from '../modules/file.info';

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

  for (const importedFileInfo of assignedFileInfo.imports) {
    if (
      isSameModule(importedFileInfo, assignedFileInfo) ||
      isExcludedRootModule(rootDir, config, importedFileInfo) ||
      accessesBarrelFileForBarrelModules(importedFileInfo) ||
      accessesExposedFileForBarrelLessModules(importedFileInfo, config.enableBarrelLess)
    ) {
      // 👍 all good
    } else {
      deepImports.push(
        assignedFileInfo.getRawImportForImportedFileInfo(importedFileInfo.path),
      );
    }
  }

  return deepImports;
}

function accessesExposedFileForBarrelLessModules(fileInfo: FileInfo, enableBarrelLess: boolean) {
  if (!enableBarrelLess) {
    return false;
  }

  if (fileInfo.moduleInfo.hasBarrel) {
    return false;
  }

  const possibleEncapsulatedFolderPath =
    fileInfo.moduleInfo.getEncapsulatedFolder();
  if (possibleEncapsulatedFolderPath === undefined) {
    return true;
  }

  return !fileInfo.path.startsWith(possibleEncapsulatedFolderPath);
}

function accessesBarrelFileForBarrelModules(fileInfo: FileInfo) {
  if (!fileInfo.moduleInfo.hasBarrel) {
    return false;
  }

  return fileInfo.moduleInfo.barrelPath === fileInfo.path;
}

function isExcludedRootModule(
  rootDir: FsPath,
  config: SheriffConfig,
  importedModule: FileInfo,
) {
  if (importedModule.moduleInfo.path !== rootDir) {
    return false;
  }

  return config.excludeRoot;
}

function isSameModule(importedFileInfo: FileInfo, assignedFileInfo: FileInfo) {
  return importedFileInfo.moduleInfo.path === assignedFileInfo.moduleInfo.path
}
