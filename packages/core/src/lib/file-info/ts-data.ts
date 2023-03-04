import * as ts from 'typescript';

/**
 * Contains data needed by `traverseFilesystem`.
 */
type TsData = {
  configObject: ReturnType<typeof ts.parseJsonConfigFileContent>;
  paths: Record<string, string[]>;
  cwd: string;
  sys: typeof ts.sys;
};

export default TsData;
