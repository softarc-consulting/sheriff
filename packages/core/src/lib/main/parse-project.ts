import { FsPath } from '../file-info/fs-path';
import { FileInfo } from '../modules/file.info';
import { generateUnassignedFileInfo } from '../file-info/generate-unassigned-file-info';
import { getProjectDirsFromFileInfo } from '../modules/get-project-dirs-from-file-info';
import { findModulePaths } from '../modules/find-module-paths';
import { createModules } from '../modules/create-modules';
import { fillFileInfoMap } from '../modules/fill-file-info-map';
import throwIfNull from '../util/throw-if-null';
import { TsData } from '../file-info/ts-data';

export type ParsedResult = {
  fileInfo: FileInfo;
  modulePaths: Set<FsPath>;
  rootDir: FsPath;
  getFileInfo: (path: FsPath) => FileInfo;
};

export const parseProject = (
  entryFile: FsPath,
  traverse: boolean,
  tsData: TsData,
  fileContent?: string,
): ParsedResult => {
  const unassignedFileInfo = generateUnassignedFileInfo(
    entryFile,
    !traverse,
    tsData,
    fileContent,
  );
  const rootDir = tsData.rootDir;

  const projectDirs = getProjectDirsFromFileInfo(unassignedFileInfo, rootDir);

  const fileInfoMap: Map<FsPath, FileInfo> = new Map();
  const getFileInfo = (path: FsPath) =>
    throwIfNull(fileInfoMap.get(path), `cannot find FileInfo for ${path}`);

  const modulePaths = findModulePaths(projectDirs);
  const modules = createModules(
    unassignedFileInfo,
    modulePaths,
    rootDir,
    fileInfoMap,
    getFileInfo,
  );
  fillFileInfoMap(fileInfoMap, modules);

  const fileInfo = getFileInfo(unassignedFileInfo.path);

  return {
    fileInfo,
    rootDir,
    getFileInfo,
    modulePaths,
  };
};
