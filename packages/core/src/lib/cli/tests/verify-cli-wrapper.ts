import * as getEntryFromCliOrConfigFile from '../internal/get-entries-from-cli-or-config';
import * as handleErrorFile from '../internal/handle-error';
import { expect, it, vitest } from 'vitest';
import { createProject } from '../../test/project-creator';
import { tsConfig } from '../../test/fixtures/ts-config';
import { main } from '../main';
import { mockCli } from './helpers/mock-cli';

// Helper Functions to avoid redundancy in the CLI commands
export function verifyCliWrappers(...args: unknown[]) {
  it(`should call getEntryFromCliOrConfig`, () => {
    mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': [''],
      },
    });

    const spy = vitest.spyOn(
      getEntryFromCliOrConfigFile,
      'getEntryFromCliOrConfig',
    );

    main(...args.map(String));

    expect(spy).toHaveBeenCalledWith(...args.slice(1));
  });

  it('should use the error handler', () => {
    mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': [''],
      },
    });

    const spy = vitest.spyOn(handleErrorFile, 'handleError');
    main(...args.map(String));

    expect(spy).toHaveBeenCalledOnce();
  });
}
