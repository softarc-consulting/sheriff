import { Module } from './module';
import UnassignedFileInfo from '../file-info/unassigned-file-info';
import traverseUnassignedFileInfo from '../file-info/traverse-unassigned-file-info';
import throwIfNull from '../util/throw-if-null';
import { FsPath } from '../file-info/fs-path';
import { formatModules } from './format-modules';
import get from '../util/get';
import { logger } from '../log';
import { FileInfo } from "./file.info";

const log = logger('core.modules.create');

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
  fileInfo: UnassignedFileInfo,
  existingModules: Set<FsPath>,
  rootDir: FsPath,
  fileInfoMap: Map<FsPath, FileInfo>,
  getFileInfo: (path: FsPath) => FileInfo
): Module[] => {
  const modules = [...Array.from(existingModules), rootDir];
  const moduleInfos = modules.map((module) => new Module(module, fileInfoMap, getFileInfo));
  const moduleInfoMapPerIndexTs = new Map<string, Module>(
    moduleInfos.map((moduleInfo) => [moduleInfo.path, moduleInfo])
  );
  const moduleInfoMap = new Map<string, Module>(
    moduleInfos.map((moduleInfo) => [moduleInfo.directory, moduleInfo])
  );

  for (const element of traverseUnassignedFileInfo(fileInfo)) {
    const fi = element.fileInfo;
    if (isFileInfoAModule(fi, existingModules)) {
      get(moduleInfoMapPerIndexTs, fi.path).addFileInfo(fi);
    } else {
      findClosestModule(fi.path, moduleInfos).addFileInfo(fi);
    }
  }

  const foundModules = Array.from(moduleInfoMap.values());
  log.info(formatModules(foundModules));
  return foundModules;
};

const isFileInfoAModule = ({ path }: UnassignedFileInfo, existingModules: Set<string>) =>
  existingModules.has(path);
