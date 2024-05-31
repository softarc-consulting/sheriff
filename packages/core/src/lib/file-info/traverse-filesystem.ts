import UnassignedFileInfo from './unassigned-file-info';
import getFs from '../fs/getFs';
import * as ts from 'typescript';
import { TsData, TsPaths } from './ts-data';
import { FsPath, toFsPath } from './fs-path';

export type ResolveFn = (
  moduleName: string,
) => ReturnType<typeof ts.resolveModuleName>;

// https://stackoverflow.com/questions/71815527/typescript-compiler-apihow-to-get-absolute-path-to-source-file-of-import-module
/**
 * This function generates the FileInfo tree.
 * It starts with the entry TypeScript file (in Angular main.ts) and follows
 * all the imports.
 *
 * It does not follow an import when it is an external library, i.e. comes from
 * node_modules or is already part of the tree.
 *
 * To improve the testability, we use abstraction whenever access to the
 * filesystem happens. In case the abstraction does not emulate the original's
 * behaviour, "strange bugs" might occur. Look out for them.
 *
 * @param fsPath Filename to traverse from
 * @param fileInfoDict Dictionary of traversed files to catch circularity
 * @param tsData
 * @param runOnce traverse only once. needed for ESLint mode
 * @param fileContent if passed, is used instead the content of @fsPath.
 * necessary for unsaved files inESLint
 */
const traverseFilesystem = (
  fsPath: FsPath,
  fileInfoDict: Map<FsPath, UnassignedFileInfo>,
  tsData: TsData,
  runOnce = false,
  fileContent?: string,
): UnassignedFileInfo => {
  const { paths, configObject, sys, rootDir } = tsData;
  const fileInfo: UnassignedFileInfo = new UnassignedFileInfo(fsPath, []);
  fileInfoDict.set(fsPath, fileInfo);
  const fs = getFs();
  fileContent = fileContent ?? fs.readFile(fsPath);
  const preProcessedFile = ts.preProcessFile(fileContent);
  const resolveFn: ResolveFn = (moduleName: string) =>
    ts.resolveModuleName(moduleName, fsPath, configObject.options, sys);

  for (const importedFile of preProcessedFile.importedFiles) {
    const { fileName } = importedFile;
    const resolvedImport = resolveFn(fileName);
    let importPath: FsPath | undefined;

    if (resolvedImport.resolvedModule) {
      const { resolvedFileName } = resolvedImport.resolvedModule;
      if (!resolvedImport.resolvedModule.isExternalLibraryImport) {
        importPath = fixPathSeparators(resolvedFileName);
        if (!importPath.startsWith(rootDir)) {
          throw new Error(`${importPath} is outside of root ${rootDir}`);
        }
      }
    } else if (fileName.endsWith('.json')) {
      // just skip it
    } else if (fileName.startsWith('.')) {
      // might be an undetected dependency in node_modules
      // or an incomplete import (= developer is still typing),
      // if we read from an unsaved file via ESLint.
      fileInfo.addUnresolvableImport(fileName);
    } else {
      const resolvedTsPath = resolvePotentialTsPath(
        fileName,
        paths,
        resolveFn,
        fsPath,
      );
      if (resolvedTsPath) {
        importPath = resolvedTsPath;
      }
    }

    if (importPath) {
      const existing = fileInfoDict.get(importPath);
      if (existing) {
        fileInfo.addImport(existing, fileName);
      } else if (runOnce) {
        fileInfo.addImport(new UnassignedFileInfo(importPath), fileName);
      } else {
        fileInfo.addImport(
          traverseFilesystem(importPath, fileInfoDict, tsData),
          fileName,
        );
      }
    }
  }

  return fileInfo;
};

export function resolvePotentialTsPath(
  moduleName: string,
  tsPaths: TsPaths,
  resolveFn: ResolveFn,
  filename: string,
): FsPath | undefined {
  let unpathedImport: string | undefined;
  for (const tsPath in tsPaths) {
    const { isWildcard, clearedTsPath } = clearTsPath(tsPath);
    if (isWildcard && moduleName.startsWith(clearedTsPath)) {
      const pathMapping = tsPaths[tsPath];
      unpathedImport = moduleName.replace(clearedTsPath, pathMapping);
    } else if (tsPath === moduleName) {
      unpathedImport = tsPaths[tsPath];
    }

    if (unpathedImport) {
      const resolvedImport = resolveFn(unpathedImport);

      if (
        !resolvedImport.resolvedModule ||
        resolvedImport.resolvedModule.isExternalLibraryImport === true
      ) {
        throw new Error(
          `unable to resolve import ${moduleName} in ${filename}`,
        );
      }
      return toFsPath(
        fixPathSeparators(resolvedImport.resolvedModule.resolvedFileName),
      );
    }
  }

  return undefined;
}

function clearTsPath(tsPath: string) {
  const [isWildcard, clearedPath] = tsPath.endsWith('/*')
    ? [true, tsPath.slice(0, -2)]
    : [false, tsPath];
  return { isWildcard, clearedTsPath: clearedPath };
}

function fixPathSeparators(path: string): FsPath {
  const fs = getFs();

  if (fs.pathSeparator !== '/') {
    return toFsPath(path.replace(/\//g, fs.pathSeparator));
  }

  return toFsPath(path);
}

export default traverseFilesystem;
