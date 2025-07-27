import { ProjectViolation } from '../../../project-violation';
import getFs from '../../../../fs/getFs';
import { cli } from '../../../cli';
import { Reporter } from '../reporter';
import { junitBuilder } from './internal/junit-report-builder';
import { DEFAULT_PROJECT_NAME } from '../../get-entries-from-cli-or-config';

export class JunitReporter implements Reporter {
  #options: { outputDir: string; projectName: string };
  constructor(options: { outputDir: string; projectName: string }) {
    this.#options = options;
  }

  createReport(validationResults: ProjectViolation) {
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
    cli.log(`Creating JUnit XML report`);

    if (this.#options.projectName === DEFAULT_PROJECT_NAME) {
      fs.createDir(fs.join(this.#options.outputDir));
    } else {
      fs.createDir(
        fs.join(this.#options.outputDir, this.#options.projectName!),
      );
    }
    const xmlContent = this.#generateXml(validationResults);
    fs.writeFile(targetPath, xmlContent);
  }

  #getReportExtension(): string {
    return '.xml';
  }

  #generateXml(validationResults: ProjectViolation): string {
    const builder = junitBuilder();
    const suite = builder.testsuite({
      name: this.#options.projectName,
      totalDependencyRulesViolations:
        validationResults.totalDependencyRuleViolations,
      totalEncapsulationViolations:
        validationResults.totalEncapsulationViolations,
      totalViolatedFiles: validationResults.totalViolatedFiles,
      hasError: validationResults.hasError,
    });

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
