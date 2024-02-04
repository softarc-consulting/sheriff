import { describe, it } from 'vitest';
import * as path from 'path';
import { generateFileInfo } from './generate-file-info';
import { toFsPath } from './fs-path';
import { init } from '../main/init';


describe('integration test', () => {
  it.each(['angular-i', 'angular-ii'])('should test $s', (project) => {
    const angularMain1 = path.join(
      __dirname,
      '../../../../..',
      'test-projects/',
      project,
      'src/main.ts'
    );
    const { tsData } = init(toFsPath(angularMain1),  {traverse: true});
    generateFileInfo(toFsPath(angularMain1), false, tsData);
  });
});
