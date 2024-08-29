import { FsPath, toFsPath } from '../file-info/fs-path';
import { init, ProjectInfo } from '../main/init';
import { calcTagsForModule } from '../tags/calc-tags-for-module';
import { traverseFileInfo } from '../modules/traverse-file-info';

export type ProjectDataEntry = {
  module: string;
  tags: string[];
  imports: string[];
};

export type ProjectData = Record<string, ProjectDataEntry>;

function calcOrGetTags(
  modulePath: FsPath,
  projectInfo: ProjectInfo,
  tagsCache: Record<string, string[]>,
): string[] {
  if (modulePath in tagsCache) {
    return tagsCache[modulePath];
  }

  const tags = calcTagsForModule(
    modulePath,
    projectInfo.rootDir,
    projectInfo.config.tagging,
    projectInfo.config.autoTagging,
  );

  tagsCache[modulePath] = tags;

  return tags;
}

/**
 * Traverses through the imports of the entryFile
 * and returns the complete dependency graph.
 *
 * Each node contains the module, tags and imports.
 *
 * ```json5
 * {
 *   '/project/src/main.ts': {
 *      module: '.',
 *      tags: ['root'],
 *      imports: ['/project/src/holidays/feature/index.ts'],
 *    },
 *    '/project/src/holidays/feature/index.ts': {
 *      module: '/project/src/holidays/feature',
 *      tags: ['domain:holidays', 'type:feature'],
 *      imports: ['/project/src/holidays/feature/holidays-container.component.ts'],
 *    },
 *    // ...
 *  }
 * ```
 *
 * @param entryFile absolute path to the entry file, e.g. main.ts
 */
export function getProjectData(entryFile: string): ProjectData {
  const projectInfo = init(toFsPath(entryFile));

  const data: ProjectData = {};
  const tagsCache: Record<string, string[]> = {};

  for (const { fileInfo } of traverseFileInfo(projectInfo.fileInfo)) {
    data[fileInfo.path] = {
      module: fileInfo.moduleInfo.directory || '.',
      tags: calcOrGetTags(
        fileInfo.moduleInfo.directory,
        projectInfo,
        tagsCache,
      ),
      imports: fileInfo.imports.map((fileInfo) => fileInfo.path),
    };
  }
  return data;
}
