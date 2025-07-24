import { describe, expect, it } from 'vitest';
import { parseEntryPointsFromCli } from '../internal/parse-entry-points-from-cli';
import { Configuration } from '../../config/configuration';

describe(parseEntryPointsFromCli.name, () => {
  it('should return entry points from config', () => {
    const config: Configuration = {
      entryPoints: {
        'app-i': 'src/app-i.ts',
        'app-ii': 'src/app-ii.ts',
      },
    } as unknown as Configuration;
    const result = parseEntryPointsFromCli('app-i,app-ii', config);

    expect(result).toEqual({
      'app-i': 'src/app-i.ts',
      'app-ii': 'src/app-ii.ts',
    });
  });
  it('should return undefined when no entryPoints are defined in config ', () => {
    expect(
      parseEntryPointsFromCli('app-i,app-ii', {} as Configuration),
    ).toBeUndefined();
  });
  it('should return single entryPoint', () => {
    const config: Configuration = {
      entryPoints: {
        'app-i': 'src/app-i.ts',
      },
    } as unknown as Configuration;
    const result = parseEntryPointsFromCli('app-i', config);

    expect(result).toEqual({
      'app-i': 'src/app-i.ts',
    });
  });
  it('should return undefined when entryFile is passed', () => {
    const config: Configuration = {
      entryFile: 'src/main.ts',
    } as unknown as Configuration;
    const result = parseEntryPointsFromCli('src/main.ts', config);
    expect(result).toBeUndefined();
  });

  it('should ignore whitespace between comma separated entryPoints', () => {
    const config: Configuration = {
      entryPoints: {
        'app-i': 'src/app-i.ts',
        'app-ii': 'src/app-ii.ts',
      },
    } as unknown as Configuration;
    const result = parseEntryPointsFromCli('app-i, app-ii', config);

    expect(result).toEqual({
      'app-i': 'src/app-i.ts',
      'app-ii': 'src/app-ii.ts',
    });
  });
});
