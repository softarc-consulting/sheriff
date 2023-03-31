import { calcTagsForModule } from './calc-tags-for-module';
import { describe, expect, it } from 'vitest';
import { FsPath } from '../file-info/fs-path';

describe('calc tags for module', () => {
  it('should identify root as root', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: 'domain:abc',
      })
    ).toEqual(['root']);
  });

  it('should calc for static value', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: 'domain:abc',
      })
    ).toEqual(['domain:abc']);
  });

  it('multiple tags', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: ['domain:abc', 'type:generic'],
      })
    ).toEqual(['domain:abc', 'type:generic']);
  });

  it('optional tags', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: {},
      })
    ).toEqual([]);
  });

  it('should allow a function returning a string', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: (_, { segment }) => `module:${segment}`,
      })
    ).toEqual(['module:abc']);
  });

  it('should allow a function returning a string array', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: (_, { segment }) => [`domain:${segment}`, 'type:lib'],
      })
    ).toEqual(['domain:abc', 'type:lib']);
  });

  it('should support regular expressions', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '/(\\w+)/': (_, { regexMatch }) => `domain:${regexMatch[0]}`,
      })
    ).toEqual(['domain:abc']);
  });

  it('should support a placeholder', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '{domain}': ({ domain }) => `domain:${domain}`,
      })
    ).toEqual(['domain:holidays']);
  });

  it('should support a partial placeholder', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/feature-holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'feature-{domain}': ({ domain }) => `domain:${domain}`,
      })
    ).toEqual(['domain:holidays']);
  });

  it('should allow config key to have multiple paths', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src/app/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'src/app/holidays': ['domain:holidays'],
      })
    ).toEqual(['domain:holidays']);
  });

  it('should throw an error if there is no match', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src' as FsPath;

    expect(() =>
      calcTagsForModule(moduleDir, rootDir, {
        'src/app/holidays': { tags: ['domain:holidays'] },
      })
    ).toThrowError('did not find a match for /project/src');
  });

  it('should skip rules that do not apply', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        customers: 'domain:customers',
        holidays: 'domain:holidays',
      })
    ).toEqual(['domain:holidays']);
  });

  it('should always pick the first rule that applies', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '{domain}': 'domain:holidays',
        holidays: 'scope:holidays',
      })
    ).toEqual(['domain:holidays']);
  });

  it('should support multiple placeholders', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/domain/holidays/data' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'domain/{feature}/{type}': ({ feature, type }) => [
          `domain:${feature}`,
          `type:${type}`,
        ],
      })
    ).toEqual(['domain:holidays', 'type:data']);
  });

  it('should allow nested paths', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src/app/domain/customers/ui' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'src/app/domain': {
          '{domain}/{type}': ({ domain, type }) => [
            `domain:${domain}`,
            `type:${type}`,
          ],
        },
      })
    ).toEqual(['domain:customers', 'type:ui']);
  });

  it('should allow nested paths with multiple matchers', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src/app/shared/ngrx-util' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'src/app': {
          'shared/{type}': ({ type }) => [`type:${type}`],
          '{domain}/{type}': [],
        },
      })
    ).toEqual(['type:ngrx-util']);
  });

  it('should support multiple partial placeholders', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir =
      '/project/src/app/domains/holidays/core/feature' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'src/app': {
          domains: {
            '{domain}': {
              '{subDomain}': {
                '{type}': (placeholders) => [
                  `domain:${placeholders.domain}`,
                  `subDomain:${placeholders.subDomain}`,
                  `type:${placeholders.type}`,
                ],
              },
            },
          },
        },
      })
    ).toEqual(['domain:holidays', 'subDomain:core', 'type:feature']);
  });

  it('should throw an error if tag already exists', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays/feature' as FsPath;

    expect(() =>
      calcTagsForModule(moduleDir, rootDir, {
        '{str}': {
          '{str}': ['noop'],
        },
      })
    ).toThrowError('placeholder for value "str" does already exist');
  });

  it('should throw an error on partial match', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/domain/holidays/feature' as FsPath;

    expect(() =>
      calcTagsForModule(moduleDir, rootDir, {
        domain: '',
      })
    ).toThrowError(
      'tag configuration has no match for module /project/domain/holidays/feature'
    );
  });

  it('should throw an error if the placeholder already exists', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays/feature' as FsPath;

    expect(() =>
      calcTagsForModule(moduleDir, rootDir, {
        '{str}': {
          '{str}': ['noop'],
        },
      })
    ).toThrowError('placeholder for value "str" does already exist');
  });

  it('should not treat a regex as catch-all matcher', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays-123' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '/(\\w+)/': 'regex',
        'holidays-123': 'simple match',
      })
    ).toEqual(['simple match']);
  });

  it('should not treat a placeholder as catch-all matcher', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays-123' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '{feature}_{id}': 'placeholder',
        'holidays-123': 'simple match',
      })
    ).toEqual(['simple match']);
  });
});
