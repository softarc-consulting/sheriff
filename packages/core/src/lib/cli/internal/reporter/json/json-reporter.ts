import { Reporter } from '../reporter';
import { cli } from '../../../cli';
import { ProjectViolation } from '../../../project-violation';
import { saveReport } from '../utils/save-report';
import { ReporterOptions } from '../utils/reporter-options';

export class JsonReporter implements Reporter {
  #options: ReporterOptions;

  constructor(options: ReporterOptions) {
    this.#options = options;
  }

  createReport(validationResults: ProjectViolation): void {
    cli.log(`Creating JSON report`);

    const content = JSON.stringify(validationResults, null, 2);
    saveReport(this.#options, 'violations', '.json', content);
  }
}
