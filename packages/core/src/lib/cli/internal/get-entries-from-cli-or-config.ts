import getFs from '../../fs/getFs';
import { init, ProjectInfo } from '../../main/init';
import { parseConfig } from '../../config/parse-config';
import { toFsPath } from '../../file-info/fs-path';
import { isEmptyRecord } from './is-empty-record';
import { parseStringOrRecord } from './parse-string-or-record';

export type ProjectEntry<TEntry> = {
  projectName: string;
  entry: TEntry;
};

export const DEFAULT_PROJECT_NAME = 'default';

export function getEntriesFromCliOrConfig<R extends boolean = true>(
  /**
   * the CLI forwards the entry file either as e.g. "src/main.ts" or
   * as entry points: '{ 'app-i': 'projects/app-i/src/main.ts', 'app-ii': 'projects/app-ii/src/main.ts', }'
   */
  entryFileOrEntryPoints?: string,
  runInit: R = true as R,
): R extends false
  ? Array<ProjectEntry<string>>
  : Array<ProjectEntry<ProjectInfo>> {
  const fs = getFs();

  /**
   * CLI argument given
   */
  if (entryFileOrEntryPoints) {
    return processEntryFile(
      parseStringOrRecord(entryFileOrEntryPoints),
      runInit,
      fs,
    ) as R extends false
      ? Array<ProjectEntry<string>>
      : Array<ProjectEntry<ProjectInfo>>;
  }

  const potentialConfigFile = fs.join(fs.cwd(), 'sheriff.config.ts');
  if (fs.exists(potentialConfigFile)) {
    const sheriffConfig = parseConfig(potentialConfigFile);

    if (sheriffConfig.entryFile && !isEmptyRecord(sheriffConfig.entryPoints)) {
      throw new Error(
        'Both entry file and entry points found in sheriff.config.ts. Please provide only one option',
      );
    }

    if (sheriffConfig.entryFile) {
      return processEntryFile(
        sheriffConfig.entryFile,
        runInit,
        fs,
      ) as R extends false
        ? Array<ProjectEntry<string>>
        : Array<ProjectEntry<ProjectInfo>>;
    } else if (
      sheriffConfig.entryPoints &&
      !isEmptyRecord(sheriffConfig.entryPoints)
    ) {
      return processEntryFile(
        sheriffConfig.entryPoints,
        runInit,
        fs,
      ) as R extends false
        ? Array<ProjectEntry<string>>
        : Array<ProjectEntry<ProjectInfo>>;
    } else {
      throw new Error(
        'No entry file or entry points found in sheriff.config.ts. Please provide the option via the CLI.',
      );
    }
  }

  throw new Error(
    'Please provide an entry file (e.g. main.ts) or entry points (e.g. { projectName: "main.ts" })',
  );
}

// Helper function to process entry file consistently
function processEntryFile(
  entryFileValue: string | Record<string, string>,
  runInit: boolean,
  fs: ReturnType<typeof getFs>,
): Array<ProjectEntry<ProjectInfo>> | Array<ProjectEntry<string>> {
  if (typeof entryFileValue === 'string') {
    return runInit
      ? [
          {
            projectName: DEFAULT_PROJECT_NAME,
            entry: init(toFsPath(fs.join(fs.cwd(), entryFileValue))),
          },
        ]
      : [{ projectName: DEFAULT_PROJECT_NAME, entry: entryFileValue }];
  } else {
    const entries = Object.entries(entryFileValue);

    return runInit
      ? entries.map(([projectName, entry]) => ({
          projectName,
          entry: init(toFsPath(fs.join(fs.cwd(), entry as string))),
        }))
      : entries.map(([projectName, entry]) => ({
          projectName,
          entry: entry as string,
        }));
  }
}
