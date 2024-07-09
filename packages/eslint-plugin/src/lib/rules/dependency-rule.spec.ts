import { RuleTester } from 'eslint';
import { afterEach, describe, expect, it, vitest } from 'vitest';
import * as sheriffCore from '@softarc/sheriff-core';
import { dependencyRule } from './dependency-rule';
import { parser } from 'typescript-eslint';

const tester = new RuleTester({
  languageOptions: { parser, sourceType: 'module' },
});

describe('dependency rule', () => {
  const spy = vitest.spyOn(sheriffCore, 'violatesDependencyRule');

  afterEach(() => {
    spy.mockReset();
  });

  it('should pass file contents', () => {
    const code = 'import {AppComponent} from "./app.component"';
    spy.mockReturnValue('');
    tester.run('dependency-rule', dependencyRule, {
      valid: [{ code }],
      invalid: [],
    });
    expect(spy).toHaveBeenCalledWith('<input>', './app.component', true, code);
  });

  it('should not fail when returned message is empty', () => {
    spy.mockReturnValue('');
    tester.run('dependency-rule', dependencyRule, {
      valid: [{ code: 'import {AppComponent} from "@app";' }],
      invalid: [],
    });
  });

  it('should fail when returned message has a value', () => {
    spy.mockReturnValue('access is not allowed');
    tester.run('dependency-rule', dependencyRule, {
      valid: [],
      invalid: [
        {
          code: 'import {AppComponent} from "@app";',
          errors: [{ message: 'access is not allowed' }],
        },
      ],
    });
  });
});
