import { FileTree } from '../test/project-configurator';
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { ProjectCreator } from '../test/project-creator';
import { useVirtualFs } from '../fs/getFs';

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

describe('Sub Module', () => {
  let creator: ProjectCreator;

  beforeAll(() => {
    useVirtualFs();
  });

  beforeEach(() => {
    creator = new ProjectCreator();
  });

  it('should generate the files', async () => {
    await creator.create(projectConfig, 'sub-module');
    expect(true).toBe(true);
  });
});
