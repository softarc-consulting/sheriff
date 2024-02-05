import { Module } from './module';
import { FsPath } from '../file-info/fs-path';
import { FileInfo } from './file.info';
import { logger } from '../log';

const log = logger('core.modules.assigned-file-info-map');

export const fillFileInfoMap = (fileInfoMap: Map<FsPath, FileInfo>, moduleInfos: Module[]): void => {
  for (const moduleInfo of moduleInfos) {
    for (const assignedFileInfo of moduleInfo.fileInfos) {
      fileInfoMap.set(assignedFileInfo.path, assignedFileInfo);
    }
  }

  log.info(Array.from(fileInfoMap).join(', '));
};
