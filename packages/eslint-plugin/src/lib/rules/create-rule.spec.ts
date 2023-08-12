import { Rule, RuleTester } from 'eslint';
import { afterEach, describe, expect, it, vitest } from 'vitest';
import { createRule } from './create-rule';
import { ImportDeclaration, ImportExpression } from 'estree';

const tester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2015 },
});

const ruleExecutor = { foo: () => void true };
const spy = vitest.spyOn(ruleExecutor, 'foo');

export const testRule = createRule(
  'Test Rule',
  (
    context: Rule.RuleContext,
    node: ImportExpression | ImportDeclaration,
    isFirstRun: boolean
  ) => {
    ruleExecutor.foo();
  }
);

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
    { throwing: new Error('Test Error'), message: 'Test Error' },
    { throwing: 'some crazy error', message: 'some crazy error' },
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
                message: `Test Rule (internal error): ${message}`,
              },
            ],
          },
        ],
      });

      expect(spy).toHaveBeenCalledTimes(1);
    });
  }
});
