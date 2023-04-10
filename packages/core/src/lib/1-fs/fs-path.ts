import getFs from './getFs';
import { assertUnreachableCode } from '../util/assert-unreachable-code';
import { checkForPotentialFsPath, PotentialFsPath } from './potential-fs-path';

/**
 * Domain Type representing an absolute and existing file
 * It is independent of the OS and follows the Linux style.
 *
 * The window path of c:\app\src\main.ts, would have
 * the value /c/app/src/main.ts
 */
export type FsPath = PotentialFsPath & { type: 'FsPath' };

/**
 * Main Check function which is used by `isFsPath` and `toFsPath`.
 * Uses a cache for valid paths.
 */
const fsPathCache = new Set<string>();
const checkPath = (
  path: string
): 'valid' | 'invalid characters' | 'not absolute' | 'not existing' => {
  if (fsPathCache.has(path)) {
    return 'valid';
  }

  const potentialFsPathCheck = checkForPotentialFsPath(path);
  if (potentialFsPathCheck !== 'valid') {
    return potentialFsPathCheck;
  }

  const fs = getFs();
  if (!fs.exists(path as PotentialFsPath)) {
    return 'not existing';
  }

  fsPathCache.add(path);
  return 'valid';
};

/**
 * Type Guard which checks if @param path is a valid FsPath
 * @param path
 */
export const isFsPath = (path: string): path is FsPath => {
  return checkPath(path) === 'valid';
};

/**
 * Maps a path to an FsPath. Throws an error if the path does not exist or is
 * relative.
 */
export function assertFsPath(path: string): asserts path is FsPath {
  const fsPathCheck = checkPath(path);
  switch (fsPathCheck) {
    case 'invalid characters':
      throw new Error(
        `FsPath: ${path} has invalid characters (possible Windows path)`
      );
    case 'not absolute':
      throw new Error(`FsPath: ${path} is not absolute`);
    case 'not existing':
      throw new Error(`FsPath: ${path} does not exist`);
    case 'valid':
      break;
    default:
      assertUnreachableCode(fsPathCheck);
  }
}

/**
 * Transforms any OS-specific path into an FsPath
 * or throws an error, if the path does not exist
 * or is relative.
 */
export function toFsPath(path: string): FsPath {
  const fsPath: string = path
    .replace(/^([a-zA-Z]):\\/, `/${path[0]}/`)
    .replace(/\\/g, '/');
  assertFsPath(fsPath);
  return fsPath;
}
