import { Module } from './module';
import { UnassignedFileInfo } from '../file-info/unassigned-file-info';
import traverseUnassignedFileInfo from '../file-info/traverse-unassigned-file-info';
import throwIfNull from '../util/throw-if-null';
import { FsPath, toFsPath } from '../file-info/fs-path';
import { FileInfo } from './file.info';
import { ModulePathMap } from './find-module-paths';
import {
  entries,
  fromEntries,
  keys,
  values,
} from '../util/typed-object-functions';

interface CreateModulesContext {
  entryFileInfo: UnassignedFileInfo;
  rootDir: FsPath;
  barrelFile: string;
}

export function createModules(
  modulePathMap: ModulePathMap,
  fileInfoMap: Map<FsPath, FileInfo>,
  getFileInfo: (path: FsPath) => FileInfo,
  { entryFileInfo, rootDir, barrelFile }: CreateModulesContext,
): Module[] {
  const moduleMap = fromEntries(
    entries(modulePathMap).map(([path, hasBarrel]) => [
      path,
      new Module(
        toFsPath(path),
        fileInfoMap,
        getFileInfo,
        false,
        hasBarrel,
        barrelFile,
      ),
    ]),
  );
  // add root module
  moduleMap[rootDir] = new Module(
    rootDir,
    fileInfoMap,
    getFileInfo,
    true,
    false,
    barrelFile,
  );

  const modulePaths = keys(moduleMap);

  for (const { fileInfo } of traverseUnassignedFileInfo(entryFileInfo)) {
    const modulePath = findClosestModulePath(fileInfo.path, modulePaths);
    moduleMap[modulePath].addFileInfo(fileInfo);
  }

  return values(moduleMap);
}

function findClosestModulePath(path: string, modulePaths: FsPath[]) {
  return throwIfNull(
    modulePaths
      .filter((modulePath) => path.startsWith(modulePath))
      .sort((p1, p2) => (p1.length > p2.length ? -1 : 1))
      .at(0),
    `findClosestModule for ${path}`,
  );
}
