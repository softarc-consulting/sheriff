import { JsonReporter } from './json-reporter';
import { Reporter } from './reporter';

export function reporterFactory(options: {
  reporterFormats: string[];
  outputDir: string;
  projectName: string;
}): Reporter[] {
  const reporters: Reporter[] = [];
  options.reporterFormats.forEach((format) => {
    if (format === 'json') {
      reporters.push(
        new JsonReporter({
          outputDir: options.outputDir,
          projectName: options.projectName,
        }),
      );
    }
  });

  return reporters;
}
