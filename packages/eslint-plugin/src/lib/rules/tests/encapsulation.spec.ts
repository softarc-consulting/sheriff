import { RuleTester } from 'eslint';
import { afterEach, describe, expect, it, vitest } from 'vitest';
import * as sheriffCore from '@softarc/sheriff-core';
import { parser } from "typescript-eslint";
import { encapsulation } from "../encapsulation";

const tester = new RuleTester({
  languageOptions: { parser, sourceType: 'module' },
});

describe('encapsulation', () => {
  const spy = vitest.spyOn(sheriffCore, 'violatesEncapsulationRule');

  afterEach(() => {
    spy.mockReset();
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
    spy.mockImplementation(() => '');
    tester.run('encapsulation', encapsulation, {
      valid: [{ code }],
      invalid: [],
    });
    expect(spy).toHaveBeenCalledWith('<input>', moduleName, true, code, false);
  });

  it('should not check for violations if no import is present', () => {
    tester.run('encapsulation', encapsulation, {
      valid: [{ code: 'const a = 1' }],
      invalid: [],
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('should direclty use the message from encapsulation', () => {
    spy.mockImplementation(() => 'nothing works');
    tester.run('encapsulation', encapsulation, {
      valid: [],
      invalid: [
        {
          code: 'import {AppComponent} from "./app.component"',
          errors: [
            {
              message: 'nothing works',
            },
          ],
        },
      ],
    });
  });

  it('should report an internal error only once', () => {
    spy.mockImplementation(() => {
      throw new Error('This is an error');
    });
    tester.run('encapsulation', encapsulation, {
      valid: [],
      invalid: [
        {
          code:
            'import {AppComponent} from "./app.component";' +
            'import {Service} from "somewhere";',
          errors: [
            {
              message: 'Encapsulation (internal error): This is an error',
            },
          ],
        },
      ],
    });
  });
});
