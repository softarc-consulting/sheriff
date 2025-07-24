import { beforeEach, describe, expect, vitest, it } from 'vitest';
import { createProject } from '../../test/project-creator';
import { tsConfig } from '../../test/fixtures/ts-config';
import { main } from '../main';
import { sheriffConfig } from '../../test/project-configurator';
import { verifyCliWrappers } from './verify-cli-wrapper';
import { mockCli } from './helpers/mock-cli';

describe('verify', () => {
  beforeEach(() => {
    vitest.restoreAllMocks();
  });

  verifyCliWrappers('verify', 'src/main.ts');

  it('should find no errors', () => {
    const { allLogs, allErrorLogs } = mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': [''],
      },
    });

    main('verify', 'src/main.ts');

    expect(allErrorLogs()).toMatchSnapshot('error');
    expect(allLogs()).toMatchSnapshot('log');
  });

  it('should find errors', () => {
    const { allLogs, allErrorLogs } = mockCli();

    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        modules: {
          'src/customers': ['customers'],
          'src/holidays': ['holidays'],
        },
        depRules: {
          root: ['customers', 'holidays'],
          customers: [],
          holidays: [],
        },
      }),
      src: {
        'main.ts': ['./holidays', './customers', './customers/data'],
        holidays: {
          'index.ts': ['./holidays.component'],
          'holidays.component.ts': ['../customers'],
        },
        customers: { 'index.ts': [], 'data.ts': [] },
      },
    });

    main('verify', 'src/main.ts');

    expect(allErrorLogs()).toMatchSnapshot('error.log');
    expect(allLogs()).toMatchSnapshot('logs.log');
  });

  it('should find errors without sheriff.config.ts', () => {
    const { allLogs, allErrorLogs } = mockCli();

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

    main('verify', 'src/main.ts');

    expect(allErrorLogs()).toMatchSnapshot('error.log');
    expect(allLogs()).toMatchSnapshot('logs.log');
  });

  describe('Multi project setup', () => {
    it('should find no errors when passing a single entryPoint', () => {
      const { allLogs, allErrorLogs } = mockCli();

      createProject({
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          depRules: {},
          entryPoints: {
            'project-i': 'projects/project-i/src/main.ts',
            'project-ii': 'projects/project-ii/src/main.ts',
          },
        }),
        projects: {
          'project-i': {
            src: {
              'main.ts': [],
              'app.ts': [],
            },
          },
          'project-ii': {
            src: {
              'main.ts': [],
              'app.ts': [],
            },
          },
        },
      });

      main('verify', 'project-i');

      expect(allErrorLogs()).toMatchSnapshot('error');
      expect(allLogs()).toMatchSnapshot('log');
    });
    it('should find no errors when passing multiple entryPoints', () => {
      const { allLogs, allErrorLogs } = mockCli();

      createProject({
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          depRules: {},
          entryPoints: {
            'project-i': 'projects/project-i/src/main.ts',
            'project-ii': 'projects/project-ii/src/main.ts',
          },
        }),
        projects: {
          'project-i': {
            src: {
              'main.ts': [],
              'app.ts': [],
            },
          },
          'project-ii': {
            src: {
              'main.ts': [],
              'app.ts': [],
            },
          },
        },
      });

      main('verify', 'project-i,project-ii');

      expect(allErrorLogs()).toMatchSnapshot('error');
      expect(allLogs()).toMatchSnapshot('log');
    });

    it('should find errors', () => {
      const { allLogs, allErrorLogs } = mockCli();

      createProject({
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          entryPoints: {
            'project-i': 'projects/project-i/src/main.ts',
            'project-ii': 'projects/project-ii/src/main.ts',
          },
          modules: {
            'projects/project-i': {
              'src/customers': ['customers'],
              'src/holidays': ['holidays'],
            },
          },
          depRules: {
            root: ['customers', 'holidays'],
            customers: [],
            holidays: [],
          },
        }),
        projects: {
          'project-i': {
            src: {
              'main.ts': ['./holidays', './customers', './customers/data'],
              holidays: {
                'index.ts': ['./holidays.component'],
                'holidays.component.ts': ['../customers'],
              },
              customers: { 'index.ts': [], 'data.ts': [] },
            },
          },
          'project-ii': {
            src: {
              'main.ts': [],
              'app.ts': [],
            },
          },
        },
      });

      main('verify');

      expect(allErrorLogs()).toMatchSnapshot('error.log');
      expect(allLogs()).toMatchSnapshot('logs.log');
    });
  });
});
