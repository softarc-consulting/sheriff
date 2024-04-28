import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { mockCli } from '../test/mock-cli';
import { createProject } from '../test/project-creator';
import { tsConfig } from '../test/fixtures/ts-config';
import { list } from './list';

describe('list', () => {
  beforeEach(() => {
    vitest.resetAllMocks();
  });
  it('should list modules without sheriff config', () => {
    const { cli, allLogs, allErrorLogs } = mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': ['./holidays', './customers', './customers/data'],
        holidays: {
          'index.ts': ['./holidays.component'],
          'holidays.component.ts': ['../customers'],
        },
        customers: { 'index.ts': [], 'data.ts': [] },
      },
    });

    list(['src/main.ts'], cli);

    expect(allLogs()).toMatchSnapshot('log');
  });

  it('should list modules with  entry file', () => {});

  it('should throw if no entry file is passed or exists in the sheriff.config.ts', () => {});

  it('should tags in modules', () => {});
});
