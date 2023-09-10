import { RuleTester } from 'eslint';
import { afterEach, describe, it, vitest } from 'vitest';
import * as sheriffCore from '@softarc/sheriff-core';
import { dependencyRule } from './dependency-rule';

const tester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2015 },
});

describe('dependency rule', () => {
  const spy = vitest.spyOn(sheriffCore, 'violatesDependencyRule');

  afterEach(() => {
    spy.mockReset();
  });

  it('should not fail when returned message is empty', () => {
    spy.mockReturnValue('');
    tester.run('depdency-rule', dependencyRule, {
      valid: [{ code: 'import {AppComponent} from "@app";' }],
      invalid: [],
    });
  });

  it('should fail when returned message has a value', () => {
    spy.mockReturnValue('access is not allowed');
    tester.run('depdency-rule', dependencyRule, {
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
