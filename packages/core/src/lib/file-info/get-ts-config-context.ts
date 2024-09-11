import getFs from '../fs/getFs';
import * as ts from 'typescript';
import { FsPath, toFsPath } from './fs-path';
import { TsConfig } from './ts-config';
import { InvalidPathError } from '../error/user-error';

export type TsConfigContext = {
  paths: Record<string, FsPath>;
  rootDir: FsPath;
  baseUrl?: FsPath;
};

/**
 * Parses the tsconfig.json file and returns specific information for
 * further processing.
 *
 * Maps paths from the tsconfig.json to `FilePath` where possible.
 * It also traverses through potential parent configs.
 * It also resolves the `baseUrl` - if present - to an `FsPath`.
 *
 * If there are wildcards, the wildcard will be removed from their path value.
 * This is necessary to keep up the FsPath type.
 *
 * It matters, if a `baseUrl` exists or not. It is not by default set to
 * the root directory of the tsconfig.json. That has implications for the
 * TypeScript resolution because static imports only work with a `baseUrl`.
 *
 * @param tsConfigPath path of the tsconfig.json
 */
export function getTsConfigContext(tsConfigPath: FsPath): TsConfigContext {
  const fs = getFs();
  let currentTsConfigPath = tsConfigPath;
  let currentTsConfigDir = fs.getParent(currentTsConfigPath);
  const paths: Record<string, FsPath> = {};
  let baseUrl: FsPath | undefined = undefined;

  while (currentTsConfigPath) {
    const configRawContent = fs.readFile(currentTsConfigPath);
    const configContent = ts.readConfigFile(
      currentTsConfigPath,
      () => configRawContent,
    );

    const config = configContent.config as TsConfig;
    currentTsConfigDir = fs.getParent(currentTsConfigPath);
    if (baseUrl === undefined && config.compilerOptions?.baseUrl) {
      baseUrl = toFsPath(fs.join(currentTsConfigDir, config.compilerOptions.baseUrl))
    }

    const newPaths: Record<string, string[]> =
      config.compilerOptions?.paths ?? {};
    for (const [key, [value]] of Object.entries(newPaths)) {
      const valueForFsPath = value.endsWith('/*') ? value.slice(0, -2) : value;
      const potentialFilename = fs.join(
        currentTsConfigDir,
        config.compilerOptions?.baseUrl ?? './',
        valueForFsPath,
      );
      if (fs.exists(potentialFilename)) {
        paths[key] = toFsPath(potentialFilename);
      } else if (
        !potentialFilename.endsWith('.ts') &&
        fs.exists(potentialFilename + '.ts')
      ) {
        paths[key] = toFsPath(potentialFilename + '.ts');
      } else {
        throw new InvalidPathError(key, value);
      }
    }

    if (config.extends) {
      currentTsConfigPath = toFsPath(
        fs.join(fs.getParent(currentTsConfigPath), config.extends),
      );
    } else {
      break;
    }
  }

  return {
    paths,
    rootDir: currentTsConfigDir,
    baseUrl
  };
}
