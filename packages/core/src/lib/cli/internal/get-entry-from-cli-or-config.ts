import getFs from '../../fs/getFs';
import { init, ProjectInfo } from '../../main/init';
import { parseConfig } from '../../config/parse-config';
import { toFsPath } from '../../file-info/fs-path';


export type ProjectEntry<TEntry> = {
  projectName: string;
  entry: TEntry;
};

export const DEFAULT_PROJECT_NAME = 'default';



export function getEntryFromCliOrConfig<R extends boolean = true>(
  entryFile?: string | Record<string, string>,
  runInit: R = true as R
): R extends false ? Array<ProjectEntry<string>> : Array<ProjectEntry<ProjectInfo>> {
  const fs = getFs();

  if (entryFile) {
    return processEntryFile(entryFile, runInit, fs) as R extends false
      ? Array<ProjectEntry<string>>
      : Array<ProjectEntry<ProjectInfo>>;
  }

  const potentialConfigFile = fs.join(fs.cwd(), 'sheriff.config.ts');
  if (fs.exists(potentialConfigFile)) {
    const sheriffConfig = parseConfig(potentialConfigFile);
    if (sheriffConfig.entryFile) {
      return processEntryFile(sheriffConfig.entryFile, runInit, fs) as R extends false
        ? Array<ProjectEntry<string>>
        : Array<ProjectEntry<ProjectInfo>>;
    } else {
      throw new Error(
        'No entry file found in sheriff.config.ts. Please provide one via the CLI ',
      );
    }
  }

  throw new Error('Please provide an entry file, e.g. main.ts');
}


// Helper function to process entry file consistently
function processEntryFile(
  entryFileValue: string | Record<string, string>,
  runInit: boolean,
  fs: ReturnType<typeof getFs>
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