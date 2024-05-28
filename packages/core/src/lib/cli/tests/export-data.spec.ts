import { describe, it, expect } from 'vitest';
import { mockCli } from './helpers/mock-cli';
import { createProject } from '../../test/project-creator';
import { tsConfig } from '../../test/fixtures/ts-config';
import { sheriffConfig } from '../../test/project-configurator';
import { exportData } from '../export';

describe('export data', () => {
  it.skip('should test a simple application', () => {
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
            'index.ts': ['./holiday-container.component.ts'],
            'holiday-container.component.ts': ['../data', '../ui', '../model'],
          },
          data: {
            'holiday-store.ts': ['../model'],
            'index.ts': './holiday-store',
          },
          ui: {
            'index.ts': './holidays.component',
            'holidays.component.ts': ['../model'],
          },
          model: { 'index.ts': './holiday.ts', 'holiday.ts': [] },
        },
      },
    });

    exportData('src/main.ts');

    expect(allLogs()).toEqual(
      JSON.stringify({
        'src/main.ts': {
          module: '.',
          tags: 'root',
          imports: ['src/holidays/feature/index.ts'],
        },
        'src/holidays/feature/index.ts': {
          module: 'src/holidays/feature',
          tags: ['domain:holidays', 'type:feature'],
          imports: ['src/holidays/feature/holiday-container.component.ts'],
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
      }),
    );
  });

  it('should avoid circular dependencies', () => {});
  it('should skip not reachable files', () => {});
});
