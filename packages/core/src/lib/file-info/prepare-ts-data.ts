import getFs from "../fs/getFs";
import * as ts from "typescript";
import TsData from "./ts-data";

const prepareTsData = async (
  tsConfigPath: string,
  cwd: string
): Promise<TsData> => {
  const configRawContent = await getFs().readFile(tsConfigPath);
  const configContent = ts.readConfigFile(tsConfigPath, () => configRawContent);
  const paths: Record<string, string[]> =
    configContent.config.compilerOptions.paths || {};
  const configObject = ts.parseJsonConfigFileContent(
    configContent,
    ts.sys,
    cwd
  );

  const fs = getFs();
  const fakeTsSys = {
    fileExists: (path: string) => fs.exists(path),
  } as typeof ts.sys;

  return { paths, configObject, cwd, sys: fakeTsSys };
};

export default prepareTsData;
