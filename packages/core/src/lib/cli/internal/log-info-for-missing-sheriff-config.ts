import { ProjectInfo } from '../../main/init';
import { cli } from '../cli';

export function logInfoForMissingSheriffConfig(projectInfo: ProjectInfo) {
  if (projectInfo.config.isConfigFileMissing) {
    cli.log(
      'Default settings applied. For more control, run "npx sheriff init" to create a sheriff.config.ts.',
    );
  }
}
