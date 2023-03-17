import { AssignedFileInfo } from '../modules/assigned-file.info';
import { ModuleInfo } from '../modules/module-info';

export const findAssignedFileInfo = (
  moduleInfos: ModuleInfo[],
  path: string
): AssignedFileInfo => {
  for (const moduleInfo of moduleInfos) {
    for (const assignedFileInfo of moduleInfo.assignedFileInfos) {
      if (assignedFileInfo.path === path) {
        return assignedFileInfo;
      }
    }
  }

  throw new Error(`cannot find AssignedFileInfo of ${path}`);
};
