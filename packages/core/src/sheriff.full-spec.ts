/**
 * This test is excluded by default and only runs in the CI.
 * This is because, it requires teh built packages
 **/
import { describe, it } from 'vitest';
import * as path from 'path';
import { generateUnassignedFileInfo } from './lib/file-info/generate-unassigned-file-info';
import { init } from './lib/main/init';
import { toFsPath } from './lib/file-info/fs-path';

describe('integration test', () => {
  for (const project of ['angular-i', 'angular-ii']) {
    it(`should test ${project}`, () => {
      const angularMain1 = path.join(
        __dirname,
        '../../../..',
        'test-projects/',
        project,
        'src/main.ts',
      );
      const { tsData } = init(toFsPath(angularMain1), { traverse: true });
      generateUnassignedFileInfo(toFsPath(angularMain1), false, tsData);
    });
  }
});
