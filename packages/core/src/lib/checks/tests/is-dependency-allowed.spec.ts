import { describe, expect, test, it } from 'vitest';
import {
  DependencyCheckContext,
  DependencyRulesConfig,
} from '../../config/dependency-rules-config';
import { isDependencyAllowed } from '../is-dependency-allowed';
import { FsPath } from '../../file-info/fs-path';
import { sameTag } from '../same-tag';
import { noDependencies } from '../no-dependencies';
import { NoDependencyRuleForTagError } from '../../error/user-error';
import '../../test/expect.extensions';

type TestParams = [string, boolean][];

const createMockDependencyCheckContext = (
  overrides?: Partial<DependencyCheckContext>,
): DependencyCheckContext =>
  ({
    fromModulePath: '',
    toModulePath: '',
    fromFilePath: '',
    toFilePath: '',
    fromTags: [],
    toTags: [],
    ...overrides,
  }) as DependencyCheckContext;

const dummyContext: DependencyCheckContext = createMockDependencyCheckContext({
  fromModulePath: '/project/moduleFrom' as FsPath,
  toModulePath: '/project/moduleTo' as FsPath,
  fromFilePath: '/project/moduleFrom/some.component.ts' as FsPath,
  toFilePath: '/project/cool.service.ts' as FsPath,
  fromTags: ['domain:customers'],
  toTags: ['domain:holidays'],
});

const createAssertsForConfig = (config: DependencyRulesConfig) => {
  return {
    assertValid(from: string, to: string | string[]) {
      const toTags = Array.isArray(to) ? to : [to];
      expect(
        isDependencyAllowed(
          from,
          config,
          createMockDependencyCheckContext({ toTags }),
        ),
      ).toBe(true);
    },
    assertInvalid(from: string, to: string | string[]) {
      const toTags = Array.isArray(to) ? to : [to];
      expect(
        isDependencyAllowed(
          from,
          config,
          createMockDependencyCheckContext({ toTags }),
        ),
      ).toBe(false);
    },

    assert(from: string, to: string | string[], expected: boolean) {
      const toTags = Array.isArray(to) ? to : [to];
      expect(
        isDependencyAllowed(
          from,
          config,
          createMockDependencyCheckContext({ toTags }),
        ),
      ).toBe(expected);
    },
  };
};

