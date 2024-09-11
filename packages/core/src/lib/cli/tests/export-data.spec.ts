import { describe, it, expect } from 'vitest';
import { mockCli } from './helpers/mock-cli';
import { createProject } from '../../test/project-creator';
import { tsConfig } from '../../test/fixtures/ts-config';
import { sheriffConfig } from '../../test/project-configurator';
import { exportData } from '../export-data';
import { verifyCliWrappers } from './verify-cli-wrapper';

describe('export data', () => {
  verifyCliWrappers('export', 'src/main.ts', false);

  it('should test a simple application', () => {
    const { allLogs } = mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        tagging: {
          'src/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
        },
        depRules: {},
      }),
      node_modules: {
        lodash: { 'index.js': [] },
        '@ngrx/signals': { 'index.js': [] },
      },
      src: {
        'main.ts': ['./holidays/feature'],
        holidays: {
          feature: {
            'index.ts': ['./holidays-container.component.ts'],
            'holidays-container.component.ts': [
              '../data',
              '../ui',
              '../model',
              'lodash',
            ],
          },
          data: {
            'index.ts': ['./holidays-store.ts'],
            'holidays-store.ts': ['../model', '@ngrx/signals'],
          },
          ui: {
            'index.ts': ['./holidays.component'],
            'holidays.component.ts': ['../model'],
          },
          model: { 'index.ts': ['./holiday.ts'], 'holiday.ts': [] },
        },
      },
    });

    exportData('src/main.ts');

    expect(allLogs()).toMatchSnapshot('simple-application');
  });

  it('should avoid circular dependencies', () => {
    const { allLogs } = mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': ['./app1.service.ts', './app2.service.ts'],
        'app1.service.ts': ['./app2.service.ts'],
        'app2.service.ts': ['./app1.service.ts'],
      },
    });

    exportData('src/main.ts');

    expect(allLogs()).toMatchSnapshot('circular-dependencies');
  });

  it('should skip not reachable files', () => {
    const { allLogs } = mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': ['./app1.service.ts'],
        'app1.service.ts': [],
        'app2.service.ts': [],
      },
    });

    exportData('src/main.ts');

    expect(allLogs()).toMatchSnapshot('not-reachable-files');
  });

  it('should also work with a sheriff.config.ts', () => {
    const { allLogs } = mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        tagging: { 'src/<scope>': 'scope:<scope>' },
        depRules: {},
      }),
      src: {
        'main.ts': ['./holidays', './customers'],
        holidays: {
          'index.ts': [],
        },
        customers: {
          'index.ts': [],
        },
      },
    });

    exportData('src/main.ts');

    expect(allLogs()).toMatchSnapshot('sheriff-config');
  });
});
