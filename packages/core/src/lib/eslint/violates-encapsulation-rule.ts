import { toFsPath } from '../file-info/fs-path';
import { init } from '../main/init';
import { hasEncapsulationViolations } from '../checks/has-encapsulation-violations';
import { FileInfo } from '../modules/file.info';
import { isRelativeImport } from './is-relative-import';

let cache: Record<string, FileInfo> = {};
let cachedFileInfo: FileInfo | undefined;

/**
 * This is the adapter for the ESLint plugin
 *
 * This file needs to store the encapsulation violations
 * in a cache because ESLint calls for every import
 * in a file separately.
 *
 * We need both variables in order to distinguish
 * if we have an existing cache.
 * In case `cache` is empty we can't say if that
 * is because we never or run or because there no
 * deep imports.
 *
 * @param filename Name of the file
 * @param importCommand Import command
 * @param isFirstRun If this is the first run
 * @param fileContent Content of the file
 * @param isLegacyDeepImport If this is coming from the deep import rule
 */
export const violatesEncapsulationRule = (
  filename: string,
  importCommand: string,
  isFirstRun: boolean,
  fileContent: string,
  isLegacyDeepImport: boolean,
): string => {
  if (isFirstRun) {
    cache = {};
    cachedFileInfo = undefined;
  }

  if (!cachedFileInfo) {
    const fsPath = toFsPath(filename);
    const projectInfo = init(fsPath, {
      traverse: false,
      entryFileContent: fileContent,
    });

    cachedFileInfo = projectInfo.fileInfo;
    cache = hasEncapsulationViolations(fsPath, projectInfo);
  }

  if (
    cachedFileInfo.isUnresolvableImport(importCommand) &&
    isRelativeImport(importCommand)
  ) {
    return `import ${importCommand} cannot be resolved`;
  }

  const imports = Object.keys(cache);
  if (!imports.includes(importCommand)) {
    return '';
  }

  if (isLegacyDeepImport) {
    return "Deep import is not allowed. Use the module's index.ts or path.";
  } else {
    const importFileInfo = cache[importCommand];
    return importFileInfo.moduleInfo.hasBarrel
      ? `'${importCommand}' is a deep import from a barrel module. Use the module's barrel file (index.ts) instead.`
      :  `'${importCommand}' cannot be imported. It is encapsulated.`;
  }
};
