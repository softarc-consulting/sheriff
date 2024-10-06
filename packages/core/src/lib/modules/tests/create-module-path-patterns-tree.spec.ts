import { createModulePathPatternsTree } from '../internal/create-module-path-patterns-tree';
import { describe, expect, it } from 'vitest';

describe('createModulePathPatternsTree', () => {
  it('should group modules with same base path', () => {
    const patterns = ['src/app/feat-*-module/*', 'src/app/services/*', 'src/app/customers'];

    const tree = createModulePathPatternsTree(patterns);

    expect(tree).toEqual({
      src: {
        app: {
          'feat-*-module': {
            '*': {},
          },
          services: {
            '*': {},
          },
          customers: {}
        },
      },
    });
  });

  it('should group modules with multiple base paths', () => {
    const patterns = [
      'src/app/feat-*-module/*',
      'src/app/services',
      'src/lib/util',
      'src/assets/images',
    ];

    const tree = createModulePathPatternsTree(patterns);
    expect(tree).toEqual({
      src: {
        app: {
          'feat-*-module': {'*': {}},
          services: {},
        },
        lib: {
          util: {
          },
        },
        assets: {
          images: {},
        },
      },
    });
  });

  it('should group patterns for nested modules', () => {
    const patterns = ['src/lib', 'src/lib/util', 'src/lib/util/*'];

    const tree = createModulePathPatternsTree(patterns);

    expect(tree).toEqual({
      src: {
        lib: {
          '': {},
          util: {
            '': {},
            '*': {},
          },
        },
      },
    });
  });
});
