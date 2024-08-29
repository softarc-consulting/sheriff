import { FsPath, toFsPath } from '../file-info/fs-path';
import { init, ProjectInfo } from '../main/init';
import { calcTagsForModule } from '../tags/calc-tags-for-module';
import { traverseFileInfo } from '../modules/traverse-file-info';
import getFs from '../fs/getFs';

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
 * Traverses through the imports of the entryFileAbsolute
 * and returns the complete dependency graph.
 *
 * All paths are absolute.
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
 * @param entryFileAbsolute absolute path to the entry file, e.g. /project/src/main.ts
 */
export function getProjectData(entryFileAbsolute: string): ProjectData;
/**
 * Traverses through the imports of the entryFileRelative
 * and returns the complete dependency graph.
 *
 * All paths are relative to the cwd.
 *
 * Each node contains the module, tags and imports.
 *
 * ```json5
 * {
 *   'src/main.ts': {
 *      module: '.',
 *      tags: ['root'],
 *      imports: ['src/holidays/feature/index.ts'],
 *    },
 *    'src/holidays/feature/index.ts': {
 *      module: 'src/holidays/feature',
 *      tags: ['domain:holidays', 'type:feature'],
 *      imports: ['src/holidays/feature/holidays-container.component.ts'],
 *    },
 *    // ...
 *  }
 *  ```
 *
 * @param entryFileRelative relative path to the entry file, e.g. main.ts
 * @param cwd absolute path to the entry file, e.g. /project/src
 */
export function getProjectData(
  entryFileRelative: string,
  cwd: string,
): ProjectData;

export function getProjectData(entryFile: string, cwd?: string): ProjectData {
  const fs = getFs();
  const absoluteEntryFile =
    cwd === undefined ? entryFile : fs.join(cwd, entryFile);

  const projectInfo = init(toFsPath(absoluteEntryFile));

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

  return relativizeIfRequired(data, cwd);
}

function relativizeIfRequired(data: ProjectData, cwd?: string): ProjectData {
  if (cwd === undefined) {
    return data;
  }

  const fs = getFs();
  const relative = (path: FsPath) => fs.relativeTo(cwd, path) || '.';

  const relativizedData: ProjectData = {};
  for (const [modulePath, moduleData] of Object.entries(data)) {
    relativizedData[relative(toFsPath(modulePath))] = {
      module: relative(toFsPath(moduleData.module)),
      tags: moduleData.tags,
      imports: moduleData.imports.map((importPath) =>
        relative(toFsPath(importPath)),
      ),
    };
  }

  return relativizedData;
}
