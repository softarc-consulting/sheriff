import { beforeEach, describe, expect, vitest } from 'vitest';
import { verify } from './verify';
import { createProject } from '../test/project-creator';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { sheriffConfig } from '../test/project-configurator';

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
      'tsconfig.json': tsconfigMinimal,
      src: {
        'main.ts': [''],
      },
    });

    verify('/project', cli, ['src/main.ts']);

    expect(allLogs()).toBe(`\

\u001b[32mNo issues found. The project is clean.`);
    expect(allErrorLogs()).toBe('');
  });

  it('should find errors', () => {
    const { cli, allLogs, allErrorLogs } = setup();

    createProject({
      'tsconfig.json': tsconfigMinimal,
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

    expect(allLogs()).toBe(`\
/project/src/main.ts
--------------------
Deep Imports
  ./customers/data
/project/src/holidays/holidays.component.ts
-------------------------------------------
Dependency Rule Violations
  from tags:holidays, to:customers`);

    expect(allErrorLogs()).toBe(`\
Issues found in
  Files: 2
  Deep Imports: 1
  Dependency Rule Violations: 1`);
  });
});
