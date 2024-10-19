import { FsPath } from '../file-info/fs-path';
import { Configuration } from '../config/configuration';
import { ProjectInfo } from '../main/init';
import { FileInfo } from '../modules/file.info';

/**
 * verifies if an existing file has imports which break
 * the other module's encapsulation.
 *
 * Unresolvable imports are skipped.
 *
 * It is up to the caller to decide.
 */
export function hasEncapsulationViolations(
  fsPath: FsPath,
  { rootDir, config, getFileInfo }: ProjectInfo,
): Record<string, FileInfo> {
  const encapsulationViolations: Record<string, FileInfo> = {};
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
      const rawImport = assignedFileInfo.getRawImportForImportedFileInfo(importedFileInfo.path);
      encapsulationViolations[rawImport] = importedFileInfo;
    }
  }

  return encapsulationViolations;
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
  config: Configuration,
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
