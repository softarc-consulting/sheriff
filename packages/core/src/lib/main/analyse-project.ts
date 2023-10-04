import { FsPath } from '../file-info/fs-path';
import { AssignedFileInfo } from '../modules/assigned-file.info';
import { generateFileInfo } from '../file-info/generate-file-info';
import { getProjectDirsFromFileInfo } from '../modules/get-project-dirs-from-file-info';
import { findModulePaths } from '../modules/find-module-paths';
import { createModules } from '../modules/create-modules';
import { getAssignedFileInfoMap } from '../modules/get-assigned-file-info-map';
import throwIfNull from '../util/throw-if-null';
import TsData from '../file-info/ts-data';
import FileInfo from '../file-info/file-info';

export type Analysis = {
  fileInfo: FileInfo;
  modulePaths: Set<FsPath>;
  assignedFileInfoMap: Map<FsPath, AssignedFileInfo>;
  getAfi: (path: FsPath) => AssignedFileInfo;
};

export const analyseProject = (
  entryFile: FsPath,
  traverse: boolean,
  tsData: TsData,
  fileContent?: string
) => {
  const fileInfo = generateFileInfo(entryFile, !traverse, tsData, fileContent);
  const rootDir = tsData.rootDir;

  const projectDirs = getProjectDirsFromFileInfo(fileInfo, rootDir);

  const modulePaths = findModulePaths(projectDirs);
  const modules = createModules(fileInfo, modulePaths, rootDir);

  const assignedFileInfoMap = getAssignedFileInfoMap(modules);

  const getAfi = (path: FsPath) =>
    throwIfNull(
      assignedFileInfoMap.get(path),
      `cannot find AssignedFileInfo for ${path}`
    );

  return { fileInfo, getAfi, assignedFileInfoMap, modulePaths };
};
