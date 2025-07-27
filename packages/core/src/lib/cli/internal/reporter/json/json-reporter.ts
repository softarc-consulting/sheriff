import { Reporter } from '../reporter';
import { cli } from '../../../cli';
import getFs from '../../../../fs/getFs';

import { SheriffViolations } from '../../../sheriff-violations';

export class JsonReporter implements Reporter {
  #options: { outputDir: string; projectName: string };
  constructor(options: { outputDir: string; projectName: string }) {
    this.#options = options;
  }

  createReport(validationResults: SheriffViolations): void {
    const fs = getFs();
    const targetPath = fs.join(
      this.#options.outputDir,
      this.#options.projectName,
      'violations' + this.#getReportExtension(),
    );
    cli.log(`Creating JSON-export`);

    fs.createDir(fs.join(this.#options.outputDir, this.#options.projectName!));

    fs.writeFile(targetPath, JSON.stringify(validationResults, null, 2));
  }

  #getReportExtension(): string {
    return '.json';
  }
}
