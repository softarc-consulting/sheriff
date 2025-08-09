import { JsonReporter } from './json/json-reporter';
import { Reporter } from './reporter';
import { JunitReporter } from './junit/junit-reporter';

type ReporterConstructor = new (options: {
  outputDir: string;
  projectName: string;
}) => Reporter;

const REPORTER_REGISTRY = new Map<string, ReporterConstructor>([
  ['json', JsonReporter],
  ['junit', JunitReporter],
]);

export function reporterFactory(options: {
  reporterFormats: string[];
  outputDir: string;
  projectName: string;
}): Reporter[] {
  const reporters: Reporter[] = [];
  
  options.reporterFormats.forEach((format) => {
    const ReporterClass = REPORTER_REGISTRY.get(format);
    if (ReporterClass) {
      reporters.push(
        new ReporterClass({
          outputDir: options.outputDir,
          projectName: options.projectName,
        }),
      );
    }
  });

  return reporters;
}

export function getRegisteredFormats(): string[] {
  return Array.from(REPORTER_REGISTRY.keys());
}
