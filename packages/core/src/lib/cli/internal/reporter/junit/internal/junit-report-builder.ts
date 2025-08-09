interface TestCase {
  modulePath: string;
  name: string;
  failureMessage: string;
  fromTag?: string;
  toTags?: string;
  fromModulePath?: string;
  toModulePath?: string;
}

interface TestSuiteOptions {
  name: string;
  totalDependencyRulesViolations: number;
  totalEncapsulationViolations: number;
  totalViolatedFiles: number;
  hasError: boolean;
}

interface TestSuite {
  name: string;
  totalDependencyRulesViolations: number;
  totalEncapsulationViolations: number;
  totalViolatedFiles: number;
  hasError: boolean;
  testCases: TestCase[];
  addTestCase(testCase: TestCase): void;
}

class JUnitTestSuite implements TestSuite {
  name: string;
  totalDependencyRulesViolations: number;
  totalEncapsulationViolations: number;
  totalViolatedFiles: number;
  hasError: boolean;
  testCases: TestCase[] = [];

  constructor(options: TestSuiteOptions) {
    this.name = options.name;
    this.totalDependencyRulesViolations =
      options.totalDependencyRulesViolations;
    this.totalEncapsulationViolations = options.totalEncapsulationViolations;
    this.totalViolatedFiles = options.totalViolatedFiles;
    this.hasError = options.hasError;
  }

  addTestCase(testCase: TestCase): void {
    this.testCases.push(testCase);
  }
}

interface JUnitBuilder {
  testsuite(options: TestSuiteOptions): TestSuite;
  getReport(): string;
}

class JUnitReportBuilder implements JUnitBuilder {
  private testSuites: TestSuite[] = [];

  testsuite(options: TestSuiteOptions): TestSuite {
    const suite = new JUnitTestSuite(options);
    this.testSuites.push(suite);
    return suite;
  }

  getReport(): string {
    if (this.testSuites.length === 0) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
</testsuites>`;
    }

    let report = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>\n`;

    for (const suite of this.testSuites) {
      const testSuite = suite as JUnitTestSuite;

      report += `  <testsuite name="${suite.name}" totalDependencyRulesViolations="${suite.totalDependencyRulesViolations}" totalEncapsulationViolations="${suite.totalEncapsulationViolations}" totalViolatedFiles="${suite.totalViolatedFiles}" hasError="${suite.hasError}">\n`;

      for (const testCase of testSuite.testCases) {
        const attributes = [
          `modulePath="${testCase.modulePath}"`,
          `name="${testCase.name}"`,
        ];

        if (testCase.fromTag) {
          attributes.push(`fromTag="${testCase.fromTag}"`);
        }
        if (testCase.toTags) {
          attributes.push(`toTags="${testCase.toTags}"`);
        }
        if (testCase.fromModulePath) {
          attributes.push(`fromModulePath="${testCase.fromModulePath}"`);
        }
        if (testCase.toModulePath) {
          attributes.push(`toModulePath="${testCase.toModulePath}"`);
        }

        report += `    <testcase ${attributes.join(' ')}>\n`;
        report += `      <failure message="${testCase.failureMessage}"/>\n`;
        report += `    </testcase>\n`;
      }

      report += `  </testsuite>\n`;
    }

    report += `</testsuites>`;

    return report;
  }
}

export function junitBuilder(): JUnitBuilder {
  return new JUnitReportBuilder();
}
