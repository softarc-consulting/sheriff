import { hasEncapsulationViolations } from '../checks/has-encapsulation-violations';
import { traverseFileInfo } from '../modules/traverse-file-info';
import {
  checkForDependencyRuleViolation,
  DependencyRuleViolation,
} from '../checks/check-for-dependency-rule-violation';
import getFs from '../fs/getFs';
import { cli } from './cli';
import {
  DEFAULT_PROJECT_NAME,
  getEntriesFromCliOrConfig,
} from './internal/get-entries-from-cli-or-config';
import { logInfoForMissingSheriffConfig } from './internal/log-info-for-missing-sheriff-config';
import { reporterFactory } from './internal/reporter/reporter-factory';
import { ProjectViolation } from './project-violation';
import { ProjectInfo } from '../main/init';
import { Entry } from './internal/entry';

export type Violation = {
  filePath: string;
  encapsulations: string[];
  dependencyRules: string[];
  dependencyRuleViolations: DependencyRuleViolation[];
};

type ProjectValidation = {
  dependencyRulesCount: number;
  encapsulationsCount: number;
  filesCount: number;
  hasError: boolean;
  ruleViolations: Violation[];
};

export function verify(args: string[]) {
  const fs = getFs();
  const projectEntries = getEntriesFromCliOrConfig(args[0]);
  logInfoForMissingSheriffConfig(projectEntries[0].projectInfo);

  // Keep track of overall status to determine final process exit code
  let hasAnyProjectError = false;

  // Store validation results for each project
  const projectValidations = new Map<string, ProjectValidation>();

  for (const projectEntry of projectEntries) {
    const projectName = projectEntry.projectName;

    // Initialize validation data for this project
    const validation: ProjectValidation = {
      dependencyRulesCount: 0,
      encapsulationsCount: 0,
      filesCount: 0,
      hasError: false,
      ruleViolations: [],
    };

    projectValidations.set(projectName, validation);

    for (const { fileInfo } of traverseFileInfo(
      projectEntry.projectInfo.fileInfo,
    )) {
      const encapsulations = Object.keys(
        hasEncapsulationViolations(fileInfo.path, projectEntry.projectInfo),
      );

      const dependencyRuleViolations = checkForDependencyRuleViolation(
        fileInfo.path,
        projectEntry.projectInfo,
      );
      const projectValidation = projectValidations.get(projectName)!;

      if (encapsulations.length > 0 || dependencyRuleViolations.length > 0) {
        projectValidation.hasError = true;
        projectValidation.filesCount++;
        projectValidation.dependencyRulesCount +=
          dependencyRuleViolations.length;
        hasAnyProjectError = true;
        projectValidation.encapsulationsCount += encapsulations.length;

        const dependencyRules = dependencyRuleViolations.map(
          (violation) =>
            `from tag ${violation.fromTag} to tags ${violation.toTags.join(', ')}`,
        );

        const relativePath = fs.relativeTo(fs.cwd(), fileInfo.path);
        projectValidation.ruleViolations.push({
          filePath: relativePath,
          encapsulations,
          dependencyRules,
          dependencyRuleViolations,
        });
      }
    }
  }

  cli.log('');
  cli.log(cli.bold('Verification Report'));

  // Process each project's validation results
  for (const [projectName, validation] of projectValidations.entries()) {
    cli.log('');
    if (projectName !== DEFAULT_PROJECT_NAME) {
      cli.log(cli.bold(`Project: ${projectName}`));
      cli.log('');
    }

    if (validation.hasError) {
      cli.log('Issues found:');
      cli.log(`  Total Invalid Files: ${validation.filesCount}`);
      cli.log(
        `  Total Encapsulation Violations: ${validation.encapsulationsCount}`,
      );
      cli.log(
        `  Total Dependency Rule Violations: ${validation.dependencyRulesCount}`,
      );
      cli.log('----------------------------------');
      cli.log('');

      // Display detailed validation information for this project
      for (const {
        encapsulations,
        dependencyRules,
        filePath,
      } of validation.ruleViolations) {
        cli.log('|-- ' + filePath);
        if (encapsulations.length > 0) {
          cli.log('|   |-- Encapsulation Violations');
          encapsulations.forEach((encapsulation) => {
            cli.log('|   |   |-- ' + encapsulation);
          });
        }

        if (dependencyRules.length > 0) {
          cli.log('|   |-- Dependency Rule Violations');
          dependencyRules.forEach((dependencyRule) => {
            cli.log('|   |   |-- ' + dependencyRule);
          });
        }
      }
    } else {
      if (projectValidations.size > 1) {
        cli.log('');
        cli.log(
          '\u001b[32mNo issues found for this project. Well done!\u001b[0m',
        );
      } else {
        cli.log('\u001b[32mNo issues found. Well done!\u001b[0m');
      }
    }
  }

  createReports(args, projectEntries, projectValidations);

  // End process based on overall status
  if (hasAnyProjectError) {
    cli.endProcessError();
  } else {
    if (projectValidations.size > 1) {
      cli.log('');
      cli.log('\u001b[32mAll projects validated successfully!\u001b[0m');
    }
    cli.endProcessOk();
  }
}

function createReports(
  args: string[],
  projectEntries: Entry<ProjectInfo>[],
  projectValidations: Map<string, ProjectValidation>,
) {
  // Read reporters from the CLI
  const reporterFormats = projectEntries[0].entry.config.reporters || [];

  if (reporterFormats.length > 0) {
    for (const projectEntry of projectEntries) {
      const projectName = projectEntry.projectName;
      const projectValidation = projectValidations.get(projectName);

      const reportsDirectory =
        projectEntry.entry.config.reportsDirectory || 'reports';

      const reporters = reporterFactory({
        reporterFormats: reporterFormats,
        outputDir: reportsDirectory,
        projectName,
      });

      if (projectValidation) {
        const violations: ProjectViolation = {
          hasError: projectValidation.hasError,
          totalDependencyRuleViolations: projectValidation.dependencyRulesCount,
          totalEncapsulationViolations: projectValidation.encapsulationsCount,
          totalViolatedFiles: projectValidation.filesCount,
          violations: projectValidation.ruleViolations,
        };

        reporters.forEach((reporter) => {
          reporter.createReport(violations);
        });
      }
    }
  }
}
