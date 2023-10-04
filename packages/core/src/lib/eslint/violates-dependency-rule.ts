import { toFsPath } from '../file-info/fs-path';
import throwIfNull from '../util/throw-if-null';
import { calcTagsForModule } from '../tags/calc-tags-for-module';
import { isDependencyAllowed } from '../checks/is-dependency-allowed';
import { logger } from '../log';
import { init } from '../main/init';
import FileInfo from '../file-info/file-info';
import { analyseProject } from '../main/analyse-project';

const cache = new Map<string, string>();
let fileInfo: FileInfo | undefined;
const log = logger('core.eslint.dependency-rules');

export const violatesDependencyRule = (
  filename: string,
  importCommand: string,
  isFirstRun: boolean,
  fileContent: string
): string => {
  if (isFirstRun) {
    cache.clear();
    fileInfo = undefined;
  }
  if (!cache.has(importCommand)) {
    const { tsData, config } = init(toFsPath(filename), true);
    const { rootDir } = tsData;

    if (!config) {
      log.info('no sheriff.config.ts present in ' + rootDir);
      return '';
    }

    const { getAfi, modulePaths, fileInfo } = analyseProject(
      toFsPath(filename),
      false,
      tsData,
      fileContent
    );

    const assignedFileInfo = getAfi(fileInfo.path);
    const importedModulePathsWithRawImport = assignedFileInfo.imports
      .filter((importedFi) => modulePaths.has(importedFi.path))
      .map((importedFi) => getAfi(importedFi.path))
      .map((iafi) => [
        iafi.moduleInfo.directory,
        assignedFileInfo.getRawImportForImportedFileInfo(iafi.path),
      ]);
    const fromModule = toFsPath(
      getAfi(toFsPath(filename)).moduleInfo.directory
    );
    const fromTags = calcTagsForModule(fromModule, rootDir, config.tagging);

    for (const [
      importedModulePath,
      rawImport,
    ] of importedModulePathsWithRawImport) {
      const toTags: string[] = calcTagsForModule(
        toFsPath(importedModulePath),
        rootDir,
        config.tagging
      );

      log.info(
        `Checking for from tags of ${fromTags.join(',')} to ${toTags.join(',')}`
      );

      for (const toTag of toTags) {
        if (
          !isDependencyAllowed(fromTags, toTag, config.depRules, {
            fromModulePath: fromModule,
            toModulePath: toFsPath(importedModulePath),
            fromFilePath: toFsPath(filename),
            toFilePath: toFsPath(importedModulePath),
          })
        ) {
          cache.set(
            rawImport,
            `module ${fromModule.substring(
              rootDir.length
            )} cannot access ${importedModulePath.substring(
              rootDir.length
            )}. Tags [${fromTags.join(',')}] have no clearance for ${toTag}`
          );

          break;
        }
      }

      if (!cache.has(importCommand)) {
        cache.set(importCommand, '');
      }
    }
  }

  if (throwIfNull(fileInfo).isUnresolvableImport(importCommand)) {
    return `import ${importCommand} cannot be resolved`;
  }

  return cache.get(importCommand) ?? '';
};
