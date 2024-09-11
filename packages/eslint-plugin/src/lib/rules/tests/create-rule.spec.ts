import { RuleTester } from 'eslint';
import { afterEach, describe, expect, it, vitest } from 'vitest';
import { createRule } from '../create-rule';
import { UserError } from '@softarc/sheriff-core';
import { parser } from 'typescript-eslint';

const tester = new RuleTester({
  languageOptions: { parser, sourceType: 'module' }
});

const ruleExecutor = { foo: () => void true };
const spy = vitest.spyOn(ruleExecutor, 'foo');

export const testRule = createRule('Test Rule', () => {
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
});
