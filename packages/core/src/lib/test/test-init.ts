import { FileTree } from './project-configurator';
import { createProject } from './project-creator';
import { init, InitOptions, ProjectInfo } from '../main/init';
import { toFsPath } from '../file-info/fs-path';

export function testInit(filename: string, fileTree: FileTree): ProjectInfo;
export function testInit(
  filename: string,
  options: InitOptions,
  fileTree: FileTree,
): ProjectInfo;

export function testInit(
  filename: string,
  optionsOrFileTree: InitOptions | FileTree,
  fileTree?: FileTree,
): ProjectInfo {
  if (fileTree) {
    createProject(fileTree);
    return init(toFsPath(`/project/${filename}`), optionsOrFileTree);
  } else {
    createProject(optionsOrFileTree as FileTree);
    return init(toFsPath(`/project/${filename}`));
  }
}
