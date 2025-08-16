import { describe, it, expect } from 'vitest';
import { createProject } from '../../test/project-creator';
import { tsConfig } from '../../test/fixtures/ts-config';
import { sheriffConfig } from '../../test/project-configurator';
import { getProjectData } from '../get-project-data';

describe('getProjectData', () => {
  const setupProject = () => {
    createProject(
      {
        'tsconfig.json': tsConfig(),
        'sheriff.config.ts': sheriffConfig({
          modules: {},
          depRules: {},
        }),
        'src/main.ts': ['./test.ts'],
        'test.ts': [],
      },
      '/projects',
    );
  };

  it('should return the project data with an absolute entry file', () => {
    setupProject();

    const projectData = getProjectData('/projects/src/main.ts');
    expect(projectData).toBeDefined();
  });

  it('should return the project data with a relative entry file', () => {
    setupProject();

    const projectData = getProjectData('src/main.ts', '/projects');
    expect(projectData).toBeDefined();
  });
});
