import { vitest } from 'vitest';
import * as cliFile from '../../cli';

export function mockCli() {
  const cli = vitest.spyOn(cliFile, 'cli', 'get');
  const mockedCli = {
    endProcessOk: vitest.fn<() => never>(),
    endProcessError: vitest.fn<() => never>(),
    log: vitest.fn<(message: string) => void>(),
    logError: vitest.fn<(message: string) =>  void>(),
    bold: (message: string) => `<b>${message}</b>`,
  };

  cli.mockReturnValue(mockedCli);

  const allLogs = () =>
    mockedCli.log.mock.calls.map(([message]) => message).join('\n');
  const allErrorLogs = () =>
    mockedCli.logError.mock.calls.map(([message]) => message).join('\n');

  return { allLogs, allErrorLogs };
}
