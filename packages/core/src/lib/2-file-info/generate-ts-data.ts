import getFs from '../1-fs/getFs';
import * as ts from 'typescript';
import TsData from './ts-data';
import { getTsPathsAndRootDir } from './get-ts-paths-and-root-dir';
import { FsPath } from '../1-fs/fs-path';

export const generateTsData = (tsConfigPath: FsPath): TsData => {
  const { paths, rootDir } = getTsPathsAndRootDir(tsConfigPath);

  const fs = getFs();
  const cwd = fs.getParent(tsConfigPath);
  const configRawContent = getFs().readFile(tsConfigPath);
  const configContent = ts.readConfigFile(tsConfigPath, () => configRawContent);

  const configObject = ts.parseJsonConfigFileContent(
    configContent,
    ts.sys,
    cwd
  );
  const fakeTsSys = {
    fileExists: (path: string) => fs.exists(path),
  } as typeof ts.sys;

  return { paths, configObject, cwd, sys: fakeTsSys, rootDir };
};
