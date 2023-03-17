import { ModuleInfo } from './module-info';
import { FsPath } from '../file-info/fs-path';
import { AssignedFileInfo } from './assigned-file.info';

export const getAssignedFileInfoMap = (moduleInfos: ModuleInfo[]) => {
  const assignedFileInfoMap = new Map<FsPath, AssignedFileInfo>();
  for (const moduleInfo of moduleInfos) {
    for (const assignedFileInfo of moduleInfo.assignedFileInfos) {
      assignedFileInfoMap.set(assignedFileInfo.path, assignedFileInfo);
    }
  }

  return assignedFileInfoMap;
};
