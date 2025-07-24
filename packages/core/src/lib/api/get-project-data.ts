import { FsPath, toFsPath } from '../file-info/fs-path';
import { init, ProjectInfo } from '../main/init';
import { calcTagsForModule } from '../tags/calc-tags-for-module';
import { traverseFileInfo } from '../modules/traverse-file-info';
import getFs from '../fs/getFs';

export type ProjectDataEntry = {
  module: string;
  moduleType: 'barrel' | 'barrel-less';
  tags: string[];
  imports: string[];
  externalLibraries?: string[];
  unresolvedImports: string[];
  projectName: string;
};

/**
 *
 */
export type Options = {
  /**
   * Adds a property `externalLibraries` to each entry
   * that contains the external libraries, i.e. node_modules.
   */
  includeExternalLibraries?: boolean;
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
    projectInfo.config.modules,
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
 * You can add additional properties via the options parameter.
 *
 * @param entryFileAbsolute absolute path to the entry file, e.g. /project/src/main.ts
 * @param options additional options for the output
 */
export function getProjectData(
  entryFileAbsolute: string,
  projectName: string,
  options?: Options,
): ProjectData;
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
 *  You can add additional properties via the options parameter.
 *
 * @param entryFileRelative relative path to the entry file, e.g. main.ts
 * @param cwd absolute path to the entry file, e.g. /project/src
 * @param options additional options for the output
 */
export function getProjectData(
  entryFileRelative: string,
  cwd: string,
  projectName: string,
  options?: Options,
): ProjectData;

export function getProjectData(
  entryFile: string,
  cwdOrProjectName: string,
  projectNameOrOptions?: string | Options,
  optionalOptions?: Options,
): ProjectData {
  const fs = getFs();
  let absoluteEntryFile: string;
  let cwd: string | undefined;
  let projectName: string;
  let options: Options;

  if (
    typeof cwdOrProjectName === 'string' &&
    typeof projectNameOrOptions === 'string'
  ) {
    // Called with: (entryFile, cwd, projectName, options?)
    absoluteEntryFile = fs.join(entryFile);
    cwd = cwdOrProjectName;
    projectName = projectNameOrOptions;
    options = optionalOptions || {};
  } else if (
    typeof cwdOrProjectName === 'string' &&
    typeof projectNameOrOptions === 'object'
  ) {
    // Called with: (entryFile, projectName, options)
    absoluteEntryFile = entryFile;
    cwd = undefined;
    projectName = cwdOrProjectName;
    options = projectNameOrOptions || {};
  } else {
    throw new Error('Invalid arguments to getProjectData');
  }

  const projectInfo = init(toFsPath(absoluteEntryFile));

  const data: ProjectData = {};
  const tagsCache: Record<string, string[]> = {};

  for (const { fileInfo } of traverseFileInfo(projectInfo.fileInfo)) {
    const entry: ProjectDataEntry = {
      module: fileInfo.moduleInfo.path || '.',
      moduleType: fileInfo.moduleInfo.hasBarrel ? 'barrel' : 'barrel-less',
      tags: calcOrGetTags(fileInfo.moduleInfo.path, projectInfo, tagsCache),
      imports: fileInfo.imports.map((fileInfo) => fileInfo.path),
      unresolvedImports: fileInfo.unresolvableImports,
      projectName: projectName,
    };

    if (options.includeExternalLibraries) {
      entry.externalLibraries = [...fileInfo.getExternalLibraries()].sort(
        (a, b) => a.localeCompare(b),
      );
    }

    data[fileInfo.path] = entry;
  }

  return relativizeIfRequired(data, { ...options, cwd });
}

function relativizeIfRequired(
  data: ProjectData,
  options: Options & { cwd?: string },
): ProjectData {
  const { cwd } = options;
  if (cwd === undefined) {
    return data;
  }

  const fs = getFs();
  const relative = (path: FsPath) => fs.relativeTo(cwd, path) || '.';

  const relativizedData: ProjectData = {};
  for (const [modulePath, moduleData] of Object.entries(data)) {
    const entry: ProjectDataEntry = {
      module: relative(toFsPath(moduleData.module)),
      moduleType: moduleData.moduleType,
      tags: moduleData.tags,
      imports: moduleData.imports.map((importPath) =>
        relative(toFsPath(importPath)),
      ),
      unresolvedImports: moduleData.unresolvedImports,
      projectName: moduleData.projectName,
    };

    if (options.includeExternalLibraries) {
      entry.externalLibraries = moduleData.externalLibraries;
    }
    relativizedData[relative(toFsPath(modulePath))] = entry;
  }

  return relativizedData;
}
