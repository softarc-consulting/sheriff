import { FsPath, toFsPath } from '../file-info/fs-path';
import throwIfNull from '../util/throw-if-null';
import { logger } from '../log';
import { init } from '../main/init';
import FileInfo from '../file-info/file-info';
import {
  checkForDependencyRuleViolation,
  DependencyRuleViolation,
} from '../checks/check-for-dependency-rule-violation';

let cache: Record<string, string> = {};
let cacheActive = false;
let fileInfo: FileInfo | undefined;
const log = logger('core.eslint.dependency-rules');

export const violatesDependencyRule = (
  filename: string,
  importCommand: string,
  isFirstRun: boolean,
  fileContent: string
): string => {
  if (isFirstRun) {
    cache = {};
    fileInfo = undefined;
    cacheActive = false;
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
      return '';
    }

    fileInfo = projectInfo.fileInfo;
    const violations = checkForDependencyRuleViolation(
      toFsPath(filename),
      projectInfo
    );
    const { rootDir } = projectInfo;
    for (const violation of violations) {
      cache[violation.rawImport] = formatViolation(violation, rootDir);
    }
  }

  if (throwIfNull(fileInfo).isUnresolvableImport(importCommand)) {
    return `import ${importCommand} cannot be resolved`;
  }

  return cache[importCommand] ?? '';
};

function formatViolation(
  violation: DependencyRuleViolation,
  rootDir: FsPath
): string {
  const { fromModulePath, toModulePath, fromTags, toTag } = violation;
  return `module ${fromModulePath.substring(
    rootDir.length
  )} cannot access ${toModulePath.substring(
    rootDir.length
  )}. Tags [${fromTags.join(',')}] have no clearance for ${toTag}`;
}
