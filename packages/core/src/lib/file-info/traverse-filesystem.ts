import FileInfo from './file-info';
import getFs from '../fs/getFs';
import * as ts from 'typescript';
import TsData from './ts-data';

// https://stackoverflow.com/questions/71815527/typescript-compiler-apihow-to-get-absolute-path-to-source-file-of-import-module
/**
 * This function generates the FileInfo tree.
 * It starts with the entry TypeScript file (in Angular main.ts) and follows
 * all the imports.
 *
 * It does not follow an import when it is an external library, i.e. comes from
 * node_modules or is already part of the tree.
 *
 * To improve the testability, we use abstraction whenever an access to the
 * filesystem happens. In case the abstraction does not emulate the original's
 * behaviour, "strange bugs" might occur. Look out for them.
 *
 * @param filePath:
 * @param fileInfoDict
 * @param paths
 * @param configObject
 * @param cwd
 * @param sys
 */
const traverseFilesystem = async (
  filePath: string,
  fileInfoDict: Map<string, FileInfo>,
  { paths, configObject, cwd, sys }: TsData
): Promise<FileInfo> => {
  const fileInfo: FileInfo = { path: filePath, imports: [] };
  fileInfoDict.set(filePath, fileInfo);

  const fileContent = await getFs().readFile(filePath);
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
      filePath,
      configObject.options,
      sys
    );

    let importPath = '';

    if (resolvedImport.resolvedModule) {
      const { resolvedFileName } = resolvedImport.resolvedModule;
      if (!resolvedImport.resolvedModule.isExternalLibraryImport) {
        importPath = resolvedFileName;
      }
    } else if (fileName in paths) {
      importPath = paths[fileName][0];
    } else {
      throw new Error(`cannot find ${fileName}`);
    }

    if (importPath) {
      const existing = fileInfoDict.get(importPath);
      if (existing) {
        fileInfo.imports.push(existing);
      } else {
        fileInfo.imports.push(
          await traverseFilesystem(importPath, fileInfoDict, {
            paths,
            configObject,
            cwd,
            sys,
          })
        );
      }
    }
  }

  return fileInfo;
};

export default traverseFilesystem;
