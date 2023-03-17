import { findConfig } from './find-config';

export const findProjectRoot = (pathInProject: string) =>
  findConfig(pathInProject);
