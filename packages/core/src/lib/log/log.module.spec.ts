import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  SpyInstance,
  vitest,
} from 'vitest';
import { logger } from './logger';
import getFs, { useVirtualFs } from '../fs/getFs';
import { init } from '../init/init';
import tsconfigMinimal from '../test/fixtures/tsconfig.minimal';
import { ProjectCreator } from '../test/project-creator';
import { toFsPath } from '../file-info/fs-path';
import { sheriffConfig } from '../test/project-configurator';
import { reset } from './log';
import { Fs } from '../fs/fs';

describe('log', () => {
  let fs: Fs;
  let appendSpy: SpyInstance;

  const createProject = (enableLog: boolean) => {
    const creator = new ProjectCreator();
    creator.create(
      {
        'tsconfig.json': tsconfigMinimal,
        'sheriff.config.ts': sheriffConfig({
          tagging: {},
          depRules: {},
          log: enableLog,
        }),
        'app.component.ts': '',
      },
      'log'
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
    createProject(false);
    init(toFsPath('/project/log/app.component.ts'), true);
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it('should log if enabled and initialised', () => {
    const log = logger('test');
    log.info('Hallo');
    createProject(true);
    init(toFsPath('/project/log/app.component.ts'), true);

    expect(appendSpy).toHaveBeenCalled();
    expect(fs.readFile(toFsPath('/project/sheriff.log'))).toMatch(/Hallo$/);
  });
});
