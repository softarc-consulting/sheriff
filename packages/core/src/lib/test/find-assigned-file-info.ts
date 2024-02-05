import { FileInfo } from '../modules/file.info';
import { Module } from '../modules/module';

export const findAssignedFileInfo = (
  moduleInfos: Module[],
  path: string
): FileInfo => {
  for (const moduleInfo of moduleInfos) {
    for (const assignedFileInfo of moduleInfo.fileInfos) {
      if (assignedFileInfo.path === path) {
        return assignedFileInfo;
      }
    }
  }

  throw new Error(`cannot find AssignedFileInfo of ${path}`);
};
