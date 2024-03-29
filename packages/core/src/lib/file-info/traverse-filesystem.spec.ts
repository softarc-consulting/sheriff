import { beforeEach, describe, expect, it } from 'vitest';
import { FileTree } from '../test/project-configurator';
import { createProject } from '../test/project-creator';
import traverseFilesystem, {
  ResolveFn,
  resolvePotentialTsPath,
} from './traverse-filesystem';
import { FsPath, toFsPath } from './fs-path';
import UnassignedFileInfo, { buildFileInfo } from './unassigned-file-info';
import { generateTsData } from './generate-ts-data';
import { ResolvedModuleFull } from 'typescript';
import { tsConfig } from '../test/fixtures/ts-config';

function setup(fileTree: FileTree) {
  createProject(fileTree);

  const tsData = generateTsData(toFsPath('/project/tsconfig.json'));
  const mainPath = toFsPath('/project/src/main.ts');

  return { tsData, mainPath };
}

describe('traverse file-system', () => {
  let fileInfoDict: Map<FsPath, UnassignedFileInfo>;

  beforeEach(() => {
    fileInfoDict = new Map<FsPath, UnassignedFileInfo>();
  });

  it('should find a single import', () => {
    const { tsData, mainPath } = setup({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': ['./app/app.component'],
        app: {
          'app.component.ts': ['./customers/customer.component'],
          customers: {
            'customer.component.ts': [],
          },
        },
      },
    });
    const fileInfo = traverseFilesystem(mainPath, fileInfoDict, tsData);

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [
        ['./app/app.component.ts', ['./customers/customer.component.ts']],
      ]),
    );
  });

  it('should work with paths', () => {
    const { tsData, mainPath } = setup({
      'tsconfig.json': tsConfig({
        paths: {
          '@customers': ['/src/app/customers/index.ts'],
        },
      }),
      src: {
        'main.ts': ['./app/app.component'],
        app: {
          'app.component.ts': ['@customers'],
          customers: {
            'index.ts': [],
          },
        },
      },
    });
    const fileInfo = traverseFilesystem(mainPath, fileInfoDict, tsData);

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [
        ['./app/app.component.ts', ['./customers/index.ts']],
      ]),
    );
  });

  it('should pick up dynamic imports', () => {
    const { mainPath, tsData } = setup({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': `const routes = {[path: 'customers', loadChildren: () => import('./customers/index.ts')]};`,
        customers: {
          'index.ts': [],
        },
      },
    });
    const fileInfo = traverseFilesystem(mainPath, fileInfoDict, tsData);

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [['./customers/index.ts', []]]),
    );
  });

  it('should pick index.ts automatically if path is a directory', () => {
    const { tsData, mainPath } = setup({
      'tsconfig.json': tsConfig({
        paths: { '@customers': ['/src/app/customers'] },
      }),
      src: {
        'main.ts': ['./app/app.component'],
        app: {
          'app.component.ts': ['@customers'],
          customers: {
            'index.ts': [],
          },
        },
      },
    });
    const fileInfo = traverseFilesystem(mainPath, fileInfoDict, tsData);

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [
        ['./app/app.component.ts', ['./customers/index.ts']],
      ]),
    );
  });

  it('should automatically pick the file extension if missing in path', () => {
    const { tsData, mainPath } = setup({
      'tsconfig.json': tsConfig({
        paths: { '@customers': ['/src/app/customers/index'] },
      }),
      src: {
        'main.ts': ['./app/app.component'],
        app: {
          'app.component.ts': ['@customers'],
          customers: {
            'index.ts': [],
          },
        },
      },
    });
    const fileInfo = traverseFilesystem(mainPath, fileInfoDict, tsData);

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [
        ['./app/app.component.ts', ['./customers/index.ts']],
      ]),
    );
  });

  it('should ignore an import if a non-wildcard path is used like a wildcard', () => {
    const { tsData, mainPath } = setup({
      'tsconfig.json': tsConfig({
        paths: { '@customers': ['/src/app/customers'] },
      }),
      src: {
        'main.ts': ['./app/app.component'],
        app: {
          'app.component.ts': ['@customers/customers.component'],
          customers: {
            'customers.component.ts': [],
            'customers.service.ts': [],
          },
        },
      },
    });
    const fileInfo = traverseFilesystem(mainPath, fileInfoDict, tsData);

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [['./app/app.component.ts', []]]),
    );
  });

  it('should find a path with wildcards', () => {
    const { tsData, mainPath } = setup({
      'tsconfig.json': tsConfig({ paths: { '@app/*': ['/src/app/*'] } }),
      src: {
        'main.ts': ['@app/app.component'],
        app: {
          'app.component.ts': ['@app/customers/customers.component'],
          customers: {
            'customers.component.ts': [],
          },
        },
      },
    });
    const fileInfo = traverseFilesystem(mainPath, fileInfoDict, tsData);

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [
        ['./app/app.component.ts', ['./customers/customers.component.ts']],
      ]),
    );
  });

  it('should use a non-standard baseUrl', () => {
    const { tsData, mainPath } = setup({
      'tsconfig.json': tsConfig({
        paths: { '@app/*': ['app/*'] },
        baseUrl: 'src',
      }),
      src: {
        'main.ts': ['@app/app.component.ts'],
        app: {
          'app.component.ts': [],
        },
      },
    });
    const fileInfo = traverseFilesystem(mainPath, fileInfoDict, tsData);

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [['./app/app.component.ts', []]]),
    );
  });

  it('should throw an error in resolvePotentialTsPath when path is a nodeJs dependency', () => {
    const resolveFn: ResolveFn = () => ({
      resolvedModule: { isExternalLibraryImport: true } as ResolvedModuleFull,
    });

    expect(() =>
      resolvePotentialTsPath(
        '@customers',
        {
          '@customers': '/project/src/app/customers/index.ts' as FsPath,
        },
        resolveFn,
        'home.component.ts',
      ),
    ).toThrow('unable to resolve import @customers in home.component.ts');
  });
});
