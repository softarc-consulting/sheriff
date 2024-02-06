import { createProject } from '../test/project-creator';
import { tsConfig } from '../test/fixtures/ts-config';
import { describe, expect, it } from 'vitest';
import { init } from './init';
import { toFsPath } from '../file-info/fs-path';
import { sheriffConfig } from '../test/project-configurator';

describe('init', () => {
  it('should return config is no file present', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'main.ts': ['./customer'],
      customer: {
        'index.ts': [],
      },
    });

    const projectInfo = init(toFsPath('/project/main.ts'), { traverse: true });
    expect(projectInfo.config.isConfigFileMissing).toBe(true);
  });

  it('should have isConfigFileMissing as false if config file is present', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({ depRules: {} }),
      'main.ts': ['./customer'],
      customer: {
        'index.ts': [],
      },
    });

    const projectInfo = init(toFsPath('/project/main.ts'), { traverse: true });
    expect(projectInfo.config.isConfigFileMissing).toBe(false);
  });

  it('should return undefined when config file is missing and returnOnMissingConfig', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'main.ts': ['./customer'],
      customer: {
        'index.ts': [],
      },
    });

    const projectInfo = init(toFsPath('/project/main.ts'), {
      traverse: true,
      returnOnMissingConfig: true,
    });
    expect(projectInfo).toBeUndefined();
  });
});
