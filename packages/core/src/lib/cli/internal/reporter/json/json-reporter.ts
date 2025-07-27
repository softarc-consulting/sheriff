import { Reporter } from '../reporter';
import { cli } from '../../../cli';
import getFs from '../../../../fs/getFs';

import { ProjectViolation } from '../../../project-violation';
import { DEFAULT_PROJECT_NAME } from '../../get-entries-from-cli-or-config';

export class JsonReporter implements Reporter {
  #options: { outputDir: string; projectName: string };
  constructor(options: { outputDir: string; projectName: string }) {
    this.#options = options;
  }

  createReport(validationResults: ProjectViolation): void {
    const fs = getFs();
    const targetPath =
      this.#options.projectName === DEFAULT_PROJECT_NAME
        ? fs.join(
            this.#options.outputDir,
            'violations' + this.#getReportExtension(),
          )
        : fs.join(
            this.#options.outputDir,
            this.#options.projectName,
            'violations' + this.#getReportExtension(),
          );
    cli.log(`Creating JSON-export`);
    if (this.#options.projectName === DEFAULT_PROJECT_NAME) {
      fs.createDir(fs.join(this.#options.outputDir));
    } else {
      fs.createDir(
        fs.join(this.#options.outputDir, this.#options.projectName!),
      );
    }

    fs.writeFile(targetPath, JSON.stringify(validationResults, null, 2));
  }

  #getReportExtension(): string {
    return '.json';
  }
}
