import { describe, expect, it } from 'vitest';
import { createProject } from '../../test/project-creator';
import { tsConfig } from '../../test/fixtures/ts-config';
import { sheriffConfig } from '../../test/project-configurator';
import { getEntriesFromCliOrConfig } from '../internal/get-entries-from-cli-or-config';

describe('get entry file from CLI or config', () => {
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

    const projectInfo = getEntriesFromCliOrConfig('./src/main.ts')[0];

    expect(projectInfo.entry.fileInfo.path).toBe('/project/src/main.ts');
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

    const projectInfo = getEntriesFromCliOrConfig()[0];

    expect(projectInfo.entry.fileInfo.path).toBe('/project/src/app.ts');
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

    const projectInfo = getEntriesFromCliOrConfig('src/main.ts')[0];

    expect(projectInfo.entry.fileInfo.path).toBe('/project/src/main.ts');
  });

  it('should throw error if neither config file exist or CLI has entry file', () => {
    createProject({
      'tsconfig.json': tsConfig(),
    });

    expect(() => getEntriesFromCliOrConfig()).toThrow(
      'Please provide an entry file (e.g. main.ts) or entry points (e.g. { projectName: "main.ts" })',
    );
  });

  it('should throw error if neither config or CLI has entry file or entry points', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        depRules: {},
      }),
    });

    expect(() => getEntriesFromCliOrConfig()).toThrow(
      'No entry file or entry points found in sheriff.config.ts. Please provide the option via the CLI.',
    );
  });

  it('should throw error if both entry file and entry points are given', () => {
    createProject({
      'tsconfig.json': tsConfig(),
      'sheriff.config.ts': sheriffConfig({
        depRules: {},
        entryFile: 'projects/project-i/src/main.ts',
        entryPoints: {
          'project-i': 'projects/project-i/src/main.ts',
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
      },
    });

    expect(() => getEntriesFromCliOrConfig()).toThrow(
      'Both entry file and entry points found in sheriff.config.ts. Please provide only one option',
    );
  });

  describe('Multi project setup', () => {
    it('should use the CLI entry points', () => {
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

      const projectEntries = getEntriesFromCliOrConfig('project-i,project-ii');

      expect(projectEntries).toHaveLength(2);
      expect(projectEntries[0].entry.fileInfo.path).toBe(
        '/project/projects/project-i/src/main.ts',
      );
      expect(projectEntries[1].entry.fileInfo.path).toBe(
        '/project/projects/project-ii/src/main.ts',
      );
    });

    it('should use config entry points', () => {
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

      const projectEntries = getEntriesFromCliOrConfig();

      expect(projectEntries).toHaveLength(2);
      expect(projectEntries[0].entry.fileInfo.path).toBe(
        '/project/projects/project-i/src/main.ts',
      );
      expect(projectEntries[1].entry.fileInfo.path).toBe(
        '/project/projects/project-ii/src/main.ts',
      );
    });

    it('should favor CLI over config', () => {
      createProject({
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          depRules: {},
          entryPoints: {
            'project-i': 'projects/project-i/src/main.ts',
          },
        }),
        projects: {
          'project-i': {
            src: {
              'main.ts': [],
              'app.ts': [],
            },
          },
        },
      });

      const projectEntries = getEntriesFromCliOrConfig('project-i');

      expect(projectEntries).toHaveLength(1);
      expect(projectEntries[0].entry.fileInfo.path).toBe(
        '/project/projects/project-i/src/main.ts',
      );
    });
  });
});
