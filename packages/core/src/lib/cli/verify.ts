import * as path from 'path';
import { toFsPath } from '../file-info/fs-path';
import { init } from '../main/init';
import { checkForDeepImports } from '../checks/check-for-deep-imports';
import { traverseFileInfo } from '../modules/traverse-file-info';
import { checkForDependencyRuleViolation } from '../checks/check-for-dependency-rule-violation';
import { Cli } from './util';
import { UserError } from '../error/user-error';
import getFs from '../fs/getFs';

type ValidationsMap = Record<
  string,
  { deepImports: string[]; dependencyRules: string[] }
>;

export function verify(currentDir: string, cli: Cli, args: string[]) {
  let deepImportsCount = 0;
  let dependencyRulesCount = 0;
  let filesCount = 0;
  let hasError = false;
  const validationsMap: ValidationsMap = {};
  const fs = getFs();

  try {
    const [main] = args;
    const mainPath = path.join(path.resolve(currentDir, main));
    const projectConfig = init(toFsPath(mainPath));

    for (const { fileInfo } of traverseFileInfo(projectConfig.fileInfo)) {
      const deepImports = checkForDeepImports(fileInfo.path, projectConfig);
      const dependencyRuleViolations = checkForDependencyRuleViolation(
        fileInfo.path,
        projectConfig,
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

        validationsMap[fs.relativeTo(currentDir, fileInfo.path)] = {
          deepImports,
          dependencyRules,
        };
      }
    }

    cli.log('');
    cli.log('\u001b[1mVerification Report\u001b[0m');
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
      cli.log('\u001b[32mNo issues found. Well done!');
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
  } catch (error) {
    if (error instanceof UserError) {
      cli.logError(error.message);
    } else {
      cli.logError(String(error));
    }
    cli.endProcessError();
  }
}
