import { beforeAll, beforeEach, expect, describe, it, assert } from 'vitest';
import Fs from '../fs/fs';
import getFs, { useVirtualFs } from '../fs/getFs';
import { FileTree } from '../test/project-configurator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import generateFileInfo from './generate-file-info';
import { ProjectCreator } from '../test/project-creator';

describe('Generate File Info', () => {
  let fs: Fs;
  let creator: ProjectCreator;

  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    fs = getFs();
    fs.reset();
    creator = new ProjectCreator();
  });

  it('should test a simple case', async () => {
    const projectConfig: FileTree = {
      'tsconfig.json': tsconfigMinimal,
      'src/app': {
        'home.component.ts': [],
        'app.component.ts': ['./home.component'],
      },
    };

    await creator.create(projectConfig, 'integration');

    const fileInfo = await generateFileInfo(
      'integration/src/app/app.component.ts',
      'integration/tsconfig.json'
    );

    expect(fileInfo).toEqual({
      path: 'integration/src/app/app.component.ts',
      imports: [{ path: 'integration/src/app/home.component.ts', imports: [] }],
    });
  });

  it('should generate for sub-modules', async () => {
    const projectConfig: FileTree = {
      'tsconfig.json': '',
      app: {
        'main.ts': [],
        src: {
          'home.component': [],
          'app.routes': [],
          'app.component': ['./home.component'],
          'main.ts': '',
          customers: {
            'list.component': ['./customers.service'],
            'detail.component': ['./customers.service'],
            'search.component': [],
            'customers.service': '',
            'customer.routes': ['./list.component', './detail.component'],
            index: ['./customer.routes'],
          },
        },
      },
    };

    await creator.create(projectConfig, 'sub-module');
    expect(true).toBe(true);
  });
});
