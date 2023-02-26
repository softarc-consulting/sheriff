import * as ts from "typescript";

type TsData = {
  configObject: ReturnType<typeof ts.parseJsonConfigFileContent>;
  paths: Record<string, string[]>;
  cwd: string;
  sys: typeof ts.sys;
};

export default TsData;
