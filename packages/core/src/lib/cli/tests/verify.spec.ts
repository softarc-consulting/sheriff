import { beforeEach, describe, expect, vitest, it, vi } from 'vitest';
import { createProject } from '../../test/project-creator';
import { tsConfig } from '../../test/fixtures/ts-config';
import { main } from '../main';
import { sheriffConfig } from '../../test/project-configurator';
import { verifyCliWrappers } from './verify-cli-wrapper';
import { mockCli } from './helpers/mock-cli';
import { JsonReporter } from '../internal/reporter/json/json-reporter';
import { JunitReporter } from '../internal/reporter/junit/junit-reporter';

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

  describe('Reporter integration', () => {
    it('should create reports for single project workspace', () => {
      mockCli();

      // Spy on reporter createReport methods
      const jsonReporterSpy = vi.spyOn(JsonReporter.prototype, 'createReport');
      const junitReporterSpy = vi.spyOn(
        JunitReporter.prototype,
        'createReport',
      );

      createProject({
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          reporters: ['json', 'junit'],
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
          'main.ts': ['./holidays', './customers'],
          holidays: {
            'index.ts': ['./holidays.component'],
            'holidays.component.ts': ['../customers'], // violation
          },
          customers: { 'index.ts': [] },
        },
      });

      main('verify', 'src/main.ts');

      expect(jsonReporterSpy).toHaveBeenCalledTimes(1);
      expect(junitReporterSpy).toHaveBeenCalledTimes(1);
    });

    it('should create reports for multi-project workspace', () => {
      mockCli();

      const jsonReporterSpy = vi.spyOn(JsonReporter.prototype, 'createReport');
      const junitReporterSpy = vi.spyOn(
        JunitReporter.prototype,
        'createReport',
      );

      createProject({
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          entryPoints: {
            'project-i': 'projects/project-i/src/main.ts',
            'project-ii': 'projects/project-ii/src/main.ts',
          },
          depRules: {},
          reporters: ['json', 'junit'],
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

      expect(jsonReporterSpy).toHaveBeenCalledTimes(2);
      expect(junitReporterSpy).toHaveBeenCalledTimes(2);
    });

    it('should not create reports when no reporters are configured', () => {
      mockCli();

      const jsonReporterSpy = vi.spyOn(JsonReporter.prototype, 'createReport');
      const junitReporterSpy = vi.spyOn(
        JunitReporter.prototype,
        'createReport',
      );

      createProject({
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          modules: {
            'src/customers': ['customers'],
          },
          depRules: {
            root: ['customers'],
            customers: [],
          },
        }),
        src: {
          'main.ts': ['./customers'],
          customers: { 'index.ts': [] },
        },
      });

      main('verify', 'src/main.ts');

      expect(jsonReporterSpy).not.toHaveBeenCalled();
      expect(junitReporterSpy).not.toHaveBeenCalled();
    });

    it('should create reports even when no violations found', () => {
      mockCli();

      const jsonReporterSpy = vi.spyOn(JsonReporter.prototype, 'createReport');

      createProject({
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          reporters: ['json'],
          modules: {
            'src/customers': ['customers'],
          },
          depRules: {
            root: ['customers'],
            customers: [],
          },
        }),
        src: {
          'main.ts': ['./customers'],
          customers: { 'index.ts': [] },
        },
      });

      main('verify', 'src/main.ts');

      expect(jsonReporterSpy).toHaveBeenCalledTimes(1);
    });
  });
});
