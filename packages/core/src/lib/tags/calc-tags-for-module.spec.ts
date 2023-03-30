import { calcTagsForModule } from './calc-tags-for-module';
import { describe, expect, it } from 'vitest';
import { FsPath } from '../file-info/fs-path';

describe('calc tags for module', () => {
  it('should identify root as root', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: { tags: 'domain:abc' },
      })
    ).toEqual(['root']);
  });

  it('should calc for static value', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: { tags: 'domain:abc' },
      })
    ).toEqual(['domain:abc']);
  });

  it('multiple tags', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: { tags: ['domain:abc', 'type:generic'] },
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
        abc: { tags: (path) => `module:${path}` },
      })
    ).toEqual(['module:abc']);
  });

  it('should allow a function returning a string array', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: { tags: (path) => [`domain:${path}`, 'type:lib'] },
      })
    ).toEqual(['domain:abc', 'type:lib']);
  });

  it('should support regular expressions', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '/(\\w+)/': { tags: (_, { regexMatch }) => `domain:${regexMatch[0]}` },
      })
    ).toEqual(['domain:abc']);
  });

  it('should support a placeholder', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '{domain}': {
          tags: (path, { placeholders }) => `domain:${placeholders['domain']}`,
        },
      })
    ).toEqual(['domain:holidays']);
  });

  it('should support a partial placeholder', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/feature-holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'feature-{domain}': {
          tags: (match, { placeholders }) => `domain:${placeholders['domain']}`,
        },
      })
    ).toEqual(['domain:holidays']);
  });

  it('should allow config key to have multiple paths', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src/app/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'src/app/holidays': { tags: ['domain:holidays'] },
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
        customers: { tags: 'domain:customers' },
        holidays: { tags: 'domain:holidays' },
      })
    ).toEqual(['domain:holidays']);
  });

  it('should always pick the first rule that applies', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '{domain}': { tags: 'domain:holidays' },
        holidays: { tags: 'scope:holidays' },
      })
    ).toEqual(['domain:holidays']);
  });

  it('should support multiple placeholders', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/domain/holidays/data' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'domain/{feature}/{type}': {
          tags: (path, { placeholders }) => [
            `domain:${placeholders['feature']}`,
            `type:${placeholders['type']}`,
          ],
        },
      })
    ).toEqual(['domain:holidays', 'type:data']);
  });

  it('should allow nested paths', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src/app/domain/customers/ui' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'src/app/domain': {
          children: {
            '{domain}/{type}': {
              tags: (_, { placeholders: { domain, type } }) => [
                `domain:${domain}`,
                `type:${type}`,
              ],
            },
          },
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
          children: {
            'shared/{type}': {
              tags: (_, { placeholders: { type } }) => [`type:${type}`],
            },
            '{domain}/{type}': {
              tags: [],
            },
          },
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
          children: {
            domains: {
              children: {
                '{domain}': {
                  children: {
                    '{subDomain}': {
                      children: {
                        '{type}': {
                          tags: (_, { placeholders }) => [
                            `domain:${placeholders.domain}`,
                            `subDomain:${placeholders.subDomain}`,
                            `type:${placeholders.type}`,
                          ],
                        },
                      },
                    },
                  },
                },
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
          children: {
            '{str}': {
              tags: ['noop'],
            },
          },
        },
      })
    ).toThrowError('placeholder for value "str" does already exist');
  });

  it('should throw an error on partial match', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/domain/holidays/feature' as FsPath;

    expect(() =>
      calcTagsForModule(moduleDir, rootDir, {
        domain: {},
      })
    ).toThrowError(
      'tag configuration has no match for module /project/domain/holidays/feature'
    );
  });

  it('should throw an error if tag already exists', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays/feature' as FsPath;

    expect(() =>
      calcTagsForModule(moduleDir, rootDir, {
        '{str}': {
          children: {
            '{str}': {
              tags: ['noop'],
            },
          },
        },
      })
    ).toThrowError('placeholder for value "str" does already exist');
  });

  it('should not treat a regex as catch-all matcher', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays-123' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '/(\\w+)/': { tags: 'regex' },
        'holidays-123': { tags: 'simple match' },
      })
    ).toEqual(['simple match']);
  });

  it('should not treat a placeholder as catch-all matcher', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays-123' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '{feature}_{id}': { tags: 'placeholder' },
        'holidays-123': { tags: 'simple match' },
      })
    ).toEqual(['simple match']);
  });
});
