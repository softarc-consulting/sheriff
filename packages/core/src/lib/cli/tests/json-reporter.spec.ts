import { beforeEach, describe, it, vitest, expect, beforeAll } from 'vitest';
import { VirtualFs } from '../../fs/virtual-fs';
import getFs, { useVirtualFs } from '../../fs/getFs';
import { JsonReporter } from '../internal/reporter/json-reporter';
import { toFsPath } from '../../file-info/fs-path';

import { SheriffViolations } from '../sheriff-violations';

describe('json reporter', () => {
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
  it('should create a json-file in /.sheriff/project/sheriff-report.json', () => {
    const reporter = new JsonReporter();
    const violations: SheriffViolations = {
      encapsulationsCount: 0,
      encapsulationValidations: [],
      dependencyRuleViolationsCount: 2,
      dependencyRuleViolations: [
        {
          rawImport: '@eternal/shared/master-data',
          fromModulePath: toFsPath('/project/customers/feature'),
          toModulePath: toFsPath('/project/shared/master-data'),
          fromTag: 'domain:customers',
          toTags: ['shared:master-data'],
        },
        {
          rawImport: '@eternal/shared/form',
          fromModulePath: toFsPath('/project/customers/ui'),
          toModulePath: toFsPath('/project/app/shared/form'),
          fromTag: 'domain:customers',
          toTags: ['shared:form'],
        },
      ],
    };
    reporter.createReport({
      exportDir: '.sheriff',
      projectName: 'project',
      validationResults: violations,
    });

    expect(
      fs.readFile('.sheriff/project/sheriff-report.json'),
    ).toMatchSnapshot();
  });
});
