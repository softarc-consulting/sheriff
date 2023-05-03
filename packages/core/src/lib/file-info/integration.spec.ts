import { describe, it } from 'vitest';
import * as path from 'path';
import { generateFileInfoAndGetRootDir } from './generate-file-info-and-get-root-dir';
import { toFsPath } from './fs-path';

describe('integration test', () => {
  it.each(['angular-i', 'angular-ii'])('should test $s', (project) => {
    const angularMain1 = path.join(
      __dirname,
      '../../../../..',
      'test-projects/',
      project,
      'src/main.ts'
    );
    generateFileInfoAndGetRootDir(toFsPath(angularMain1), false);
  });
});
