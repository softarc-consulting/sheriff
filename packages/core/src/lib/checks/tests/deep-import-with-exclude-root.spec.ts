import { describe, expect, it } from 'vitest';
import { anyTag, hasDeepImport } from "@softarc/sheriff-core";
import getFs from '../../fs/getFs';
import { toFsPath } from '../../file-info/fs-path';
import { testInit } from "../../test/test-init";
import { sheriffConfig } from "../../test/project-configurator";
import { tsConfig } from "../../test/fixtures/ts-config";

describe('deep imports and excludeRoot config property', () => {
  for (const { excludeRoot, enableBarrelLess, hasDeepImport } of [
    { excludeRoot: true, enableBarrelLess: false, hasDeepImport: false },
    { excludeRoot: false, enableBarrelLess: false, hasDeepImport: true },
    { excludeRoot: true, enableBarrelLess: true, hasDeepImport: false },
    { excludeRoot: false, enableBarrelLess: true, hasDeepImport: false },
  ]) {
    it(`should be ${
      hasDeepImport ? 'valid' : 'invalid'
    } for rootExcluded: ${excludeRoot} and barrel-less: ${enableBarrelLess}`, () => {
      testInit('src/main.ts', {
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          modules: { 'src/shared': 'shared' },
          depRules: { '*': anyTag },
          excludeRoot,
          enableBarrelLess,
        }),
        src: {
          'main.ts': '',
          'router.ts': ['./shared/dialog'], // always deep import
          'config.ts': ['./shared/index'],
          shared: {
            'get.ts': ['../config', '../holidays/holidays-component'], // depends on `excludeRoot`
            'dialog.ts': '',
            'index.ts': '',
          },
          holidays: {
            'holidays-component.ts': ['../config'], // always valid},
          },
        },
      });

      assertDeepImport('/project/src/router.ts', './shared/dialog');
      assertDeepImport(
        '/project/src/holidays/holidays-component.ts',
        '../config',
        false,
      );

      assertDeepImport(
        '/project/src/shared/get.ts',
        '../config',
        hasDeepImport,
      );

      assertDeepImport(
        '/project/src/shared/get.ts',
        '../holidays/holidays-component',
        hasDeepImport,
      );
    });
  }
});

function assertDeepImport(
  filename: string,
  importCommand: string,
  isDeepImport = true,
) {
  expect(
    hasDeepImport(
      filename,
      importCommand,
      true,
      getFs().readFile(toFsPath(filename)),
    ),
    `deep import in ${filename} from ${importCommand} should be ${isDeepImport}`,
  ).toBe(
    isDeepImport
      ? "Deep import is not allowed. Use the module's index.ts or path."
      : '',
  );
}
