import { hasEncapsulationViolations } from '../checks/has-encapsulation-violations';
import { traverseFileInfo } from '../modules/traverse-file-info';
import { checkForDependencyRuleViolation } from '../checks/check-for-dependency-rule-violation';
import getFs from '../fs/getFs';
import { cli } from './cli';
import { getEntryFromCliOrConfig } from './internal/get-entry-from-cli-or-config';
import minimist from 'minimist';
import { Reporter } from './internal/reporter/reporter';
import { getReporter } from './internal/reporter/get-reporter';
import { SheriffViolations } from './sheriff-violations';

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
  const sheriffViolations: SheriffViolations = {
    encapsulationsCount: 0,
    encapsulationValidations: [],
    dependencyRuleViolationsCount: 0,
    dependencyRuleViolations: [],
  };

  for (const { fileInfo } of traverseFileInfo(projectInfo.fileInfo)) {
    const encapsulations = Object.keys(
      hasEncapsulationViolations(fileInfo.path, projectInfo),
    );

    const dependencyRuleViolations = checkForDependencyRuleViolation(
      fileInfo.path,
      projectInfo,
    );

    encapsulations.forEach((encapsulation) =>
      sheriffViolations.encapsulationValidations.push(encapsulation),
    );
    dependencyRuleViolations.forEach((violation) =>
      sheriffViolations.dependencyRuleViolations.push(violation),
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

  sheriffViolations.encapsulationsCount = deepImportsCount;
  sheriffViolations.dependencyRuleViolationsCount = dependencyRulesCount;

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

  const parsedReporters = parseReporters(minimist(process.argv.slice(2)));

  parsedReporters.forEach((reporterFormat) => {
    const reporter: Reporter | null = getReporter(reporterFormat);

    if (!reporter) {
      cli.log(`Report format ${reporterFormat} is not supported`);
      return;
    }
    const exportDir = projectInfo.config.exportDir ?? '.sheriff';

    const projectName = projectInfo.rootDir.split('/').pop();
    if (!projectName) {
      cli.logError(`Project name ${projectName} is not valid`);
      return;
    }

    reporter.createReport({
      exportDir,
      projectName,
      validationResults: sheriffViolations,
    });
  });

  cli.endProcessError();
}

function parseReporters(args: minimist.ParsedArgs) {
  let reporters: string[] = [];
  if (args['reporter']) {
    if (
      typeof args['reporter'] === 'string' &&
      args['reporter'].includes(',')
    ) {
      // Handle comma-separated reporters: --reporter=json,junit
      reporters = args['reporter'].split(',').map((r) => r.trim());
    } else {
      // Handle single reporter: --reporter=json
      reporters = [args['reporter']];
    }
  }

  return reporters;
}
