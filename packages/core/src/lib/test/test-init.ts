import { FileTree } from './project-configurator';
import getFs, { useVirtualFs } from '../fs/getFs';
import { ProjectCreator } from './project-creator';
import { init, InitOptions, ProjectInfo } from '../main/init';
import { toFsPath } from '../file-info/fs-path';

export function testInit(filename: string, fileTree: FileTree): ProjectInfo;
export function testInit(
  filename: string,
  options: InitOptions,
  fileTree: FileTree
): ProjectInfo;

export function testInit(
  filename: string,
  optionsOrFileTree: InitOptions | FileTree,
  fileTree?: FileTree
): ProjectInfo {
  useVirtualFs();
  getFs().reset();

  if (fileTree) {
    new ProjectCreator().create(fileTree, '/project');
    return init(toFsPath(`/project/${filename}`), optionsOrFileTree);
  } else {
    new ProjectCreator().create(optionsOrFileTree as FileTree, '/project');
    return init(toFsPath(`/project/${filename}`));
  }
}
