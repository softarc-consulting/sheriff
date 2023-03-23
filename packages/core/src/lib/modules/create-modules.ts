import { Module } from './module';
import FileInfo from '../file-info/file-info';
import traverseFileInfo from '../file-info/traverse-file-info';
import throwIfNull from '../util/throw-if-null';
import { FsPath } from '../file-info/fs-path';
import { log } from '../util/log';
import { formatModules } from './format-modules';
import get from '../util/get';

const findClosestModule = (path: string, moduleInfos: Module[]) => {
  return throwIfNull(
    moduleInfos
      .filter((moduleInfo) => path.startsWith(moduleInfo.directory))
      .sort((p1, p2) => (p1.directory.length > p2.directory.length ? -1 : 1))
      .at(0),
    `findClosestModule for ${path}`
  );
};

export const createModules = (
  fileInfo: FileInfo,
  existingModules: Set<FsPath>,
  rootDir: FsPath
): Module[] => {
  const modules = [...Array.from(existingModules), rootDir];
  const moduleInfos = modules.map((module) => new Module(module));
  const moduleInfoMapPerIndexTs = new Map<string, Module>(
    moduleInfos.map((moduleInfo) => [moduleInfo.path, moduleInfo])
  );
  const moduleInfoMap = new Map<string, Module>(
    moduleInfos.map((moduleInfo) => [moduleInfo.directory, moduleInfo])
  );

  for (const element of traverseFileInfo(fileInfo)) {
    const fi = element.fileInfo;
    if (isFileInfoAModule(fi, existingModules)) {
      get(moduleInfoMapPerIndexTs, fi.path).assignFileInfo(fi);
    } else {
      findClosestModule(fi.path, moduleInfos).assignFileInfo(fi);
    }
  }

  const foundModules = Array.from(moduleInfoMap.values());
  log('Modules', formatModules(foundModules));
  return foundModules;
};

const isFileInfoAModule = ({ path }: FileInfo, existingModules: Set<string>) =>
  existingModules.has(path);
