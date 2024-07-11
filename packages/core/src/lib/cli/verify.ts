import { checkForDeepImports } from '../checks/check-for-deep-imports';
import { traverseFileInfo } from '../modules/traverse-file-info';
import { checkForDependencyRuleViolation } from '../checks/check-for-dependency-rule-violation';
import getFs from '../fs/getFs';
import { cli } from './cli';
import { getEntryFromCliOrConfig } from './internal/get-entry-from-cli-or-config';

type ValidationsMap = Record<
  string,
  { deepImports: string[]; dependencyRules: string[] }
>;

export function verify(args: string[]) {
  let deepImportsCount = 0;
  let dependencyRulesCount = 0;
  let filesCount = 0;
  let hasError = false;
  const validationsMap: ValidationsMap = {};
  const fs = getFs();

  const projectInfo = getEntryFromCliOrConfig(args[0]);

  for (const { fileInfo } of traverseFileInfo(projectInfo.fileInfo)) {
    const deepImports = checkForDeepImports(fileInfo.path, projectInfo);
    const dependencyRuleViolations = checkForDependencyRuleViolation(
      fileInfo.path,
      projectInfo,
    );

    if (deepImports.length > 0 || dependencyRuleViolations.length > 0) {
      hasError = true;
      filesCount++;
      deepImportsCount += deepImports.length;
      dependencyRulesCount += dependencyRuleViolations.length;

      const dependencyRules = dependencyRuleViolations.map(
        (violation) =>
          `from tags ${violation.fromTags.join(',')} to ${violation.toTag}`,
      );

      validationsMap[fs.relativeTo(fs.cwd(), fileInfo.path)] = {
        deepImports,
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
    cli.log(`  Total Deep Imports: ${deepImportsCount}`);
    cli.log(`  Total Dependency Rule Violations: ${dependencyRulesCount}`);
    cli.log('----------------------------------');
    cli.log('');
  } else {
    cli.log('');
    cli.log('\u001b[32mNo issues found. Well done!\u001b[0m');
    cli.endProcessOk();
  }

  for (const [file, { deepImports, dependencyRules }] of Object.entries(
    validationsMap,
  )) {
    cli.log('|-- ' + file);
    if (deepImports.length > 0) {
      cli.log('|   |-- Deep Imports');
      deepImports.forEach((deepImport) => {
        cli.log('|   |   |-- ' + deepImport);
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
