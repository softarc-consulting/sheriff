import { FsPath, toFsPath } from '../file-info/fs-path';
import { ProjectInfo } from '../main/init';
import { calcTagsForModule } from '../tags/calc-tags-for-module';
import { isDependencyAllowed } from './is-dependency-allowed';
import { assertNotNull } from '../util/assert-not-null';

export type DependencyRuleViolation = {
  rawImport: string;
  fromModulePath: FsPath;
  toModulePath: FsPath;
  fromTags: string[];
  toTag: string;
};

export function checkForDependencyRuleViolation(
  fsPath: FsPath,
  { config, getFileInfo, rootDir, modulePaths }: ProjectInfo,
): DependencyRuleViolation[] {
  const violations: DependencyRuleViolation[] = [];

  assertNotNull(config);

  const assignedFileInfo = getFileInfo(fsPath);
  const importedModulePathsWithRawImport = assignedFileInfo.imports
    // skip deep imports
    .filter((importedFi) => modulePaths.has(importedFi.path))
    .map((iafi) => [
      iafi.moduleInfo.directory,
      assignedFileInfo.getRawImportForImportedFileInfo(iafi.path),
    ]);
  const fromModule = toFsPath(assignedFileInfo.moduleInfo.directory);
  const fromTags = calcTagsForModule(fromModule, rootDir, config.tagging);

  for (const [
    importedModulePath,
    rawImport,
  ] of importedModulePathsWithRawImport) {
    const toTags: string[] = calcTagsForModule(
      toFsPath(importedModulePath),
      rootDir,
      config.tagging,
    );
    for (const toTag of toTags) {
      if (
        !isDependencyAllowed(fromTags, toTag, config.depRules, {
          fromModulePath: fromModule,
          toModulePath: toFsPath(importedModulePath),
          fromFilePath: fsPath,
          toFilePath: toFsPath(importedModulePath),
        })
      ) {
        violations.push({
          rawImport,
          fromModulePath: fromModule,
          toModulePath: toFsPath(importedModulePath),
          fromTags,
          toTag,
        });

        break;
      }
    }
  }

  return violations;
}
