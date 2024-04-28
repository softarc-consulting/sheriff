import { vitest } from 'vitest';

export function mockCli() {
  const cli = {
    endProcessOk: vitest.fn(),
    endProcessError: vitest.fn(),
    log: vitest.fn<[string], void>(),
    logError: vitest.fn<[string], void>(),
  };

  const allLogs = () =>
    cli.log.mock.calls.map(([message]) => message).join('\n');
  const allErrorLogs = () =>
    cli.logError.mock.calls.map(([message]) => message).join('\n');

  return { cli, allLogs, allErrorLogs };
}
