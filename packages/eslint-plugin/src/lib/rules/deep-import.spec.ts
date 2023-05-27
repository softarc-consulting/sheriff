import { RuleTester } from 'eslint';
import { afterEach, describe, expect, it, vitest } from 'vitest';
import { deepImport } from './deep-import';
import * as sheriffCore from '@softarc/sheriff-core';

const tester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2015 },
});

describe('deep-import', () => {
  const spy = vitest.spyOn(sheriffCore, 'hasDeepImport');

  afterEach(() => {
    spy.mockRestore();
  });

  it.each([
    {
      code: 'import {AppComponent} from "./app.component"',
      moduleName: './app.component',
    },
    {
      code: 'import * as path from "path"',
      moduleName: 'path',
    },
    {
      code: 'import {inject} from "@angular/core"',
      moduleName: '@angular/core',
    },
  ])('should check for $moduleName in $code', ({ code, moduleName }) => {
    spy.mockImplementation(() => false);
    tester.run('deep-import', deepImport, {
      valid: [{ code }],
      invalid: [],
    });
    expect(spy).toHaveBeenCalledWith('<input>', moduleName, true);
  });

  it('should not check for deep imports if no import are present', () => {
    tester.run('deep-import', deepImport, {
      valid: [{ code: 'const a = 1' }],
      invalid: [],
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('should report error when deepImports returns false', () => {
    spy.mockImplementation(() => true);
    tester.run('deep-import', deepImport, {
      valid: [],
      invalid: [
        {
          code: 'import {AppComponent} from "./app.component"',
          errors: [
            {
              message:
                "Deep import is not allowed. Use the module's index.ts or path.",
            },
          ],
        },
      ],
    });
  });

  it.todo('should transform a thrown error to a linting error');
  it.todo('should transform a thrown non-error to a linting error');
});
