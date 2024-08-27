import { describe, expect, it } from 'vitest';
import { createProject } from "../../test/project-creator";
import { tsConfig } from "../../test/fixtures/ts-config";
import { findModulePathsWithBarrel } from "../internal/find-module-paths-with-barrel";
import { toFsPath } from "../../file-info/fs-path";

describe('should find two modules', () => {
  it('should find two modules', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': '',
      'src/app': {
        'app.component.ts': '',
        customers: {
          'customer.component.ts': '',
          'index.ts': '',
        },
        holidays: {
          'holiday.component.ts': '',
          'index.ts': '',
        }}});

    const modulePaths = findModulePathsWithBarrel([toFsPath('/project')], 'index.ts');

    expect(modulePaths).toEqual([
      '/project/src/app/customers',
      '/project/src/app/holidays',
    ]);
  });
});
