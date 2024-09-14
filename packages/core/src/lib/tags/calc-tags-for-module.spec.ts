import { calcTagsForModule } from './calc-tags-for-module';
import { describe, expect, it } from 'vitest';
import { FsPath } from '../file-info/fs-path';
import throwIfNull from '../util/throw-if-null';
import {
  ExistingTagPlaceholderError,
  InvalidPlaceholderError,
  NoAssignedTagError,
  TagWithoutValueError,
} from '../error/user-error';
import '../test/expect.extensions';

describe('calc tags for module', () => {
  const root = '/project' as FsPath;
  it('should identify root as root', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: 'domain:abc',
      }),
    ).toEqual(['root']);
  });

  it('should calc for static value', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: 'domain:abc',
      }),
    ).toEqual(['domain:abc']);
  });

  it('should match directory names with a - and +', () => {
    const moduleDir = '/project/+feat-booking' as FsPath;
    expect(
      calcTagsForModule(moduleDir, root, {
        '+feat-booking': 'feature:booking',
      }),
    ).toEqual(['feature:booking']);
  });

  it('multiple tags', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: ['domain:abc', 'type:generic'],
      }),
    ).toEqual(['domain:abc', 'type:generic']);
  });

  it('should throw if leaf has not tags', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc/def/ghj' as FsPath;

    expect(() =>
      calcTagsForModule(moduleDir, rootDir, {
        abc: {
          def: {
            ghj: {},
          },
        },
      }),
    ).toThrowUserError(new TagWithoutValueError('abc/def/ghj'));
  });

  it('should allow a function returning a string', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: (_, { segment }) => `module:${segment}`,
      }),
    ).toEqual(['module:abc']);
  });

  it('should allow a function returning a string array', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        abc: (_, { segment }) => [`domain:${segment}`, 'type:lib'],
      }),
    ).toEqual(['domain:abc', 'type:lib']);
  });

  it('should support regular expressions', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/abc' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '/(\\w+)/': (_, { regexMatch }) =>
          `domain:${throwIfNull(regexMatch)[0]}`,
      }),
    ).toEqual(['domain:abc']);
  });

  it('should support a placeholder', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '<domain>': ({ domain }) => `domain:${domain}`,
      }),
    ).toEqual(['domain:holidays']);
  });

  it('should support a placeholder with a dash', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/app1/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '<domain>/<sub-domain>': (tags) => [
          `domain:${tags['domain']}:${tags['sub-domain']}`,
        ],
      }),
    ).toEqual(['domain:app1:holidays']);
  });

  it('should support a placeholder with a dash underscore', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/app1/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '<app-lib>/<_domain>': 'domain:<app-lib>:<_domain>',
      }),
    ).toEqual(['domain:app1:holidays']);
  });

  it('should support placeholders in both matcher and tag value', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '<domain>': 'domain:<domain>',
      }),
    ).toEqual(['domain:holidays']);
  });

  it('should support multiple placeholders', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/feat-bookings' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '<type>-<subdomain>': ['type:<type>', 'subdomain:<subdomain>'],
      }),
    ).toEqual(['type:feat', 'subdomain:bookings']);
  });

  it('should throw if a placeholder in the tag value does not exist', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/feat-bookings' as FsPath;

    expect(() =>
      calcTagsForModule(moduleDir, rootDir, {
        '<subdomain>': ['type:<type>', 'subdomain:<subdomain>'],
      }),
    ).toThrowUserError(
      new InvalidPlaceholderError('<type>', '/project/feat-bookings'),
    );
  });

  it('should support a full placeholder with directory names - or +', () => {
    const moduleDir = '/project/+feat-booking' as FsPath;
    expect(
      calcTagsForModule(moduleDir, root, {
        '<path>': 'feature:booking',
      }),
    ).toEqual(['feature:booking']);
  });

  it('should support a partial placeholder', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/feature-holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'feature-<domain>': ({ domain }) => `domain:${domain}`,
      }),
    ).toEqual(['domain:holidays']);
  });

  it('should allow config key to have multiple paths', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src/app/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'src/app/holidays': ['domain:holidays'],
      }),
    ).toEqual(['domain:holidays']);
  });

  it('should return "noTag" on no match and enabled autoTagging', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'src/app/holidays': { tags: ['domain:holidays'] },
      }),
    ).toEqual(['noTag']);
  });

  it('should throw an error if there is no match', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src' as FsPath;

    expect(() =>
      calcTagsForModule(
        moduleDir,
        rootDir,
        {
          'src/app/holidays': { tags: ['domain:holidays'] },
        },
        false,
      ),
    ).toThrowUserError(new NoAssignedTagError('/project/src'));
  });

  it('should skip rules that do not apply', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        customers: 'domain:customers',
        holidays: 'domain:holidays',
      }),
    ).toEqual(['domain:holidays']);
  });

  it('should always pick the first rule that applies', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '<domain>': 'domain:holidays',
        holidays: 'scope:holidays',
      }),
    ).toEqual(['domain:holidays']);
  });

  it('should support multiple placeholders', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/domain/holidays/data' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'domain/<feature>/<type>': ({ feature, type }) => [
          `domain:${feature}`,
          `type:${type}`,
        ],
      }),
    ).toEqual(['domain:holidays', 'type:data']);
  });

  it('should allow nested paths', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src/app/domain/customers/ui' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'src/app/domain': {
          '<domain>/<type>': ({ domain, type }) => [
            `domain:${domain}`,
            `type:${type}`,
          ],
        },
      }),
    ).toEqual(['domain:customers', 'type:ui']);
  });

  it('should allow nested paths with multiple matchers', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/src/app/shared/ngrx-util' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'src/app': {
          'shared/<type>': ({ type }) => [`type:${type}`],
          '<domain>/<type>': [],
        },
      }),
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
            '<domain>': {
              '<subDomain>': {
                '<type>': (placeholders) => [
                  `domain:${placeholders['domain']}`,
                  `subDomain:${placeholders['subDomain']}`,
                  `type:${placeholders['type']}`,
                ],
              },
            },
          },
        },
      }),
    ).toEqual(['domain:holidays', 'subDomain:core', 'type:feature']);
  });

  it('should return noTag on partial match', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/domain/holidays/feature' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        domain: '',
      }),
    ).toEqual(['noTag']);
  });

  it('should throw an error on partial match and disabled auto-tagging', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/domain/holidays/feature' as FsPath;

    expect(() =>
      calcTagsForModule(
        moduleDir,
        rootDir,
        {
          domain: '',
        },
        false,
      ),
    ).toThrowUserError(new NoAssignedTagError(moduleDir));
  });

  it('should throw an error if the placeholder already exists', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays/feature' as FsPath;

    expect(() =>
      calcTagsForModule(moduleDir, rootDir, {
        '<str>': {
          '<str>': ['noop'],
        },
      }),
    ).toThrowUserError(new ExistingTagPlaceholderError('str'));
  });

  it('should not treat a regex as catch-all matcher', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays-123' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '/(\\w+)/': 'regex',
        'holidays-123': 'simple match',
      }),
    ).toEqual(['simple match']);
  });

  it('should not treat a placeholder as catch-all matcher', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays-123' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '<feature>_<id>': 'placeholder',
        'holidays-123': 'simple match',
      }),
    ).toEqual(['simple match']);
  });

  it('should match nested modules', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/libs/customers/src/lib/data' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'libs/customers': '',
        'libs/customers/src/lib/data': 'data',
      }),
    ).toEqual(['data']);
  });

  it('should not throw an error with nested modules and placeholders', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/libs/holidays/src/lib/data' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        libs: {
          '<domain>/src': 'nx-lib',
          '<domain>/src/lib/<type>': ['domain:<domain>', 'type:<type>'],
        },
      }),
    ).toEqual(['domain:holidays', 'type:data']);
  });

  it('should same placeholders in different configs', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/domain/holidays/data' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        'domain/<feature>/<type>': ({ feature, type }) => [
          `domain:${feature}`,
          `type:${type}`,
        ],
      }),
    ).toEqual(['domain:holidays', 'type:data']);
  });

  it('should have the same placeholders in different rules rules', () => {
    const rootDir = '/project' as FsPath;
    const moduleDir = '/project/holidays/data' as FsPath;

    expect(
      calcTagsForModule(moduleDir, rootDir, {
        '<domain>': ['domain:holidays', 'type:feature'],
        '<domain>/data': ['domain:holidays', 'type:data'],
      }),
    ).toEqual(['domain:holidays', 'type:data']);
  });
});
