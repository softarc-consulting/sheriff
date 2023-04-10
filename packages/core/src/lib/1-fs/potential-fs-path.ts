import { assertUnreachableCode } from '../util/assert-unreachable-code';

type NoBackslash<Value extends string> = Value extends `${string}\\${string}`
  ? never
  : Value;
type PotentialFsPathLiteral<S extends string> = S extends `/${infer Rest}`
  ? Rest extends NoBackslash<Rest>
    ? S
    : never
  : never;

export type PotentialFsPath<Path extends string> =
  | (string & { type: 'PotentialFsPath' })
  | PotentialFsPathLiteral<Path>;

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

export const isPotentialFsPath = (
  path: string
): path is PotentialFsPath<string> => checkForPotentialFsPath(path) === 'valid';

export function assertPotentialFsPath<Path extends string>(
  path: string
): asserts path is PotentialFsPath<Path> {
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

export function toPotentialFsPath<Path extends string>(
  path: Path
): PotentialFsPath<Path> {
  const potentialFsPath: string = path
    .replace(/^([a-zA-Z]):\\/, `/${path[0]}/`)
    .replace(/\\/g, '/');
  assertPotentialFsPath(potentialFsPath);
  return potentialFsPath;
}
