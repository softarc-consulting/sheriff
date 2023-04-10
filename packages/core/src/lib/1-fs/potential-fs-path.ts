import { assertUnreachableCode } from '../util/assert-unreachable-code';

// TODO: Should be able to generate by using only Template Literal Types
export type PotentialFsPath = string & { type: 'PotentialFsPath' };

export const checkForPotentialFsPath = (
  path: string
): 'valid' | 'invalid characters' | 'not absolute' => {
  if (path.includes('\\')) {
    return 'invalid characters';
  }
  if (!path.startsWith('/')) {
    return 'not absolute';
  }

  return 'valid';
};

export const isPotentialFsPath = (path: string): path is PotentialFsPath =>
  checkForPotentialFsPath(path) === 'valid';

export function assertPotentialFsPath(
  path: string
): asserts path is PotentialFsPath {
  const fsPathCheck = checkForPotentialFsPath(path);
  switch (fsPathCheck) {
    case 'invalid characters':
      throw new Error(
        `FsPath: ${path} has invalid characters (possible Windows path)`
      );
    case 'not absolute':
      throw new Error(`FsPath: ${path} is not absolute`);
    case 'valid':
      break;
    default:
      assertUnreachableCode(fsPathCheck);
  }
}

export function toPotentialFsPath(path: string): PotentialFsPath {
  const potentialFsPath: string = path
    .replace(/^([a-zA-Z]):\\/, `/${path[0]}/`)
    .replace(/\\/g, '/');
  assertPotentialFsPath(potentialFsPath);
  return potentialFsPath;
}
