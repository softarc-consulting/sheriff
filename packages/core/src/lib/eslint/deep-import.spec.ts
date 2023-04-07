import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FileTree } from '../test/project-configurator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { ProjectCreator } from '../test/project-creator';
import getFs, { useVirtualFs } from '../1-fs/getFs';
import { hasDeepImport } from './deep-import';

describe('deep import', () => {
  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    getFs().reset();
  });

  it('should find a deep import', () => {
    const fileTree: FileTree = {
      'tsconfig.json': tsconfigMinimal,
      src: {
        'main.ts': ['./app/app.component', './app/app.routes'],
        app: {
          'app.routes.ts': ['./home.component', './customers/index'],
          'app.component.ts': ['./customers/customer.component'],
          customers: {
            'customer.component.ts': [],
            'customer.routes.ts': ['./customer.component'],
            'index.ts': ['./customer.routes'],
          },
        },
      },
    };
    new ProjectCreator().create(fileTree, '/project');

    expect(
      hasDeepImport(
        '/project/src/app/app.component.ts',
        './customers/customer.component',
        true
      )
    ).toBe(true);
  });
});
