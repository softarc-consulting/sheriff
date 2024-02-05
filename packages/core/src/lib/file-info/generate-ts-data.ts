import getFs, { isFsVirtualised } from '../fs/getFs';
import * as ts from 'typescript';
import TsData from './ts-data';
import { getTsPathsAndRootDir } from './get-ts-paths-and-root-dir';
import { FsPath, toFsPath } from './fs-path';

export const generateTsData = (tsConfigPath: FsPath): TsData => {
  const { paths, rootDir } = getTsPathsAndRootDir(tsConfigPath);

  const fs = getFs();
  const cwd = fs.getParent(tsConfigPath);
  const configRawContent = getFs().readFile(tsConfigPath);
  const configContent = ts.readConfigFile(tsConfigPath, () => configRawContent);

  const configObject = ts.parseJsonConfigFileContent(
    configContent,
    ts.sys,
    cwd,
  );

  const sys = getTsSys();

  return { paths, configObject, cwd, sys, rootDir };
};

function getTsSys(): ts.System {
  if (isFsVirtualised()) {
    const fs = getFs();
    return {
      fileExists: (path: string) => fs.exists(path),
      readFile(path: string): string | undefined {
        return fs.readFile(toFsPath(path));
      },
    } as typeof ts.sys;
  } else {
    return ts.sys;
  }
}
