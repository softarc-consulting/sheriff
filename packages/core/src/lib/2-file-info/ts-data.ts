import * as ts from 'typescript';
import { FsPath } from './fs-path';

/**
 * Contains data needed by `traverseFilesystem`.
 */
type TsData = {
  configObject: ReturnType<typeof ts.parseJsonConfigFileContent>;
  paths: Record<string, FsPath>;
  cwd: string;
  sys: typeof ts.sys;
  rootDir: FsPath;
};

export default TsData;
