import { describe, expect, test, it } from 'vitest';
import {
  DependencyCheckContext,
  DependencyRulesConfig,
} from '../config/dependency-rules-config';
import { isDependencyAllowed } from './is-dependency-allowed';
import { FsPath } from '../file-info/fs-path';

type TestParams = [string, boolean][];

describe('check dependency rules', () => {
  const dummyContext: DependencyCheckContext = {
    fromModulePath: '/project/moduleFrom' as FsPath,
    toModulePath: '/project/moduleTo' as FsPath,
    fromFilePath: '/project/moduleFrom/some.component.ts' as FsPath,
    toFilePath: '/project/cool.service.ts' as FsPath,
  };
  test('single string rule', () => {
    const config: DependencyRulesConfig = {
      'type:feature': 'type:ui',
      'type:ui': '',
    };

    expect(
      isDependencyAllowed(['type:feature'], 'type:ui', config, dummyContext)
    ).toBe(true);
    expect(
      isDependencyAllowed(['type:ui'], 'type:feature', config, dummyContext)
    ).toBe(false);
  });

  test('multiple string rules', () => {
    const config: DependencyRulesConfig = {
      'type:feature': ['type:data', 'type:ui'],
    };

    expect(
      isDependencyAllowed(['type:feature'], 'type:ui', config, dummyContext)
    ).toBe(true);
    expect(
      isDependencyAllowed(['type:feature'], 'domain:abc', config, dummyContext)
    ).toBe(false);
  });

  for (const [to, isAllowed] of [
    ['type:ui', true],
    ['type:data', true],
    ['domain:shared', false],
    ['super-type:shared', false],
  ] as TestParams) {
    test(`single matcher function for ${to} should be allowed: ${isAllowed}`, () => {
      const config: DependencyRulesConfig = {
        'type:feature': [({ to }) => to.startsWith('type')],
      };

      expect(
        isDependencyAllowed(['type:feature'], to, config, dummyContext)
      ).toBe(isAllowed);
    });
  }

  for (const [to, isAllowed] of [
    ['type:ui', true],
    ['domain:abc', false],
  ] as TestParams) {
    test(`rule with string and function for ${to}: ${isAllowed}`, () => {
      const config: DependencyRulesConfig = {
        'type:feature': ['type:data', 'type:ui'],
      };

      expect(
        isDependencyAllowed(['type:feature'], to, config, dummyContext)
      ).toBe(isAllowed);
    });
  }

  it('should throw an error if module is not configured', () => {
    const config: DependencyRulesConfig = {
      'type:feature': 'test:ui',
    };

    expect(() =>
      isDependencyAllowed(['type:funktion'], 'noop', config, dummyContext)
    ).toThrowError('cannot find any dependency rule for tag type:funktion');
  });

  it('should pass from, to, fromModulePath, fromFilePath, toModulePath, toFilePath to function', () => {
    isDependencyAllowed(
      ['domain:customers'],
      'domain:holidays',
      {
        'domain:customers': (context) => {
          expect(context).toStrictEqual({
            from: 'domain:customers',
            to: 'domain:holidays',
            ...dummyContext,
          });
          return true;
        },
      },
      dummyContext
    );
  });

  for (const [to, isAllowed] of [
    ['domain:customers', true],
    ['domain:shared', true],
    ['domain:holidays', false],
  ] as TestParams) {
    it(`should support both string and function for a rule and should return for ${to}: ${isAllowed}`, () => {
      const config: DependencyRulesConfig = {
        'domain:customers': [
          'domain:shared',
          ({ to }) => to === 'domain:customers',
        ],
      };
      expect(
        isDependencyAllowed(['domain:customers'], to, config, dummyContext)
      ).toBe(isAllowed);
    });
  }

  for (const [to, isAllowed] of [
    ['domain:customers', true],
    ['domain:shared', true],
    ['domain:holidays', false],
  ] as TestParams) {
    it(`should return ${isAllowed} for catch all for ${to}`, () => {
      const config: DependencyRulesConfig = {
        'domain:*': [
          ({ from, to }) => {
            return from === to || to === 'domain:shared';
          },
        ],
      };
      expect(
        isDependencyAllowed(['domain:customers'], to, config, dummyContext)
      ).toBe(isAllowed);
    });
  }

  it('should run multipe checks, if tag is configured multiple times', () => {
    const config: DependencyRulesConfig = {
      'domain:*': ({ from, to }) => from === to,
      'domain:bookings': 'domain:customers:api',
    };

    expect(
      isDependencyAllowed(
        ['domain:bookings'],
        'domain:customers:api',
        config,
        dummyContext
      )
    ).toBe(true);
  });

  it('should have access to a module when of the tags allow it', () => {
    const config: DependencyRulesConfig = {
      'domain:*': [({ from, to }) => from === to, 'shared'],
      'type:feature': ['type:data', 'type:ui'],
    };

    expect(
      isDependencyAllowed(
        ['domain:booking', 'type:feature'],
        'shared',
        config,
        dummyContext
      )
    ).toBe(true);
  });
});
