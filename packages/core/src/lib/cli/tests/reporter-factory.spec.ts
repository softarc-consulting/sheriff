import { describe, it, expect } from 'vitest';
import { reporterFactory } from '../internal/reporter/reporter-factory';
import { JsonReporter } from '../internal/reporter/json/json-reporter';
import { JunitReporter } from '../internal/reporter/junit/junit-reporter';

describe('ReporterFactory', () => {
  const defaultOptions = {
    outputDir: 'test-reports',
    projectName: 'test-project',
  };

  it('should return empty array when no reporter formats are provided', () => {
    const reporters = reporterFactory({
      ...defaultOptions,
      reporterFormats: [],
    });

    expect(reporters).toEqual([]);
  });

  it('should create JsonReporter when json format is specified', () => {
    const reporters = reporterFactory({
      ...defaultOptions,
      reporterFormats: ['json'],
    });

    expect(reporters).toHaveLength(1);
    expect(reporters[0]).toBeInstanceOf(JsonReporter);
  });

  it('should create JunitReporter when junit format is specified', () => {
    const reporters = reporterFactory({
      ...defaultOptions,
      reporterFormats: ['junit'],
    });

    expect(reporters).toHaveLength(1);
    expect(reporters[0]).toBeInstanceOf(JunitReporter);
  });

  it('should create multiple reporters when multiple formats are specified', () => {
    const reporters = reporterFactory({
      ...defaultOptions,
      reporterFormats: ['json', 'junit'],
    });

    expect(reporters).toHaveLength(2);
    expect(reporters[0]).toBeInstanceOf(JsonReporter);
    expect(reporters[1]).toBeInstanceOf(JunitReporter);
  });

  it('should ignore unknown reporter formats', () => {
    const reporters = reporterFactory({
      ...defaultOptions,
      reporterFormats: ['json', 'unknown-format', 'junit'],
    });

    expect(reporters).toHaveLength(2);
    expect(reporters[0]).toBeInstanceOf(JsonReporter);
    expect(reporters[1]).toBeInstanceOf(JunitReporter);
  });

  it('should handle duplicate reporter formats by creating multiple instances', () => {
    const reporters = reporterFactory({
      ...defaultOptions,
      reporterFormats: ['json', 'json'],
    });

    expect(reporters).toHaveLength(2);
    expect(reporters[0]).toBeInstanceOf(JsonReporter);
    expect(reporters[1]).toBeInstanceOf(JsonReporter);
  });

  it('should maintain order of reporters based on format array order', () => {
    const reporters1 = reporterFactory({
      ...defaultOptions,
      reporterFormats: ['json', 'junit'],
    });

    const reporters2 = reporterFactory({
      ...defaultOptions,
      reporterFormats: ['junit', 'json'],
    });

    expect(reporters1[0]).toBeInstanceOf(JsonReporter);
    expect(reporters1[1]).toBeInstanceOf(JunitReporter);

    expect(reporters2[0]).toBeInstanceOf(JunitReporter);
    expect(reporters2[1]).toBeInstanceOf(JsonReporter);
  });
});
