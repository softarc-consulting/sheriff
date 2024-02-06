import getFs from '../../fs/getFs';
import { init, ProjectInfo } from '../../main/init';
import { parseConfig } from '../../config/parse-config';
import { toFsPath } from '../../file-info/fs-path';

export function getEntryFromCliOrConfig(entryFile?: string): ProjectInfo {
  const fs = getFs();
  if (entryFile) {
    return init(toFsPath(fs.join(fs.cwd(), entryFile)));
  }

  const potentialConfigFile = fs.join(fs.cwd(), 'sheriff.config.ts');
  if (fs.exists(potentialConfigFile)) {
    const sheriffConfig = parseConfig(potentialConfigFile);
    if (sheriffConfig.entryFile) {
      return init(toFsPath(fs.join(fs.cwd(), sheriffConfig.entryFile)));
    } else {
      throw new Error(
        'No entry file found in sheriff.config.ts. Please provide one via the CLI ',
      );
    }
  }

  throw new Error('Please provide an entry file, e.g. main.ts');
}
