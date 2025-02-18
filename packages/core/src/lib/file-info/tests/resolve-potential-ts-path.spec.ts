import { ResolveFn } from '../traverse-filesystem';
import { resolvePotentialTsPath } from '../resolve-potential-ts-path';
import { FsPath } from '../fs-path';
import { it, expect } from 'vitest';

it('should return undefined if TS resolving does not work', () => {
  const resolveFn: ResolveFn = () => ({
    resolvedModule: undefined,
  });

  expect(
    resolvePotentialTsPath(
      '@customers',
      {
        '@customers': '/project/src/app/customers/index.ts' as FsPath,
      },
      resolveFn,
    ),
  ).toBeUndefined();
});
