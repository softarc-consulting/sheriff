import { getProjectData } from '@softarc/sheriff-core';

// Test the excludeFromChecks functionality
export function testExcludeFromChecks() {
  const projectData = getProjectData('src/app/app.component.ts', {
    projectName: 'angular-iv',
    includeExternalLibraries: false,
  });

  // Files that should be excluded should not have dependency violations
  // Files that are not excluded should still be checked normally
  
  return projectData;
}


