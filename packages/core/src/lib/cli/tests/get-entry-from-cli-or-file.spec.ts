import { describe, expect, it } from 'vitest';
import { createProject } from '../../test/project-creator';
import { tsConfig } from '../../test/fixtures/ts-config';
import { sheriffConfig } from '../../test/project-configurator';
import { getEntryFromCliOrConfig } from '../internal/get-entry-from-cli-or-config';

describe('get entry file from cli or config', () => {
  it('should use the CLI entry file', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        depRules: {},
      }),
      src: {
        'main.ts': [],
      },
    });

    const projectInfo = getEntryFromCliOrConfig('./src/main.ts');

    expect(projectInfo.fileInfo.path).toBe('/project/src/main.ts');
  });
  it('should use config entry file', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        depRules: {},
        entryFile: 'src/app.ts',
      }),
      src: {
        'main.ts': [],
        'app.ts': [],
      },
    });

    const projectInfo = getEntryFromCliOrConfig();

    expect(projectInfo.fileInfo.path).toBe('/project/src/app.ts');
  });

  it('should favor CLI over config', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        depRules: {},
        entryFile: 'src/app.ts',
      }),
      src: {
        'main.ts': [],
        'app.ts': [],
      },
    });

    const projectInfo = getEntryFromCliOrConfig('src/main.ts');

    expect(projectInfo.fileInfo.path).toBe('/project/src/main.ts');
  });

  it('should throw error if neither config file exist or cli has entry file', () => {
    createProject({
      'tsconfig.json': tsConfig(),
    });

    expect(() => getEntryFromCliOrConfig()).toThrow(
      'Please provide an entry file, e.g. main.ts',
    );
  });

  it('should throw error if neither config or cli has entry file', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        depRules: {},
      }),
    });

    expect(() => getEntryFromCliOrConfig()).toThrow(
      'No entry file found in sheriff.config.ts. Please provide one via the CLI',
    );
  });
});
