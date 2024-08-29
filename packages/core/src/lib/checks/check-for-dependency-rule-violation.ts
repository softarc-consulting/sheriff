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
  { config, getFileInfo, rootDir, modules }: ProjectInfo,
): DependencyRuleViolation[] {
  const violations: DependencyRuleViolation[] = [];
  const modulePaths = modules.map((module) => module.path);

  if (config.isConfigFileMissing) {
    return [];
  }

  const assignedFileInfo = getFileInfo(fsPath);
  const importedModulePathsWithRawImport = assignedFileInfo.imports
    // skip deep imports
    .filter((importedFi) => modulePaths.includes(importedFi.path))
    .map((fileInfo) => [
      fileInfo.moduleInfo.directory,
      assignedFileInfo.getRawImportForImportedFileInfo(fileInfo.path),
    ]);
  const fromModule = toFsPath(assignedFileInfo.moduleInfo.directory);
  const fromTags = calcTagsForModule(
    fromModule,
    rootDir,
    config.tagging,
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
        config.tagging,
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
