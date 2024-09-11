import { logger } from './logger';
import getFs, { useVirtualFs } from '../fs/getFs';
import { init } from '../main/init';
import { createProject } from '../test/project-creator';
import { toFsPath } from '../file-info/fs-path';
import { sheriffConfig } from '../test/project-configurator';
import { reset } from './log';
import { Fs } from '../fs/fs';
import { tsConfig } from '../test/fixtures/ts-config';
import { MockInstance, describe, it, expect, beforeAll, afterEach, vitest } from "vitest";

describe('log', () => {
  let fs: Fs;
  let appendSpy: MockInstance<Fs['appendFile']>;

  const setup = (enableLog: boolean) => {
    createProject(
      {
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          tagging: {},
          depRules: {},
          log: enableLog,
        }),
        'app.component.ts': '',
      },
      'log',
    );
  };

  beforeAll(() => {
    useVirtualFs();
    fs = getFs();
    appendSpy = vitest.spyOn(fs, 'appendFile');
  });

  afterEach(() => {
    appendSpy.mockClear();
    fs.reset();
    reset();
  });

  it('should not log if not initialised', () => {
    const log = logger('test');
    log.info('message');
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it('should not log if disabled', () => {
    const appendSpy = vitest.spyOn(fs, 'appendFile');
    const log = logger('test');
    log.info('message');
    setup(false);
    init(toFsPath('/project/log/app.component.ts'));
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it('should log if enabled and initialized', () => {
    const log = logger('test');
    log.info('Hallo');
    setup(true);
    init(toFsPath('/project/log/app.component.ts'));

    expect(appendSpy).toHaveBeenCalled();
    expect(fs.readFile(toFsPath('/project/sheriff.log'))).toContain('Hallo');
  });
});
