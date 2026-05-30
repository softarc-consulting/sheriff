import { FsPath, toFsPath } from '../file-info/fs-path';
import throwIfNull from '../util/throw-if-null';
import { logger } from '../log';
import { init } from '../main/init';
import {
  checkForDependencyRuleViolation,
  DependencyRuleViolation,
} from '../checks/check-for-dependency-rule-violation';
import { FileInfo } from '../modules/file.info';
import { isRelativeImport } from './is-relative-import';
import { Configuration } from '../config/configuration';

let cache: Record<string, string> = {};
let cacheActive = false;
let fileInfo: FileInfo | undefined;
let config: Configuration | undefined;
let configFileIsMissing = false;
const log = logger('core.eslint.dependency-rules');

export const violatesDependencyRule = (
  filename: string,
  importCommand: string,
  isFirstRun: boolean,
  fileContent: string,
): string => {
  if (isFirstRun) {
    cache = {};
    fileInfo = undefined;
    config = undefined;
    cacheActive = false;
    configFileIsMissing = false;
  }
  if (configFileIsMissing) {
    return '';
  }

  if (!cacheActive) {
    cacheActive = true;
    const projectInfo = init(toFsPath(filename), {
      traverse: false,
      entryFileContent: fileContent,
      returnOnMissingConfig: true,
    });

    if (!projectInfo) {
      log.info('no sheriff.config.ts present');
      configFileIsMissing = true;
      return '';
    }

    fileInfo = projectInfo.fileInfo;
    config = projectInfo.config;
    const violations = checkForDependencyRuleViolation(
      toFsPath(filename),
      projectInfo,
    );
    const { rootDir } = projectInfo;
    for (const violation of violations) {
      cache[violation.rawImport] = formatViolation(violation, rootDir);
    }
  }

  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  if (!throwIfNull(config).supportedFileExtensions.includes(extension)) {
    return `[SHERIFF CONFIG MISMATCH] Sheriff is linting this file (.${extension}) due to your ESLint configuration, but this extension is not in 'supportedFileExtensions' in your sheriff.config.ts. Add it there if you want Sheriff to support it.`;
  }

  if (
    throwIfNull(fileInfo).isUnresolvableImport(importCommand) &&
    isRelativeImport(importCommand)
  ) {
    return `import ${importCommand} cannot be resolved`;
  }

  return cache[importCommand] ?? '';
};

function formatViolation(
  violation: DependencyRuleViolation,
  rootDir: FsPath,
): string {
  const { fromModulePath, toModulePath, fromTag, toTags } = violation;
  return `module ${fromModulePath.substring(
    rootDir.length,
  )} cannot access ${toModulePath.substring(
    rootDir.length,
  )}. Tag ${fromTag} has no clearance for tags ${toTags.join(', ')}`;
}
