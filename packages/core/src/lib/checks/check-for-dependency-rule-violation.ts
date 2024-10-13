import { FsPath, toFsPath } from '../file-info/fs-path';
import { ProjectInfo } from '../main/init';
import { calcTagsForModule } from '../tags/calc-tags-for-module';
import { isDependencyAllowed } from './is-dependency-allowed';

export type DependencyRuleViolation = {
  rawImport: string;
  fromModulePath: FsPath;
  toModulePath: FsPath;
  fromTag: string;
  toTags: string[];
};

export function checkForDependencyRuleViolation(
  fsPath: FsPath,
  { config, getFileInfo, rootDir }: ProjectInfo,
): DependencyRuleViolation[] {
  const violations: DependencyRuleViolation[] = [];

  if (config.isConfigFileMissing) {
    return [];
  }

  const assignedFileInfo = getFileInfo(fsPath);
  const importedModulePathsWithRawImport = assignedFileInfo.imports
    // skip imports of same module
    .filter(
      (importedFi) =>
        importedFi.moduleInfo.path !== assignedFileInfo.moduleInfo.path,
    )
    .map((fileInfo) => [
      fileInfo.moduleInfo.path,
      assignedFileInfo.getRawImportForImportedFileInfo(fileInfo.path),
    ]);
  const fromModule = toFsPath(assignedFileInfo.moduleInfo.path);
  const fromTags = calcTagsForModule(
    fromModule,
    rootDir,
    config.modules,
    config.autoTagging,
  );

  for (const [
    importedModulePath,
    rawImport,
  ] of importedModulePathsWithRawImport) {
    for (const fromTag of fromTags) {
      const toTags: string[] = calcTagsForModule(
        toFsPath(importedModulePath),
        rootDir,
        config.modules,
        config.autoTagging,
      );
      const isViolation = !isDependencyAllowed(
        fromTag,
        toTags,
        config.depRules,
        {
          fromModulePath: fromModule,
          toModulePath: toFsPath(importedModulePath),
          fromFilePath: fsPath,
          toFilePath: toFsPath(importedModulePath),
        },
      );

      if (isViolation) {
        violations.push({
          rawImport,
          fromModulePath: fromModule,
          toModulePath: toFsPath(importedModulePath),
          fromTag,
          toTags,
        });

        break;
      }
    }
  }

  return violations;
}
