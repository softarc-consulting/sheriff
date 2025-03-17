import { Reporter } from './reporter';
import { cli } from '../../cli';
import getFs from '../../../fs/getFs';

import { SheriffViolations } from '../../sheriff-violations';

export class JsonReporter implements Reporter {
  createReport(args: {
    exportDir: string;
    projectName: string;
    validationResults: SheriffViolations;
  }): void {
    const fs = getFs();
    const targetPath = fs.join(
      args.exportDir,
      args.projectName,
      'sheriff-report' + this.#getReportExtension(),
    );
    cli.log(`Creating .json-export`);

    fs.createDir(fs.join(args.exportDir, args.projectName!));

    fs.writeFile(targetPath, JSON.stringify(args.validationResults, null, 2));
  }

  #getReportExtension(): string {
    return '.json';
  }
}
