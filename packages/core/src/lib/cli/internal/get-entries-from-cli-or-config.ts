import getFs from '../../fs/getFs';
import { init, ProjectInfo } from '../../main/init';
import { parseConfig } from '../../config/parse-config';
import { toFsPath } from '../../file-info/fs-path';
import { isEmptyRecord } from '../../util/is-empty-record';
import { parseEntryPointsFromCli } from './parse-entry-points-from-cli';
import { Entry } from './entry';

export const DEFAULT_PROJECT_NAME = 'default';

export function getEntriesFromCliOrConfig(
  entryFileOrEntryPoints?: string,
): Array<Entry<ProjectInfo>>;
export function getEntriesFromCliOrConfig(
  entryFileOrEntryPoints?: string,
  runInit?: true,
): Array<Entry<ProjectInfo>>;
export function getEntriesFromCliOrConfig(
  entryFileOrEntryPoints?: string,
  runInit?: false,
): Array<Entry<string>>;
export function getEntriesFromCliOrConfig(
  /**
   * the CLI forwards either the entry file e.g. "src/main.ts" or
   * the entry point(s) e.g. app-i,app-ii
   */
  entryFileOrEntryPoints = '',
  runInit = true,
): Array<Entry<string>> | Array<Entry<ProjectInfo>> {
  const fs = getFs();
  const potentialConfigFile = fs.join(fs.cwd(), 'sheriff.config.ts');

  /**
   * CLI argument given
   */
  if (entryFileOrEntryPoints) {
    // CLI argument given and no config file is present -> only entry file can work
    if (!fs.exists(potentialConfigFile)) {
      return processEntryFile(entryFileOrEntryPoints as string, runInit, fs);
    }

    if (fs.exists(potentialConfigFile)) {
      // two cases to check: check for entry points otherwise it is an entry file
      const sheriffConfig = parseConfig(potentialConfigFile);

      const potentialEntryPoints = parseEntryPointsFromCli(
        entryFileOrEntryPoints,
        sheriffConfig,
      );

      if (potentialEntryPoints) {
        // if entry points are given, return them
        return processEntryFile(potentialEntryPoints, runInit, fs);
      } else {
        // otherwise it is an entry file
        return processEntryFile(entryFileOrEntryPoints, runInit, fs);
      }
    }
  }

  if (fs.exists(potentialConfigFile)) {
    const sheriffConfig = parseConfig(potentialConfigFile);

    if (sheriffConfig.entryFile && !isEmptyRecord(sheriffConfig.entryPoints)) {
      throw new Error(
        'Both entry file and entry points found in sheriff.config.ts. Please provide only one option',
      );
    }

    if (sheriffConfig.entryFile) {
      return processEntryFile(sheriffConfig.entryFile, runInit, fs);
    } else if (
      sheriffConfig.entryPoints &&
      !isEmptyRecord(sheriffConfig.entryPoints)
    ) {
      return processEntryFile(sheriffConfig.entryPoints, runInit, fs);
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
): Array<Entry<ProjectInfo>> | Array<Entry<string>> {
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
      ? (entries.map(([projectName, entry]) => ({
          projectName,
          entry: init(toFsPath(fs.join(fs.cwd(), entry as string))),
        })) as Array<Entry<ProjectInfo>>)
      : (entries.map(([projectName, entry]) => ({
          projectName,
          entry: entry as string,
        })) as Array<Entry<string>>);
  }
}
