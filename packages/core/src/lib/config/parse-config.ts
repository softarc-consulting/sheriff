import { FsPath } from '../file-info/fs-path';
import * as ts from 'typescript';
import { UserSheriffConfig } from './user-sheriff-config';
import getFs from '../fs/getFs';
import { SheriffConfig } from './sheriff-config';
import { MissingTaggingWithoutAutoTagging } from '../error/user-error';
import { defaultConfig } from './default-config';

export const parseConfig = (configFile: FsPath): SheriffConfig => {
  const tsCode = getFs().readFile(configFile);

  const { outputText } = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.NodeNext },
  });

  const userSheriffConfig = eval(outputText) as UserSheriffConfig;
  if (userSheriffConfig.autoTagging === false && !userSheriffConfig.tagging) {
    throw new MissingTaggingWithoutAutoTagging();
  }

  return { ...defaultConfig, ...userSheriffConfig };
};
