import { JsonReporter } from './json-reporter';

export function getReporter(reporterFormat: string) {
  if (reporterFormat === 'json') {
    return new JsonReporter();
  }

  return null;
}
