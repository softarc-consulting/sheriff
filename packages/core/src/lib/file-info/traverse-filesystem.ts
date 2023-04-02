import FileInfo from './file-info';
import getFs from '../fs/getFs';
import * as ts from 'typescript';
import TsData from './ts-data';
import { FsPath, toFsPath } from './fs-path';

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
 * @param fsPath:
 * @param fileInfoDict
 * @param paths
 * @param configObject
 * @param cwd
 * @param sys
 */
const traverseFilesystem = (
  fsPath: FsPath,
  fileInfoDict: Map<FsPath, FileInfo>,
  { paths, configObject, cwd, sys, rootDir }: TsData,
  runOnce = false
): FileInfo => {
  const fileInfo: FileInfo = new FileInfo(fsPath, []);
  fileInfoDict.set(fsPath, fileInfo);
  const fs = getFs();
  const fileContent = fs.readFile(fsPath);
  const preProcessedFile = ts.preProcessFile(fileContent);

  for (const importedFile of preProcessedFile.importedFiles) {
    const { fileName } = importedFile;

    /**
     * Be aware that `sys` is not the real `ts.sys` but a proxy
     * to fs:fileExists. If you get here an error, you'll have
     * to compare the original `ts.sys` with the current implementation.
     * The hack was done in order to write tests against a virtual filesystem.
     */
    const resolvedImport = ts.resolveModuleName(
      fileName,
      fsPath,
      configObject.options,
      sys
    );

    let importPath: FsPath | undefined;

    if (resolvedImport.resolvedModule) {
      const { resolvedFileName } = resolvedImport.resolvedModule;
      if (!resolvedImport.resolvedModule.isExternalLibraryImport) {
        importPath = fixPathSeparators(resolvedFileName);
        if (!importPath.startsWith(rootDir)) {
          throw new Error(`${importPath} is outside of root ${rootDir}`);
        }
      }
    } else if (fileName in paths) {
      importPath = paths[fileName];
    } else if (fileName.startsWith('.')) {
      // might be an undetected dependency in node_modules
      throw new Error(`cannot find import for ${fileName}`);
    }

    if (importPath) {
      const existing = fileInfoDict.get(importPath);
      if (existing) {
        fileInfo.addImport(existing, fileName);
      } else if (runOnce) {
        fileInfo.addImport(new FileInfo(importPath), fileName);
      } else {
        fileInfo.addImport(
          traverseFilesystem(importPath, fileInfoDict, {
            paths,
            configObject,
            cwd,
            sys,
            rootDir,
          }),
          fileName
        );
      }
    }
  }

  return fileInfo;
};

function fixPathSeparators(path: string): FsPath {
  const fs = getFs();

  if (fs.pathSeparator !== '/') {
    return toFsPath(path.replace(/\//g, fs.pathSeparator));
  }

  return toFsPath(path);
}

export default traverseFilesystem;
