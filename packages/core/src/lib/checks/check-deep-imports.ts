import { Module } from '../3-modules/module';
import { AssignedFileInfo } from '../3-modules/assigned-file.info';
import throwIfNull from '../util/throw-if-null';

export type DeepImport = {
  file: AssignedFileInfo;
  deepImport: AssignedFileInfo;
};

export const checkDeepImports = (
  moduleInfos: Module[]
): DeepImport | undefined => {
  const assignedFileInfoMap = new Map<string, AssignedFileInfo>();
  const moduleInfoMap = new Map<string, Module>(
    moduleInfos.map((moduleInfo) => [moduleInfo.path, moduleInfo])
  );

  for (const moduleInfo of moduleInfos) {
    for (const assignedFileInfo of moduleInfo.assignedFileInfos) {
      assignedFileInfoMap.set(assignedFileInfo.path, assignedFileInfo);
    }
  }

  for (const [, assignedFileInfo] of assignedFileInfoMap) {
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
