import { hasEncapsulationViolations } from '../checks/has-encapsulation-violations';
import { traverseFileInfo } from '../modules/traverse-file-info';
import { checkForDependencyRuleViolation } from '../checks/check-for-dependency-rule-violation';
import getFs from '../fs/getFs';
import { cli } from './cli';
import { getEntryFromCliOrConfig } from './internal/get-entries-from-cli-or-config';
import { logInfoForMissingSheriffConfig } from './internal/log-info-for-missing-sheriff-config';

type ValidationsMap = Record<
  string,
  { encapsulations: string[]; dependencyRules: string[] }
>;

export function verify(args: string[]) {
  let deepImportsCount = 0;
  let dependencyRulesCount = 0;
  let filesCount = 0;
  let hasError = false;
  const validationsMap: ValidationsMap = {};
  const fs = getFs();

  const projectInfo = getEntryFromCliOrConfig(args[0]);
  logInfoForMissingSheriffConfig(projectInfo);

  for (const { fileInfo } of traverseFileInfo(projectInfo.fileInfo)) {
    const encapsulations = Object.keys(
      hasEncapsulationViolations(fileInfo.path, projectInfo),
    );

    const dependencyRuleViolations = checkForDependencyRuleViolation(
      fileInfo.path,
      projectInfo,
    );

    if (encapsulations.length > 0 || dependencyRuleViolations.length > 0) {
      hasError = true;
      filesCount++;
      deepImportsCount += encapsulations.length;
      dependencyRulesCount += dependencyRuleViolations.length;

      const dependencyRules = dependencyRuleViolations.map(
        (violation) =>
          `from tag ${violation.fromTag} to tags ${violation.toTags.join(', ')}`,
      );

      validationsMap[fs.relativeTo(fs.cwd(), fileInfo.path)] = {
        encapsulations,
        dependencyRules,
      };
    }
  }

  cli.log('');
  cli.log(cli.bold('Verification Report'));
  if (hasError) {
    cli.log('');
    cli.log('Issues found:');
    cli.log(`  Total Invalid Files: ${filesCount}`);
    cli.log(`  Total Encapsulation Violations: ${deepImportsCount}`);
    cli.log(`  Total Dependency Rule Violations: ${dependencyRulesCount}`);
    cli.log('----------------------------------');
    cli.log('');
  } else {
    cli.log('');
    cli.log('\u001b[32mNo issues found. Well done!\u001b[0m');
    cli.endProcessOk();
  }

  for (const [file, { encapsulations, dependencyRules }] of Object.entries(
    validationsMap,
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

  cli.endProcessError();
}
