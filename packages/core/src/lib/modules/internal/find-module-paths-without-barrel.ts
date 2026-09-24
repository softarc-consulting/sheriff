import { ModuleConfig } from '../../config/module-config';
import { FsPath } from '../../file-info/fs-path';
import {
  createModulePathPatternsTree,
  ModulePathPatternsTree,
} from './create-module-path-patterns-tree';
import * as path from 'path';
import getFs from '../../fs/getFs';
import { FOLDER_CHARACTERS_REGEX_STRING } from '../../tags/calc-tags-for-module';
import { flattenModules } from './flatten-modules';
import { GlobMatcher } from '../../util/match-glob';

/**
 * The current criterion for finding modules is via
 * the SheriffConfig's property `modules`.
 *
 * We will traverse the filesystem and match directories
 * against the patterns.
 */
export function findModulePathsWithoutBarrel(
  moduleConfig: ModuleConfig,
  rootDir: FsPath,
  isBarrelMatch: GlobMatcher,
): Set<FsPath> {
  const paths = flattenModules(moduleConfig, '');
  const modulePathsPatternTree = createModulePathPatternsTree(paths);
  const modules = traverseAndMatch(
    modulePathsPatternTree,
    rootDir,
    isBarrelMatch,
  );
  return new Set<FsPath>(modules);
}

/**
 * Recursively traverse the filesystem and match directories against patterns.
 */
function traverseAndMatch(
  groupedPatterns: ModulePathPatternsTree,
  basePath: FsPath,
  isBarrelMatch: GlobMatcher,
): FsPath[] {
  const fs = getFs();
  const matchedDirectories: FsPath[] = [];

  // Check if the current directory should be matched
  if ('' in groupedPatterns) {
    addAsModuleIfWithoutBarrel(matchedDirectories, basePath, isBarrelMatch);
  }

  const subDirectories = fs.readDirectory(basePath, 'directory');
  for (const subDirectory of subDirectories) {
    const currentSegment = fs.relativeTo(basePath, subDirectory);

    const patterns = Object.keys(groupedPatterns);
    const matchingPattern = patterns.find((pattern) =>
      matchPattern(pattern, currentSegment),
    );

    if (matchingPattern) {
      if (Object.keys(groupedPatterns[matchingPattern]).length === 0) {
        addAsModuleIfWithoutBarrel(
          matchedDirectories,
          subDirectory,
          isBarrelMatch,
        );
      } else {
        const newDirectories = traverseAndMatch(
          groupedPatterns[matchingPattern],
          subDirectory,
          isBarrelMatch,
        );
        for (const newDirectory of newDirectories) {
          addAsModuleIfWithoutBarrel(
            matchedDirectories,
            newDirectory,
            isBarrelMatch,
          );
        }
      }
    }
  }

  return matchedDirectories;
}

/**
 * Matches a given directory path against a pattern, allowing wildcards.
 */
function matchPattern(pattern: string, pathSegment: string): boolean {
  if (pattern === '*' || pattern === pathSegment) {
    return true;
  }

  if (pattern.includes('*')) {
    const regexPattern = pattern.replace(
      /\*/g,
      `${FOLDER_CHARACTERS_REGEX_STRING}*`,
    );
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathSegment);
  }

  return false;
}

function addAsModuleIfWithoutBarrel(
  modulePaths: FsPath[],
  directory: FsPath,
  isBarrelMatch: GlobMatcher,
) {
  if (hasBarrelFile(directory, isBarrelMatch)) {
    return;
  }

  modulePaths.push(directory);
}

function hasBarrelFile(directory: FsPath, isBarrelMatch: GlobMatcher): boolean {
  const fs = getFs();
  const children = fs.readDirectory(directory);
  return children.some((child) => {
    if (fs.isFile(child)) {
      return isBarrelMatch(path.basename(child));
    }
    return false;
  });
}
