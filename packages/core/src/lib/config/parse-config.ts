import { FsPath } from '../file-info/fs-path';
import * as fs from 'fs';
import * as ts from 'typescript';
import { SheriffConfig } from './config';

export const parseConfig = (configFile: FsPath): SheriffConfig => {
  const tsCode = fs.readFileSync(configFile, {
    encoding: 'utf-8',
  });

  const { outputText } = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.NodeNext },
  });
  return eval(outputText) as SheriffConfig;
};
