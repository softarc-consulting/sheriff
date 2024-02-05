import { describe, it } from 'vitest';
import * as path from 'path';
import { generateUnassignedFileInfo } from './generate-unassigned-file-info';
import { toFsPath } from './fs-path';
import { init } from '../main/init';


describe('integration test', () => {
  for(const project of ['angular-i', 'angular-ii']) {
  it(`should test ${project}`, () => {
    const angularMain1 = path.join(
      __dirname,
      '../../../../..',
      'test-projects/',
      project,
      'src/main.ts'
    );
    const { tsData } = init(toFsPath(angularMain1),  {traverse: true});
    generateUnassignedFileInfo(toFsPath(angularMain1), false, tsData);
  });
  }
});
