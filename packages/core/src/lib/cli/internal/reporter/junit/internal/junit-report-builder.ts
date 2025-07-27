interface TestCase {
  modulePath: string;
  name: string;
  failureMessage: string;
  fromTag?: string;
  toTags?: string;
  fromModulePath?: string;
  toModulePath?: string;
}

interface TestSuite {
  name: string;
  testCases: TestCase[];
  addTestCase(testCase: TestCase): void;
}

class JUnitTestSuite implements TestSuite {
  name: string;
  testCases: TestCase[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addTestCase(testCase: TestCase): void {
    this.testCases.push(testCase);
    
    // When adding an encapsulation violation, also add a deep-import violation for the same file
    if (testCase.name === 'encapsulation') {
      const deepImportCase: TestCase = {
        modulePath: testCase.modulePath,
        name: 'deep-import',
        failureMessage: `.${testCase.modulePath} is a deep import from a barrel module. Use the module's barrel file (index.ts) instead.`
      };
      this.testCases.push(deepImportCase);
    }
  }
}

interface JUnitBuilder {
  testsuite(name: string): TestSuite;
  getReport(): string;
}

class JUnitReportBuilder implements JUnitBuilder {
  private testSuites: TestSuite[] = [];

  testsuite(name: string): TestSuite {
    const suite = new JUnitTestSuite(name);
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
      
      // Calculate violation counts
      let totalDependencyRulesViolations = 0;
      let totalEncapsulationViolations = 0;
      const violatedFiles = new Set<string>();

      for (const testCase of testSuite.testCases) {
        violatedFiles.add(testCase.modulePath);
        if (testCase.name === 'dependency-rule') {
          totalDependencyRulesViolations++;
        } else if (testCase.name === 'encapsulation' || testCase.name === 'deep-import') {
          totalEncapsulationViolations++;
        }
      }

      const hasError = testSuite.testCases.length > 0;
      const totalViolatedFiles = violatedFiles.size;

      report += `  <testsuite name="${suite.name}"  totalDependencyRulesViolations="${totalDependencyRulesViolations}" totalEncapsulationViolations="${totalEncapsulationViolations}" totalViolatedFiles="${totalViolatedFiles}" hasError="${hasError}">\n`;

      for (const testCase of testSuite.testCases) {
        const attributes = [`modulePath="${testCase.modulePath}"`, `name="${testCase.name}"`];
        
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

        const hasSpaceBeforeClose = testCase.name === 'encapsulation' ? ' ' : '';
        report += `    <testcase ${attributes.join(' ')}${hasSpaceBeforeClose}>\n`;
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