import { describe, expect, it } from 'vitest';
import { anyTag, violatesEncapsulationRule } from '@softarc/sheriff-core';
import getFs from '../../fs/getFs';
import { toFsPath } from '../../file-info/fs-path';
import { testInit } from '../../test/test-init';
import { sheriffConfig } from '../../test/project-configurator';
import { tsConfig } from '../../test/fixtures/ts-config';

describe('encapsulation and excludeRoot config property', () => {
  for (const { excludeRoot, enableBarrelLess, hasViolation } of [
    { excludeRoot: true, enableBarrelLess: false, hasViolation: false },
    { excludeRoot: false, enableBarrelLess: false, hasViolation: true },
    { excludeRoot: true, enableBarrelLess: true, hasViolation: false },
    { excludeRoot: false, enableBarrelLess: true, hasViolation: false },
  ]) {
    it(`should be ${
      hasViolation ? 'valid' : 'invalid'
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
          'router.ts': ['./shared/dialog'], // always violation
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

      assertViolation('/project/src/router.ts', './shared/dialog', false, true);

      assertViolation(
        '/project/src/holidays/holidays-component.ts',
        '../config',
        true,
        false,
      );

      assertViolation(
        '/project/src/shared/get.ts',
        '../config',
        true,
        hasViolation,
      );

      assertViolation(
        '/project/src/shared/get.ts',
        '../holidays/holidays-component',
        true,
        hasViolation,
      );
    });
  }
});

function assertViolation(
  filename: string,
  importCommand: string,
  isImportToBarrelLess: boolean,
  hasViolation: boolean,
) {
  expect(
    violatesEncapsulationRule(
      filename,
      importCommand,
      true,
      getFs().readFile(toFsPath(filename)),
      false,
    ),
    `import in ${filename} to ${importCommand} should violate encapsulation: ${hasViolation}`,
  ).toBe(getMessage(hasViolation, isImportToBarrelLess, importCommand));
}

function getMessage(
  hasViolation: boolean,
  isImportToBarrelLess: boolean,
  importCommand: string,
) {
  if (!hasViolation) {
    return '';
  }
  return isImportToBarrelLess
    ? `'${importCommand}' cannot be imported. It is encapsulated.`
    : `'${importCommand}' is a deep import from a barrel module. Use the module's barrel file (index.ts) instead.`;
}
