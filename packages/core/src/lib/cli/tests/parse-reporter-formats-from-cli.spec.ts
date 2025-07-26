import { describe, expect, it } from 'vitest';
import { parseReporterFormatsFromCli } from '../internal/parse-reporter-formats-from-cli';

describe('parseReporterFormatsFromCli', () => {
  it('should extract correctly when a --reporters flag is given', () => {
    expect(
      parseReporterFormatsFromCli(['src/main.ts', '--reporters=junit']),
    ).toEqual(['junit']);
  });

  it('should find --reporters flag at any position', () => {
    expect(
      parseReporterFormatsFromCli([
        'src/main.ts',
        'A',
        '--reporters=junit',
        '--anotherOne=true',
      ]),
    ).toEqual(['junit']);
  });

  it('should return empty array when no --reporters flag is given', () => {
    expect(parseReporterFormatsFromCli(['src/main.ts'])).toEqual([]);
  });

  it('should parse reporters which are comma separated', () => {
    expect(
      parseReporterFormatsFromCli(['src/main.ts', '--reporters=junit ,json']),
    ).toEqual(['junit', 'json']);
  });

  it('should filter out not supported reporters', () => {
    expect(
      parseReporterFormatsFromCli(['src/main.ts', '--reporters=junit,a, b']),
    ).toEqual(['junit']);
  });
});
