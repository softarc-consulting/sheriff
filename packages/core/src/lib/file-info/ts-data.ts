import * as ts from 'typescript';
import { FsPath } from './fs-path';

export type TsPaths = Record<string, FsPath>;

/**
 * Contains data needed by `traverseFilesystem`.
 */
type TsData = {
  configObject: ReturnType<typeof ts.parseJsonConfigFileContent>;
  paths: TsPaths;
  cwd: string;
  sys: typeof ts.sys;
  rootDir: FsPath;
};

export default TsData;
