import { ProjectViolation } from '../../../project-violation';
import { cli } from '../../../cli';
import { Reporter } from '../reporter';
import { junitBuilder } from './internal/junit-report-builder';
import { saveReport } from '../utils/save-report';
import { ReporterOptions } from '../utils/reporter-options';

export class JunitReporter implements Reporter {
  #options: ReporterOptions;

  constructor(options: ReporterOptions) {
    this.#options = options;
  }

  createReport(validationResults: ProjectViolation): void {
    cli.log(`Creating JUnit report`);

    const xmlContent = this.#generateXml(validationResults);
    saveReport(this.#options, 'violations', '.xml', xmlContent);
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
