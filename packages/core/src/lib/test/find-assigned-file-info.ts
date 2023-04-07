import { AssignedFileInfo } from '../3-modules/assigned-file.info';
import { Module } from '../3-modules/module';

export const findAssignedFileInfo = (
  moduleInfos: Module[],
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
