import { describe, it, expect } from 'vitest';
import { junitBuilder } from '../internal/reporter/junit/internal/junit-report-builder';

describe('JUnitReportBuilder', () => {
  it('should create a new builder', () => {
    const builder = junitBuilder();

    expect(builder).toBeDefined();
    expect(builder.getReport()).toEqual(`<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
</testsuites>`);
  });
  it('testsuite() should create a new Testsuite ', () => {
    const builder = junitBuilder();
    const suite = builder.testsuite('Example Suite');
    const expectedResult = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="Example Suite"  totalDependencyRulesViolations="0" totalEncapsulationViolations="0" totalViolatedFiles="0" hasError="false">
  </testsuite>
</testsuites>`;

    expect(builder.getReport()).toEqual(expectedResult);
  });

  it('should add a new test case', () => {
    const builder = junitBuilder();
    const suite = builder.testsuite('Example Suite');
    suite.addTestCase({
      modulePath: 'src/utils.ts',
      name: 'encapsulation',
      failureMessage: '.src/utils.ts cannot be imported. It is encapsulated.',
    });
    suite.addTestCase({
      modulePath: 'src/app/shared/config/configuration.ts',
      name: 'dependency-rule',
      failureMessage:
        'module src/app/shared/config cannot access src/app/bookings. Tag shared has no clearance for tags domain:bookings,type:feature',
      fromTag: 'shared',
      toTags: 'domain:bookings,type:feature',
      fromModulePath: 'src/app/shared/config/configuration.ts',
      toModulePath: 'src/app/bookings',
    });

    const expectedResult = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="Example Suite"  totalDependencyRulesViolations="1" totalEncapsulationViolations="2" totalViolatedFiles="2" hasError="true">
    <testcase modulePath="src/utils.ts" name="encapsulation" >
      <failure message=".src/utils.ts cannot be imported. It is encapsulated."/>
    </testcase>
    <testcase modulePath="src/utils.ts" name="deep-import">
      <failure message=".src/utils.ts is a deep import from a barrel module. Use the module's barrel file (index.ts) instead."/>
    </testcase>
    <testcase modulePath="src/app/shared/config/configuration.ts" name="dependency-rule" fromTag="shared" toTags="domain:bookings,type:feature" fromModulePath="src/app/shared/config/configuration.ts" toModulePath="src/app/bookings">
      <failure message="module src/app/shared/config cannot access src/app/bookings. Tag shared has no clearance for tags domain:bookings,type:feature"/>
    </testcase>
  </testsuite>
</testsuites>`;

    expect(builder.getReport()).toEqual(expectedResult);
  });
});
