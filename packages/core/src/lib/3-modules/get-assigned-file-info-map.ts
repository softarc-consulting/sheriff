import { Module } from './module';
import { FsPath } from '../1-fs/fs-path';
import { AssignedFileInfo } from './assigned-file.info';
import { log } from '../util/log';

export const getAssignedFileInfoMap = (moduleInfos: Module[]) => {
  const assignedFileInfoMap = new Map<FsPath, AssignedFileInfo>();
  for (const moduleInfo of moduleInfos) {
    for (const assignedFileInfo of moduleInfo.assignedFileInfos) {
      assignedFileInfoMap.set(assignedFileInfo.path, assignedFileInfo);
    }
  }

  log('Assigned File Infos Map', Array.from(assignedFileInfoMap).join(', '));

  return assignedFileInfoMap;
};
