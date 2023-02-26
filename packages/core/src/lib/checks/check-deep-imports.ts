import { ModuleInfo } from '../modules/module-info';
import AssignedFileInfo from '../modules/assigned-file.info';
import throwIfNull from '../util/throw-if-null';
import FileInfo from '../file-info/file-info';

export type DeepImport = {
  file: AssignedFileInfo;
  deepImport: AssignedFileInfo;
};

export default (moduleInfos: ModuleInfo[]): DeepImport | undefined => {
  const assignedFileInfoMap = new Map<string, AssignedFileInfo>();
  const moduleInfoMap = new Map<string, ModuleInfo>(
    moduleInfos.map((moduleInfo) => [moduleInfo.path, moduleInfo])
  );

  for (const moduleInfo of moduleInfos) {
    for (const assignedFileInfo of moduleInfo.assignedFileInfos) {
      assignedFileInfoMap.set(assignedFileInfo.path, assignedFileInfo);
    }
  }

  for (let [path, assignedFileInfo] of assignedFileInfoMap) {
    for (const importedFileInfo of assignedFileInfo.imports) {
      if (!moduleInfoMap.has(importedFileInfo.path)) {
        const assignedImportedFileInfo = throwIfNull(
          assignedFileInfoMap.get(importedFileInfo.path),
          `cannot find ${importedFileInfo.path} among the assignedFileInfos`
        );

        if (
          assignedImportedFileInfo.moduleInfo !== assignedFileInfo.moduleInfo
        ) {
          if (!moduleInfoMap.has(assignedImportedFileInfo.path)) {
            return {
              file: assignedFileInfo,
              deepImport: assignedImportedFileInfo,
            };
          }
        }
      }
    }
  }
  return undefined;
};
