import { UserError } from '@softarc/sheriff-core';
import { RuleTester } from 'eslint';
import { parser } from 'typescript-eslint';
import { afterEach, describe, expect, it, vitest } from 'vitest';
import { createRule } from '../utils/create-rule';
import { excludeSheriffConfig } from '../utils/file-filter';
const tester = new RuleTester({
  languageOptions: { parser, sourceType: 'module' },
});

const ruleExecutor = { foo: () => void true };
const spy = vitest.spyOn(ruleExecutor, 'foo');

export const testRule = createRule('Test Rule', excludeSheriffConfig, () => {
  ruleExecutor.foo();
});

describe('create rule', () => {
  afterEach(() => {
    spy.mockReset();
  });

  it('should call the rule executor for both import types', () => {
    tester.run('test-rule', testRule, {
      valid: [
        {
          code: `import {AppComponent} from './app.component'
      const a = new AppComponent();
      import('../util.ts')`,
        },
      ],
      invalid: [],
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  for (const { throwing, message } of [
    {
      throwing: new Error('Test Error'),
      message: 'Test Rule (internal error): Test Error',
    },
    {
      throwing: 'some crazy error',
      message: 'Test Rule (internal error): some crazy error',
    },
    {
      throwing: new UserError('SH-001', 'You did something wrong'),
      message: 'User Error: SH-001 - You did something wrong',
    },
  ]) {
    it(`should assign an error only once and show ${message}`, () => {
      spy.mockImplementation(() => {
        throw throwing;
      });
      tester.run('error', testRule, {
        valid: [],
        invalid: [
          {
            code: `import {AppComponent} from './app.component'
      const a = new AppComponent();
      import('../util.ts')`,
            errors: [
              {
                message,
              },
            ],
          },
        ],
      });

      expect(spy).toHaveBeenCalledTimes(1);
    });
  }

  it('should also match export declarations', () => {
    tester.run('test-rule', testRule, {
      valid: [
        {
          code: `
            export * from '../index';
            export { Component } from './component';
            export const value = {n: 1};
            export default {a: 1};
          `,
        },
      ],
      invalid: [],
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should not run the rule if the file is excluded', () => {
    tester.run('test-rule', testRule, {
      valid: [],
      invalid: [],
    });
    expect(spy).toHaveBeenCalledTimes(0);
  });
});
