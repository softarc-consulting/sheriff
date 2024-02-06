import * as path from 'path';
import * as process from 'process';
import { init } from '../../lib/main/init';
import { FsPath, toFsPath } from '../../lib/file-info/fs-path';
import { traverseFileInfo } from '../../lib/modules/traverse-file-info';
import { hasDeepImport } from '../../lib/eslint/deep-import';
import { checkForDeepImports } from '../../lib/checks/check-for-deep-imports';
import {
  checkForDependencyRuleViolation,
  DependencyRuleViolation,
} from '../../lib/checks/check-for-dependency-rule-violation';

export function verify(args: string[]) {
  const [main] = args;
  const mainPath = path.join(path.resolve(process.cwd(), main));
  const projectConfig = init(toFsPath(mainPath));

  let deepImportsCount = 0
  let dependencyRulesCount = 0
  let filesCount = 0

  let hasError = false;

  for (const { fileInfo } of traverseFileInfo(projectConfig.fileInfo)) {
    const deepImports = checkForDeepImports(fileInfo.path, projectConfig);
    const dependencyRuleViolations = checkForDependencyRuleViolation(
      fileInfo.path,
      projectConfig,
    );

    if (deepImports.length > 0 || dependencyRuleViolations.length > 0) {
      hasError = true;
      filesCount++

      console.log(fileInfo.path);
      console.log('-'.repeat(fileInfo.path.length));

      if (deepImports.length > 0) {
        console.log('Deep Imports');
        deepImportsCount += deepImports.length
        deepImports.forEach((deepImport) => {
          console.log('  ' + deepImport);
        });
      }

      if (dependencyRuleViolations.length > 0) {
        console.log('Dependency Rule Violations');
        dependencyRulesCount += dependencyRuleViolations.length
        dependencyRuleViolations.forEach((dependencyRuleViolation) => {
          console.log(
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
    console.error("Issues found in");
    console.error(`  Files: ${filesCount}`);
    console.error(`  Deep Imports: ${deepImportsCount}`);
    console.error(`  Dependency Rule Violations: ${dependencyRulesCount}`);
    process.exit(1); // failure
  }
  else {
    console.log('')
    console.log('\u001b[32mNo issues found. The project is clean.')
  }
}
