import { FsPath } from '../file-info/fs-path';
import * as ts from 'typescript';
import { UserSheriffConfig } from './user-sheriff-config';
import getFs from '../fs/getFs';
import { Configuration } from './configuration';
import {
  CollidingEncapsulationSettings,
  MissingModulesWithoutAutoTaggingError,
  TaggingAndModulesError,
} from '../error/user-error';
import { defaultConfig } from './default-config';

export const parseConfig = (configFile: FsPath): Configuration => {
  const tsCode = getFs().readFile(configFile);

  const { outputText } = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.NodeNext },
  });

  const userSheriffConfig = eval(outputText) as UserSheriffConfig;

  if (userSheriffConfig.tagging && userSheriffConfig.modules) {
    throw new TaggingAndModulesError();
  }
  if (userSheriffConfig.tagging) {
    userSheriffConfig.modules = userSheriffConfig.tagging;
  }

  if (userSheriffConfig.autoTagging === false && !userSheriffConfig.modules) {
    throw new MissingModulesWithoutAutoTaggingError();
  }

  if (
    userSheriffConfig.encapsulationPattern !== undefined &&
    userSheriffConfig.encapsulatedFolderNameForBarrelLess !== undefined
  ) {
    throw new CollidingEncapsulationSettings();
  }

  if (userSheriffConfig.encapsulatedFolderNameForBarrelLess) {
    userSheriffConfig.encapsulationPattern =
      userSheriffConfig.encapsulatedFolderNameForBarrelLess;
  }

  const { tagging, encapsulatedFolderNameForBarrelLess, ...rest } =
    userSheriffConfig;
  return { ...defaultConfig, ...rest };
};
