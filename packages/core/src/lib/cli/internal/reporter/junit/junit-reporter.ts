import { SheriffViolations } from '../../../sheriff-violations';
import getFs from '../../../../fs/getFs';
import { cli } from '../../../cli';
import { Reporter } from '../reporter';
import { junitBuilder } from './internal/junit-report-builder';

export class JunitReporter implements Reporter {
  #options: { outputDir: string; projectName: string };
  constructor(options: { outputDir: string; projectName: string }) {
    this.#options = options;
  }

  createReport(validationResults: SheriffViolations) {
    const fs = getFs();
    const targetPath = fs.join(
      this.#options.outputDir,
      this.#options.projectName,
      'violations' + this.#getReportExtension(),
    );
    cli.log(`Creating JUnit XML report`);

    fs.createDir(fs.join(this.#options.outputDir, this.#options.projectName!));
    const xmlContent = this.#generateXml(validationResults);
    fs.writeFile(targetPath, xmlContent);
  }

  #getReportExtension(): string {
    return '.xml';
  }

  #generateXml(validationResults: SheriffViolations): string {
    const builder = junitBuilder();
    const suite = builder.testsuite(this.#options.projectName);

    // Process each violation
    for (const violation of validationResults.violations) {
      // Add encapsulation violations
      for (const encapsulation of violation.encapsulations) {
        suite.addTestCase({
          modulePath: violation.filePath,
          name: 'encapsulation',
          failureMessage: `${encapsulation} cannot be imported. It is encapsulated.`,
        });
      }

      // Add dependency rule violations
      for (const depViolation of violation.dependencyRuleViolations) {
        const fromModulePath = depViolation.fromModulePath;
        const toModulePath = depViolation.toModulePath;

        suite.addTestCase({
          modulePath: violation.filePath,
          name: 'dependency-rule',
          // TODO in verify we already build the message
          failureMessage: `module ${fromModulePath} cannot access ${toModulePath}. Tag ${depViolation.fromTag} has no clearance for tags ${depViolation.toTags.join(',')}`,
          fromTag: depViolation.fromTag,
          toTags: depViolation.toTags.join(','),
          fromModulePath: fromModulePath,
          toModulePath: toModulePath,
        });
      }
    }

    return builder.getReport();
  }
}
