import { cli } from '../cli';
import { SUPPORTED_REPORTER_FORMATS } from './supported-reporter-formats';

export function parseReporterFormatsFromCli(args: string[]): string[] {
  const reporters: string[] = [];

  for (const arg of args) {
    if (arg.startsWith('--reporters=')) {
      reporters.push(
        ...arg
          .slice('--reporters='.length)
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r.length > 0),
      );
    }
  }

  validateReporterFormatsFromCli(reporters);
  // filter out unsorted reporter formats
  return reporters.filter((reporter) =>
    SUPPORTED_REPORTER_FORMATS.includes(reporter),
  );
}

function validateReporterFormatsFromCli(reporters: string[]): void {
  const validReporters = SUPPORTED_REPORTER_FORMATS;
  for (const reporter of reporters) {
    if (!validReporters.includes(reporter)) {
      cli.logError(`Invalid reporter format: ${reporter}`);
    }
  }
}
