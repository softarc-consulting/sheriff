import { Rule, RuleTester } from 'eslint';
import { afterEach, describe, expect, it, vitest } from 'vitest';
import { createRule } from '../create-rule';
import { UserError } from '@softarc/sheriff-core';
import { parser } from 'typescript-eslint';

const tester = new RuleTester({
  languageOptions: { parser, sourceType: 'module' },
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

  it.each(['legacy methods', 'modern properties'])(
    'should pass the filename and source text with %s',
    (contextApi) => {
      const executor = vitest.fn();
      const rule = createRule('context compatibility', executor);
      const code = "import { value } from './value';";

      tester.run(
        'context compatibility',
        {
          ...rule,
          create(context) {
            const compatibleContext = {
              report: context.report.bind(context),
              ...(contextApi === 'legacy methods'
                ? {
                    getFilename: () => context.filename,
                    getSourceCode: () => context.sourceCode,
                  }
                : {
                    filename: context.filename,
                    sourceCode: context.sourceCode,
                  }),
            } as unknown as Rule.RuleContext;
            return rule.create(compatibleContext);
          },
        },
        {
          valid: [{ code, filename: 'compatibility.ts' }],
          invalid: [],
        },
      );

      expect(executor).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        expect.objectContaining({ type: 'ImportDeclaration' }),
        true,
        expect.stringContaining('compatibility.ts'),
        code,
      );
    },
  );

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
});
