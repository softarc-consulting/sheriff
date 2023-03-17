import { findConfig } from './find-config';
import { FsPath } from './fs-path';

export const findProjectRoot = (pathInProject: FsPath) =>
  findConfig(pathInProject);