describe('check dependency rules', () => {
  test('single string rule', () => {
    const { assertValid, assertInvalid } = createAssertsForConfig({
      'type:feature': 'type:ui',
      'type:ui': '',
    });

    assertValid('type:feature', 'type:ui');
    assertInvalid('type:ui', 'type:feature');
  });

  test('multiple string rules', () => {
    const { assertValid, assertInvalid } = createAssertsForConfig({
      'type:feature': ['type:data', 'type:ui'],
    });

    assertValid('type:feature', 'type:ui');
    assertInvalid('type:feature', 'domain:abc');
  });

  test('same tag is not automatically allowed', () => {
    const { assertInvalid } = createAssertsForConfig({ 'type:feature': [] });

    assertInvalid('type:feature', 'type:feature');
  });

  for (const [to, isAllowed] of [
    ['type:ui', true],
    ['type:data', true],
    ['domain:shared', false],
    ['super-type:shared', false],
  ] as TestParams) {
    test(`single matcher function for ${to} should be allowed: ${isAllowed}`, () => {
      const { assert } = createAssertsForConfig({
        'type:feature': [({ to }) => to.startsWith('type')],
      });

      assert('type:feature', to, isAllowed);
    });
  }

  it('should throw an error if tag is not configured', () => {
    const config: DependencyRulesConfig = {
      'type:feature': 'test:ui',
    };

    expect(() =>
      isDependencyAllowed('type:funktion', config, dummyContext),
    ).toThrowUserError(new NoDependencyRuleForTagError('type:funktion'));
  });

  it('should pass from, to, fromModulePath, fromFilePath, toModulePath, toFilePath to function', () => {
    isDependencyAllowed(
      'domain:customers',
      {
        'domain:customers': (context) => {
          expect(context).toStrictEqual({
            ...dummyContext,
            from: 'domain:customers',
            to: 'domain:holidays',
          });
          return true;
        },
      },
      dummyContext,
    );
  });

  for (const [to, isAllowed] of [
    ['domain:customers', true],
    ['domain:shared', true],
    ['domain:holidays', false],
  ] as TestParams) {
    it(`should support both string and function for a rule and should return for ${to}: ${isAllowed}`, () => {
      const { assert } = createAssertsForConfig({
        'domain:customers': [
          'domain:shared',
          ({ to }) => to === 'domain:customers',
        ],
      });

      assert('domain:customers', to, isAllowed);
    });
  }

  for (const [to, isAllowed] of [
    ['domain:customers', true],
    ['domain:shared', true],
    ['domain:holidays', false],
  ] as TestParams) {
    it(`should return ${isAllowed} for catch all for ${to}`, () => {
      const { assert } = createAssertsForConfig({
        'domain:*': [
          ({ from, to }) => {
            return from === to || to === 'domain:shared';
          },
        ],
      });

      assert('domain:customers', to, isAllowed);
    });
  }

  it('should run multiple checks, if tag is configured multiple times', () => {
    const { assertValid } = createAssertsForConfig({
      'domain:*': ({ from, to }) => from === to,
      'domain:bookings': 'domain:customers:api',
    });

    assertValid('domain:bookings', 'domain:customers:api');
  });

  it('should have access to a module when of the tags allow it', () => {
    const { assertValid } = createAssertsForConfig({
      'domain:*': [({ from, to }) => from === to, 'shared'],
      'type:feature': ['type:data', 'type:ui'],
    });

    assertValid('domain:bookings', ['shared', 'type:shared']);
  });

  it('should allow wildcard in rule values as well', () => {
    const { assertValid } = createAssertsForConfig({
      'type:feature': ['type:data', 'type:ui', 'shared:*'],
    });

    assertValid('type:feature', 'shared:ui');
  });

  for (const [to, from, isAllowed] of [
    ['domain:customers', 'domain:customers', true],
    ['domain:holidays', 'domain:holidays', true],
    ['domain:customers', 'domain:holidays', false],
    ['domain:holidays', 'domain:customers', false],
  ] as [string, string, boolean][]) {
    it(`should work with pre-defined \`sameTag\` from ${from} to ${to}`, () => {
      const { assert } = createAssertsForConfig({
        'domain:*': sameTag,
      });

      assert(from, to, isAllowed);
    });
  }

  it.each(['type:model', '', 'shared'])(
    'should allow no dependencies with `noDependencies` on %s',
    (toTag) => {
      const { assertInvalid } = createAssertsForConfig({
        'type:model': noDependencies,
      });

      assertInvalid('type:model', toTag);
    },
  );

  describe('fromTags and toTags', () => {
    const crossDomainConfig: DependencyRulesConfig = {
      '*': ({ fromTags, toTags }) => {
        const fromDomain = fromTags.find((t) => t.startsWith('domain:'));
        const toDomain = toTags.find((t) => t.startsWith('domain:'));
        const fromType = fromTags.find((t) => t.startsWith('type:'));
        const toType = toTags.find((t) => t.startsWith('type:'));

        if (toDomain === 'domain:shared') return true;
        if (fromType === 'type:api' || toType === 'type:api') return true;
        if (fromDomain === toDomain) return true;

        return false;
      },
    };

    it('should allow access to shared domain from any domain', () => {
      expect(
        isDependencyAllowed(
          'domain:customers',
          crossDomainConfig,
          createMockDependencyCheckContext({
            fromTags: ['domain:customers'],
            toTags: ['domain:shared'],
          }),
        ),
      ).toBe(true);
    });

    it('should forbid cross-domain access except for API', () => {
      expect(
        isDependencyAllowed(
          'domain:customers',
          crossDomainConfig,
          createMockDependencyCheckContext({
            fromTags: ['domain:customers'],
            toTags: ['domain:holidays'],
          }),
        ),
      ).toBe(false);
    });

    it('should allow API access across domains', () => {
      expect(
        isDependencyAllowed(
          'type:api',
          crossDomainConfig,
          createMockDependencyCheckContext({
            fromTags: ['type:api', 'domain:customers'],
            toTags: ['domain:holidays', 'type:ui'],
          }),
        ),
      ).toBe(true);
    });

    it('should allow access to API in another domain', () => {
      expect(
        isDependencyAllowed(
          'domain:customers',
          crossDomainConfig,
          createMockDependencyCheckContext({
            fromTags: ['domain:customers', 'type:feature'],
            toTags: ['type:api', 'domain:holidays'],
          }),
        ),
      ).toBe(true);
    });

    it('should allow same domain access', () => {
      expect(
        isDependencyAllowed(
          'domain:customers',
          crossDomainConfig,
          createMockDependencyCheckContext({
            fromTags: ['domain:customers'],
            toTags: ['domain:customers'],
          }),
        ),
      ).toBe(true);
    });
  });
});
