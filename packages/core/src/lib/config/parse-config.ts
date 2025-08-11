import { FsPath } from '../file-info/fs-path';
import * as ts from 'typescript';
import { UserSheriffConfig } from './user-sheriff-config';
import getFs from '../fs/getFs';
import { Configuration } from './configuration';
import {
  CollidingEncapsulationSettings,
  CollidingEntrySettings,
  MissingModulesWithoutAutoTaggingError,
  NoEntryPointsFoundError,
  TaggingAndModulesError,
} from '../error/user-error';
import { defaultConfig } from './default-config';
import { isEmptyRecord } from '../util/is-empty-record';

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

  const {
    tagging: _1,
    encapsulatedFolderNameForBarrelLess: _2,
    ...rest
  } = userSheriffConfig;

  if (userSheriffConfig.entryFile && userSheriffConfig.entryPoints) {
    throw new CollidingEntrySettings();
  }

  if (
    userSheriffConfig.entryPoints &&
    isEmptyRecord(userSheriffConfig.entryPoints)
  ) {
    throw new NoEntryPointsFoundError();
  }
  const mergedConfig = { ...defaultConfig, ...rest };

  const ignoreFileExtensions = getIgnoreFileExtensions(
    mergedConfig.ignoreFileExtensions,
  );

  return {
    ...mergedConfig,
    ignoreFileExtensions,
  };
};

function getIgnoreFileExtensions(
  ignoreFileExtensions: string[] | ((defaults: string[]) => string[]),
): string[] {
  const extensions =
    typeof ignoreFileExtensions === 'function'
      ? ignoreFileExtensions(defaultConfig.ignoreFileExtensions)
      : ignoreFileExtensions;
  return Array.from(new Set(extensions.map((ext) => ext.toLowerCase())));
}
