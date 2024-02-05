import getFs from '../fs/getFs';
import * as ts from 'typescript';
import { FsPath, toFsPath } from './fs-path';
import { TsConfig } from './ts-config';

/**
 * Retrieves the paths variable from a tsconfig and also traverses through
 * potential parent configs.
 *
 * If there are wilcards, the wildcard will be removed from their path value.
 * This is necessary to keep up the FsPath type
 *
 * @param tsConfigPath path of the tsconfig.json
 */
export const getTsPathsAndRootDir = (
  tsConfigPath: FsPath,
): { paths: Record<string, FsPath>; rootDir: FsPath } => {
  const fs = getFs();
  let currentTsConfigPath = tsConfigPath;
  let currentTsConfigDir = fs.getParent(currentTsConfigPath);
  const paths: Record<string, FsPath> = {};

  while (currentTsConfigPath) {
    const configRawContent = fs.readFile(currentTsConfigPath);
    const configContent = ts.readConfigFile(
      currentTsConfigPath,
      () => configRawContent,
    );

    const config = configContent.config as TsConfig;

    const newPaths: Record<string, string[]> =
      config.compilerOptions.paths ?? {};
    currentTsConfigDir = fs.getParent(currentTsConfigPath);
    for (const [key, [value]] of Object.entries(newPaths)) {
      const valueForFsPath = value.endsWith('/*') ? value.slice(0, -2) : value;
      const potentialFilename = fs.join(currentTsConfigDir, valueForFsPath);
      if (fs.exists(potentialFilename)) {
        paths[key] = toFsPath(potentialFilename);
      } else if (
        !potentialFilename.endsWith('.ts') &&
        fs.exists(potentialFilename + '.ts')
      ) {
        paths[key] = toFsPath(potentialFilename + '.ts');
      } else {
        throw new Error(
          `invalid path mapping detected: ${key}: ${value}. Please verify that the path exists.`,
        );
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

  return { paths, rootDir: currentTsConfigDir };
};
