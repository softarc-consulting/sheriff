import * as path from 'path';
import { toFsPath } from '../file-info/fs-path';
import { init } from '../main/init';
import { checkForDeepImports } from '../checks/check-for-deep-imports';
import { traverseFileInfo } from '../modules/traverse-file-info';
import { checkForDependencyRuleViolation } from '../checks/check-for-dependency-rule-violation';
import { Cli } from './util';

export function verify(currentDir: string, cli: Cli, args: string[]) {
  const [main] = args;
  const mainPath = path.join(path.resolve(currentDir, main));
  const projectConfig = init(toFsPath(mainPath));

  let deepImportsCount = 0;
  let dependencyRulesCount = 0;
  let filesCount = 0;

  let hasError = false;

  for (const { fileInfo } of traverseFileInfo(projectConfig.fileInfo)) {
    const deepImports = checkForDeepImports(fileInfo.path, projectConfig);
    const dependencyRuleViolations = checkForDependencyRuleViolation(
      fileInfo.path,
      projectConfig,
    );

    if (deepImports.length > 0 || dependencyRuleViolations.length > 0) {
      hasError = true;
      filesCount++;

      cli.log(fileInfo.path);
      cli.log('-'.repeat(fileInfo.path.length));

      if (deepImports.length > 0) {
        cli.log('Deep Imports');
        deepImportsCount += deepImports.length;
        deepImports.forEach((deepImport) => {
          cli.log('  ' + deepImport);
        });
      }

      if (dependencyRuleViolations.length > 0) {
        cli.log('Dependency Rule Violations');
        dependencyRulesCount += dependencyRuleViolations.length;
        dependencyRuleViolations.forEach((dependencyRuleViolation) => {
          cli.log(
            '  from tags:' +
              dependencyRuleViolation.fromTags.join(', ') +
              ', to:' +
              dependencyRuleViolation.toTag,
          );
        });
      }
    }
  }

  if (hasError) {
    cli.logError('Issues found in');
    cli.logError(`  Files: ${filesCount}`);
    cli.logError(`  Deep Imports: ${deepImportsCount}`);
    cli.logError(`  Dependency Rule Violations: ${dependencyRulesCount}`);
    cli.endProcessError();
  } else {
    cli.log('');
    cli.log('\u001b[32mNo issues found. The project is clean.');
    cli.endProcessOk();
  }
}
