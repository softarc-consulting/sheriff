import { FsPath } from '../file-info/fs-path';
import * as fs from 'fs';
import * as ts from 'typescript';
import { SheriffConfig } from '../config/config';

export const parseConfig = (configPath: FsPath): SheriffConfig => {
  const tsCode = fs.readFileSync(configPath, {
    encoding: 'utf-8',
  });

  const { outputText } = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.NodeNext },
  });
  const result = eval(outputText);

  return result as unknown as SheriffConfig;
};
