import { FileTree } from '../../test/project-configurator';
import { createProject } from "../../test/project-creator";
import { generateTsData } from "../generate-ts-data";
import { FsPath, toFsPath } from "../fs-path";
import UnassignedFileInfo, { buildFileInfo } from "../unassigned-file-info";
import { tsConfig } from "../../test/fixtures/ts-config";
import { ResolveFn, resolvePotentialTsPath, traverseFilesystem } from "../traverse-filesystem";
import { ResolvedModuleFull } from "typescript";
import { describe, it, expect } from 'vitest';

function setup(fileTree: FileTree): UnassignedFileInfo {
  createProject(fileTree);

  const tsData = generateTsData(toFsPath('/project/tsconfig.json'));
  const mainPath = toFsPath('/project/src/main.ts');

  return traverseFilesystem(mainPath, new Map<FsPath, UnassignedFileInfo>(), tsData);
}

describe('traverse filesystem', () => {
  it('should find a single import', () => {
    const fileInfo = setup({
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

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [
        ['./app/app.component.ts', ['./customers/customer.component.ts']],
      ]),
    );
  });

  it('should work with paths', () => {
    const fileInfo = setup({
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

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [
        ['./app/app.component.ts', ['./customers/index.ts']],
      ]),
    );
  });

  it('should pick up dynamic imports', () => {
    const fileInfo = setup({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': `const routes = {[path: 'customers', loadChildren: () => import('./customers/index.ts')]};`,
        customers: {
          'index.ts': [],
        },
      },
    });

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [['./customers/index.ts', []]]),
    );
  });

  it('should pick index.ts automatically if path is a directory', () => {
    const fileInfo = setup({
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

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [
        ['./app/app.component.ts', ['./customers/index.ts']],
      ]),
    );
  });

  it('should automatically pick the file extension if missing in path', () => {
    const fileInfo = setup({
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

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [
        ['./app/app.component.ts', ['./customers/index.ts']],
      ]),
    );
  });

  it('should ignore an import if a non-wildcard path is used like a wildcard', () => {
    const fileInfo = setup({
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

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [['./app/app.component.ts', []]]),
    );
  });

  it('should find a path with wildcards', () => {
    const fileInfo = setup({
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

    expect(fileInfo).toEqual(
      buildFileInfo('/project/src/main.ts', [
        ['./app/app.component.ts', ['./customers/customers.component.ts']],
      ]),
    );
  });

  describe('base url', () => {
    it('should resolve static imports', () => {
      const fileInfo = setup({
        'tsconfig.json': tsConfig({ baseUrl: 'src' }),
        src: {
          'main.ts': ['app/app.component.ts'],
          app: {
            'app.component.ts': [],
          },
        },
      });

      expect(fileInfo).toEqual(
        buildFileInfo('/project/src/main.ts', [['./app/app.component.ts', []]]),
      );
    });

    it('cannot resolve static imports if baseUrl is not set', () => {
      const fileInfo = setup({
        'tsconfig.json': tsConfig({baseUrl: undefined}),
        src: {
          'main.ts': ['src/app/app.component.ts'],
          app: {
            'app.component.ts': [],
          },
        },
      });

      expect(fileInfo).toEqual(buildFileInfo('/project/src/main.ts', []));
    });
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
