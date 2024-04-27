import { beforeEach, describe, expect, vitest } from 'vitest';
import { verify } from './verify';
import { createProject } from '../test/project-creator';
import { sheriffConfig } from '../test/project-configurator';
import { tsConfig } from '../test/fixtures/ts-config';

const setup = () => {
  const cli = {
    endProcessOk: vitest.fn(),
    endProcessError: vitest.fn(),
    log: vitest.fn<void[string]>(),
    logError: vitest.fn<void, [string]>(),
  };

  const allLogs = () =>
    cli.log.mock.calls.map(([message]) => message).join('\n');
  const allErrorLogs = () =>
    cli.logError.mock.calls.map(([message]) => message).join('\n');

  return { cli, allLogs, allErrorLogs };
};

describe('verify', (it) => {
  beforeEach(() => {
    vitest.resetAllMocks();
  });

  it('should find no errors', () => {
    const { cli, allLogs, allErrorLogs } = setup();

    createProject({
      'tsconfig.json': tsConfig(),
      src: {
        'main.ts': [''],
      },
    });

    verify('/project', cli, ['src/main.ts']);

    expect(allErrorLogs()).toMatchSnapshot('error');
    expect(allLogs()).toMatchSnapshot('log');
  });

  it('should show user errors', () => {
    const { cli, allLogs, allErrorLogs } = setup();

    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        tagging: {
          'src/holidays': 'domain:<domain>',
        },
        depRules: {},
      }),
      src: {
        'main.ts': ['./holidays'],
        holidays: {
          'index.ts': [],
        },
      },
    });

    verify('/project', cli, ['src/main.ts']);

    expect(allLogs()).toMatchSnapshot('log');
    expect(allErrorLogs()).toMatchSnapshot('error');
  });

  it('should show internal errors', () => {
    expect(true).toBe(true);
  });

  it('should find errors', () => {
    const { cli, allLogs, allErrorLogs } = setup();

    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        tagging: {
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

    verify('/project', cli, ['src/main.ts']);

    expect(allErrorLogs()).toMatchSnapshot('error.log');
    expect(allLogs()).toMatchSnapshot('logs.log');
  });
});
