import { getEntryFromCliOrConfig } from './internal/get-entry-from-cli-or-config';
import { cli } from './cli';
import { getProjectData, ProjectData } from '../api/get-project-data';
import { FsPath, toFsPath } from '../file-info/fs-path';
import getFs from '../fs/getFs';

export function exportData(...args: string[]): void {
  const fs = getFs();
  const projectInfo = getEntryFromCliOrConfig(args[0]);
  const relative = (path: FsPath) => fs.relativeTo(projectInfo.rootDir, path) || '.';

  const projectData = getProjectData(projectInfo.fileInfo.path);
  const data: ProjectData = {};

  for (const [modulePath, moduleData] of Object.entries(projectData)) {
    data[relative(toFsPath(modulePath))] = {
      module: relative(toFsPath(moduleData.module)),
      tags: moduleData.tags,
      imports: moduleData.imports.map((importPath) => relative(toFsPath(importPath))),
    };
  }

  cli.log(JSON.stringify(data, null, '  '));
}
