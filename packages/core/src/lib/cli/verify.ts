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

type ValidationsMap = Record<
  string,
  { encapsulations: string[]; dependencyRules: string[] }
>;

type ProjectValidation = {
  deepImportsCount: number;
  dependencyRulesCount: number;
  filesCount: number;
  hasError: boolean;
  validationsMap: ValidationsMap;
  encapsulations: string[];
  dependencyRuleViolations: DependencyRuleViolation[];
};

export function verify(args: string[]) {
  const fs = getFs();
  const projectEntries = getEntriesFromCliOrConfig(args[0]);
  logInfoForMissingSheriffConfig(projectEntries[0].entry);

  // Keep track of overall status to determine final process exit code
  let hasAnyProjectError = false;

  // Store validation results for each project
  const projectValidations = new Map<string, ProjectValidation>();

  for (const projectEntry of projectEntries) {
    const projectName = projectEntry.projectName;

    // Initialize validation data for this project
    const validation: ProjectValidation = {
      deepImportsCount: 0,
      dependencyRulesCount: 0,
      filesCount: 0,
      hasError: false,
      validationsMap: {},
      encapsulations: [],
      dependencyRuleViolations: [],
    };

    projectValidations.set(projectName, validation);

    for (const { fileInfo } of traverseFileInfo(projectEntry.entry.fileInfo)) {
      const encapsulations = Object.keys(
        hasEncapsulationViolations(fileInfo.path, projectEntry.entry),
      );

      const dependencyRuleViolations = checkForDependencyRuleViolation(
        fileInfo.path,
        projectEntry.entry,
      );
      const projectValidation = projectValidations.get(projectName)!;
      projectValidation.encapsulations = encapsulations;
      projectValidation.dependencyRuleViolations = dependencyRuleViolations;

      if (encapsulations.length > 0 || dependencyRuleViolations.length > 0) {
        projectValidation.hasError = true;
        projectValidation.filesCount++;
        projectValidation.deepImportsCount += encapsulations.length;
        projectValidation.dependencyRulesCount +=
          dependencyRuleViolations.length;
        hasAnyProjectError = true;

        const dependencyRules = dependencyRuleViolations.map(
          (violation) =>
            `from tag ${violation.fromTag} to tags ${violation.toTags.join(', ')}`,
        );

        const relativePath = fs.relativeTo(fs.cwd(), fileInfo.path);
        projectValidation.validationsMap[relativePath] = {
          encapsulations,
          dependencyRules,
        };
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
        `  Total Encapsulation Violations: ${validation.deepImportsCount}`,
      );
      cli.log(
        `  Total Dependency Rule Violations: ${validation.dependencyRulesCount}`,
      );
      cli.log('----------------------------------');
      cli.log('');

      // Display detailed validation information for this project
      for (const [file, { encapsulations, dependencyRules }] of Object.entries(
        validation.validationsMap,
      )) {
        cli.log('|-- ' + file);
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
