import getFs from '../fs/getFs';
import * as ts from 'typescript';
import { FsPath, toFsPath } from './fs-path';

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
  tsConfigPath: FsPath
): { paths: Record<string, FsPath>; rootDir: FsPath } => {
  const fs = getFs();
  let currentTsConfigPath = tsConfigPath;
  let currentTsConfigDir = fs.getParent(currentTsConfigPath);
  const paths: Record<string, FsPath> = {};

  while (currentTsConfigPath) {
    const configRawContent = fs.readFile(currentTsConfigPath);
    const configContent = ts.readConfigFile(
      currentTsConfigPath,
      () => configRawContent
    );

    const newPaths: Record<string, string[]> =
      configContent.config.compilerOptions.paths || {};
    currentTsConfigDir = fs.getParent(currentTsConfigPath);
    for (const [key, [value]] of Object.entries(newPaths)) {
      const valueForFsPath = value.endsWith('/*') ? value.slice(0, -2) : value;
      paths[key] = toFsPath(fs.join(currentTsConfigDir, valueForFsPath));
    }

    if (configContent.config.extends) {
      currentTsConfigPath = toFsPath(
        fs.join(fs.getParent(currentTsConfigPath), configContent.config.extends)
      );
    } else {
      break;
    }
  }

  return { paths, rootDir: currentTsConfigDir };
};
