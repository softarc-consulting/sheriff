import { Module } from './module';
import { FsPath } from '../file-info/fs-path';
import { AssignedFileInfo } from './assigned-file.info';
import { logger } from '../log';

const log = logger('core.modules.assigned-file-info-map');

export const getAssignedFileInfoMap = (moduleInfos: Module[]) => {
  const assignedFileInfoMap = new Map<FsPath, AssignedFileInfo>();
  for (const moduleInfo of moduleInfos) {
    for (const assignedFileInfo of moduleInfo.assignedFileInfos) {
      assignedFileInfoMap.set(assignedFileInfo.path, assignedFileInfo);
    }
  }

  log.info(Array.from(assignedFileInfoMap).join(', '));

  return assignedFileInfoMap;
};
