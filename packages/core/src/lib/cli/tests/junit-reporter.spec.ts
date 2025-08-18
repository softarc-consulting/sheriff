import { beforeEach, describe, it, expect, beforeAll } from 'vitest';
import { VirtualFs } from '../../fs/virtual-fs';
import getFs, { useVirtualFs } from '../../fs/getFs';
import { toFsPath } from '../../file-info/fs-path';
import { ProjectViolation } from '../project-violation';
import { JunitReporter } from '../internal/reporter/junit/junit-reporter';

describe('JUnit reporter', () => {
  let fs: VirtualFs;
  beforeAll(() => {
    useVirtualFs();
    fs = getFs() as VirtualFs;
  });

  beforeEach(() => {
    fs.reset();
    fs.createDir('/project/customers/feature');
    fs.createDir('/project/shared/master-data');
    fs.createDir('/project/customers/ui');
    fs.createDir('/project/app/shared/form');
  });
  it('should create a xml-file in /.sheriff/project/violations.xml', () => {
    const reporter = new JunitReporter({
      outputDir: '.sheriff',
      projectName: 'project',
    });
    const violations: ProjectViolation = {
      totalEncapsulationViolations: 0,
      totalViolatedFiles: 0,
      totalDependencyRuleViolations: 2,
      hasError: true,
      violations: [
        {
          filePath: '/project/customers/feature/feature.ts',
          encapsulations: [],
          dependencyRules: [],
          dependencyRuleViolations: [
            {
              rawImport: '@eternal/shared/master-data',
              fromModulePath: toFsPath('/project/customers/feature'),
              toModulePath: toFsPath('/project/shared/master-data'),
              fromTag: 'domain:customers',
              toTags: ['shared:master-data'],
            },
          ],
        },
        {
          filePath: '/project/customers/ui/ui.ts',
          encapsulations: [],
          dependencyRules: [],
          dependencyRuleViolations: [
            {
              rawImport: '@eternal/shared/form',
              fromModulePath: toFsPath('/project/customers/ui'),
              toModulePath: toFsPath('/project/app/shared/form'),
              fromTag: 'domain:customers',
              toTags: ['shared:form'],
            },
          ],
        },
      ],
    };
    reporter.createReport(violations);

    expect(fs.readFile('.sheriff/project/violations.xml')).toMatchSnapshot();
  });
});
