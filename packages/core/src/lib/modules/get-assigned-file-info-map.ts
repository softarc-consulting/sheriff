import { Module } from './module';
import { FsPath } from '../file-info/fs-path';
import { AssignedFileInfo } from './assigned-file.info';

export const getAssignedFileInfoMap = (moduleInfos: Module[]) => {
  const assignedFileInfoMap = new Map<FsPath, AssignedFileInfo>();
  for (const moduleInfo of moduleInfos) {
    for (const assignedFileInfo of moduleInfo.assignedFileInfos) {
      assignedFileInfoMap.set(assignedFileInfo.path, assignedFileInfo);
    }
  }

  return assignedFileInfoMap;
};
