import getFs from '../1-fs/getFs';
import * as ts from 'typescript';
import { FsPath, assertFsPath } from './fs-path';

/**
 * Retrieves the paths variable from a tsconfig and also traverses through
 * potential parent configs.
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
    for (const [key, value] of Object.entries(newPaths)) {
      paths[key] = assertFsPath(fs.join(currentTsConfigDir, value[0]));
    }

    if (configContent.config.extends) {
      currentTsConfigPath = assertFsPath(
        fs.join(fs.getParent(currentTsConfigPath), configContent.config.extends)
      );
    } else {
      break;
    }
  }

  return { paths, rootDir: currentTsConfigDir };
};
