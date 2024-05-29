import { describe, it, expect } from 'vitest';
import { mockCli } from './helpers/mock-cli';
import { createProject } from '../../test/project-creator';
import { tsConfig } from '../../test/fixtures/ts-config';
import { sheriffConfig } from '../../test/project-configurator';
import { exportData } from '../export-data';

describe('export data', () => {
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
      src: {
        'main.ts': ['./holidays/feature'],
        holidays: {
          feature: {
            'index.ts': ['./holidays-container.component.ts'],
            'holidays-container.component.ts': ['../data', '../ui', '../model'],
          },
          data: {
            'index.ts': ['./holidays-store.ts'],
            'holidays-store.ts': ['../model'],
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

    expect(allLogs()).toEqual(
      JSON.stringify(
        {
          'src/main.ts': {
            module: '.',
            tags: ['root'],
            imports: ['src/holidays/feature/index.ts'],
          },
          'src/holidays/feature/index.ts': {
            module: 'src/holidays/feature',
            tags: ['domain:holidays', 'type:feature'],
            imports: ['src/holidays/feature/holidays-container.component.ts'],
          },
          'src/holidays/feature/holidays-container.component.ts': {
            module: 'src/holidays/feature',
            tags: ['domain:holidays', 'type:feature'],
            imports: [
              'src/holidays/data/index.ts',
              'src/holidays/ui/index.ts',
              'src/holidays/model/index.ts',
            ],
          },
          'src/holidays/data/index.ts': {
            module: 'src/holidays/data',
            tags: ['domain:holidays', 'type:data'],
            imports: ['src/holidays/data/holidays-store.ts'],
          },
          'src/holidays/data/holidays-store.ts': {
            module: 'src/holidays/data',
            tags: ['domain:holidays', 'type:data'],
            imports: ['src/holidays/model/index.ts'],
          },
          'src/holidays/model/index.ts': {
            module: 'src/holidays/model',
            tags: ['domain:holidays', 'type:model'],
            imports: ['src/holidays/model/holiday.ts'],
          },
          'src/holidays/model/holiday.ts': {
            module: 'src/holidays/model',
            tags: ['domain:holidays', 'type:model'],
            imports: [],
          },
          'src/holidays/ui/index.ts': {
            module: 'src/holidays/ui',
            tags: ['domain:holidays', 'type:ui'],
            imports: ['src/holidays/ui/holidays.component.ts'],
          },
          'src/holidays/ui/holidays.component.ts': {
            module: 'src/holidays/ui',
            tags: ['domain:holidays', 'type:ui'],
            imports: ['src/holidays/model/index.ts'],
          },
        },
        null,
        '  ',
      ),
    );
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

    expect(allLogs()).toEqual(
      JSON.stringify(
        {
          'src/main.ts': {
            module: '.',
            tags: ['root'],
            imports: ['src/app1.service.ts', 'src/app2.service.ts'],
          },
          'src/app1.service.ts': {
            module: '.',
            tags: ['root'],
            imports: ['src/app2.service.ts'],
          },
          'src/app2.service.ts': {
            module: '.',
            tags: ['root'],
            imports: ['src/app1.service.ts'],
          },
        },
        null,
        '  ',
      ),
    );
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

    expect(allLogs()).toEqual(
      JSON.stringify(
        {
          'src/main.ts': {
            module: '.',
            tags: ['root'],
            imports: ['src/app1.service.ts'],
          },
          'src/app1.service.ts': {
            module: '.',
            tags: ['root'],
            imports: [],
          },
        },
        null,
        '  ',
      ),
    );
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

    expect(allLogs()).toEqual(
      JSON.stringify(
        {
          'src/main.ts': {
            module: '.',
            tags: ['root'],
            imports: ['src/holidays/index.ts', 'src/customers/index.ts'],
          },
          'src/holidays/index.ts': {
            module: 'src/holidays',
            tags: ['scope:holidays'],
            imports: [],
          },
          'src/customers/index.ts': {
            module: 'src/customers',
            tags: ['scope:customers'],
            imports: [],
          },
        },
        null,
        '  ',
      ),
    );
  });
});
