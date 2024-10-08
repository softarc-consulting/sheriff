import { TagConfig } from '../../config/tag-config';
import { FsPath } from '../../file-info/fs-path';
import {
  createModulePathPatternsTree,
  ModulePathPatternsTree,
} from './create-module-path-patterns-tree';
import getFs from '../../fs/getFs';
import { FOLDER_CHARACTERS_REGEX_STRING } from '../../tags/calc-tags-for-module';
import { flattenTagging } from './flatten-tagging';

/**
 * The current criterion for finding modules is via
 * the SheriffConfig's property `modules`.
 *
 * We will traverse the filesystem and match directories
 * against the patterns.
 */
export function findModulePathsWithoutBarrel(
  moduleConfig: TagConfig,
  rootDir: FsPath,
  barrelFileName: string
): Set<FsPath> {
  const paths = flattenTagging(moduleConfig, '');
  const modulePathsPatternTree = createModulePathPatternsTree(paths);
  const modules = traverseAndMatch(modulePathsPatternTree, rootDir, barrelFileName);
  return new Set<FsPath>(modules);
}

/**
 * Recursively traverse the filesystem and match directories against patterns.
 */
function traverseAndMatch(
  groupedPatterns: ModulePathPatternsTree,
  basePath: FsPath,
  barrelFileName: string
): FsPath[] {
  const fs = getFs();
  const matchedDirectories: FsPath[] = [];

  // Check if the current directory should be matched
  if ('' in groupedPatterns) {
    addAsModuleIfWithoutBarrel(matchedDirectories, basePath, barrelFileName);
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
        addAsModuleIfWithoutBarrel(matchedDirectories, subDirectory, barrelFileName);
      } else {
        const newDirectories = traverseAndMatch(groupedPatterns[matchingPattern], subDirectory, barrelFileName);
        for (const newDirectory of newDirectories) {
          addAsModuleIfWithoutBarrel(matchedDirectories, newDirectory, barrelFileName);
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
  barrelFileName: string,
) {
  const fs = getFs();

  if (fs.exists(fs.join(directory, barrelFileName))) {
    return;
  }

  modulePaths.push(directory);
}
