import { ModuleInfo, ROOT_MODULE } from './module-info';
import FileInfo from '../file-info/file-info';
import traverseFileInfo from '../file-info/traverse-file-info';
import throwIfNull from '../util/throw-if-null';

const findClosestModule = (path: string, moduleInfos: ModuleInfo[]) => {
  return throwIfNull(
    moduleInfos
      .filter((moduleInfo) => path.startsWith(moduleInfo.directory))
      .sort((p1, p2) => (p1.directory.length > p2.directory.length ? -1 : 1))
      .at(0),
    `findClosestModule for ${path}`
  );
};

export const createModuleInfos = (
  fileInfo: FileInfo,
  existingModules: string[]
): ModuleInfo[] => {
  const modules = existingModules.concat(ROOT_MODULE);
  const moduleInfos = modules.map((module) => new ModuleInfo(module));
  const moduleInfoMap = new Map<string, ModuleInfo>(
    moduleInfos.map((moduleInfo) => [moduleInfo.directory, moduleInfo])
  );

  for (const element of traverseFileInfo(fileInfo)) {
    const fi = element.fileInfo;
    if (!isFileInfoAModule(fi, existingModules)) {
      findClosestModule(fi.path, moduleInfos).assignFileInfo(fi);
    }
  }

  return Array.from(moduleInfoMap.values());
};

const isFileInfoAModule = ({ path }: FileInfo, existingModules: string[]) =>
  existingModules.includes(path);
