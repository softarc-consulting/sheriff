import { getEntryFromCliOrConfig } from './internal/get-entry-from-cli-or-config';
import { traverseFileInfo } from '../modules/traverse-file-info';
import { calcTagsForModule } from '../tags/calc-tags-for-module';
import { ProjectInfo } from '../main/init';
import { FsPath } from '../file-info/fs-path';
import { cli } from './cli';
import getFs from '../fs/getFs';

export type ExportEntry = {
  module: string;
  tags: string[];
  imports: string[];
};

const tagsCache: Record<string, string[]> = {};

function calcOrGetTags(modulePath: FsPath, projectInfo: ProjectInfo): string[] {
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

export function exportData(...args: string[]): void {
  const fs = getFs();
  const projectInfo = getEntryFromCliOrConfig(args[0]);
  const relative = (path: FsPath) => fs.relativeTo(projectInfo.rootDir, path);

  const data: Record<string, ExportEntry> = {};

  for (const { fileInfo } of traverseFileInfo(projectInfo.fileInfo)) {
    data[relative(fileInfo.path)] = {
      module: relative(fileInfo.moduleInfo.directory) || '.',
      tags: calcOrGetTags(fileInfo.moduleInfo.directory, projectInfo),
      imports: fileInfo.imports.map((fileInfo) => relative(fileInfo.path)),
    };
  }

  cli.log(JSON.stringify(data, null, '  '));
}
