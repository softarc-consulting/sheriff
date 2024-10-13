import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { createProject } from '../../test/project-creator';
import { tsConfig } from '../../test/fixtures/ts-config';
import { main } from '../main';
import { sheriffConfig } from '../../test/project-configurator';
import { verifyCliWrappers } from './verify-cli-wrapper';
import { mockCli } from './helpers/mock-cli';

describe('list', () => {
  beforeEach(() => {
    vitest.restoreAllMocks();
  });

  it('should list modules without sheriff config', () => {
    const { allLogs } = mockCli();

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

    main('list', 'src/main.ts');

    expect(allLogs()).toMatchSnapshot('log');
  });

  it('should show tags in modules', () => {
    const { allLogs } = mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        modules: {
          'src/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
        },
        depRules: {},
      }),
      src: {
        'main.ts': [],
        holidays: {
          feature: {
            'index.ts': [],
          },
          data: {
            'index.ts': [],
          },
        },
        customers: {
          ui: {
            'index.ts': [],
          },
          model: {
            'index.ts': [],
          },
        },
      },
    });

    main('list', 'src/main.ts');

    expect(allLogs()).toMatchSnapshot('log');
  });

  it('should work with nested modules (Nx use case)', () => {
    const { allLogs } = mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        entryFile: 'apps/eternal/src/app/main.ts',
        modules: {
          libs: {
            'domains/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
            'shared/<shared>': ['shared:<shared>'],
          },
        },
        depRules: {},
      }),
      apps: {
        eternal: {
          src: {
            app: {
              'main.ts': ['../../../../libs/domains/holidays/feature'],
            },
          },
        },
      },
      libs: {
        domains: {
          holidays: {
            'index.ts': [],
            feature: {
              'index.ts': ['../data'],
            },
            data: {
              'index.ts': [
                '../feature',
                '../../shared/http',
                '../../shared/form',
              ],
            },
          },
        },
        shared: {
          'index.ts': [],
          http: {
            'index.ts': [],
          },
          form: {
            'index.ts': [],
          },
        },
      },
    });

    main('list');

    expect(allLogs()).toMatchSnapshot('log');
  });

  it('should include modules not reachable by entryFile', () => {
    const { allLogs } = mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        modules: {
          'src/<domain>/<type>': ['domain:<domain>', 'type:<type>'],
        },
        depRules: {},
        entryFile: 'src/main.ts',
      }),
      src: {
        'main.ts': [],
        holidays: {
          feature: {
            'index.ts': [],
          },
          data: {
            'index.ts': [],
          },
        },
        customers: {
          ui: {
            'index.ts': [],
          },
          model: {
            'index.ts': [],
          },
        },
      },
    });

    main('list');

    expect(allLogs()).toMatchSnapshot('log');
  });

  verifyCliWrappers('list', 'src/main.ts');
});
