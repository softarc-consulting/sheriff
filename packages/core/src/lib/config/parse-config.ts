import { FsPath } from '../file-info/fs-path';
import * as ts from 'typescript';
import { SheriffConfig } from './sheriff-config';
import getFs from '../fs/getFs';

export const parseConfig = (configFile: FsPath): SheriffConfig => {
  const tsCode = getFs().readFile(configFile);

  const { outputText } = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.NodeNext },
  });
  return eval(outputText) as SheriffConfig;
};
