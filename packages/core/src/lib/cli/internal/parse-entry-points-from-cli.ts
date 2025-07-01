import { Configuration } from '../../config/configuration';
import { isEmptyRecord } from '../../util/is-empty-record';

export function parseEntryPointsFromCli(
  entryFileOrEntryPoints: string,
  sheriffConfig: Configuration,
): Record<string, string> | undefined {
  const entryPointsFromConfig = sheriffConfig.entryPoints;
  if (entryFileOrEntryPoints.includes(',')) {
    if (!entryPointsFromConfig || isEmptyRecord(entryPointsFromConfig)) {
      return undefined;
    }
    const splittedEntries = entryFileOrEntryPoints.split(',');
    const entryPoints: Record<string, string> = {};

    for (const entry of splittedEntries) {
      const entryPoint = entryPointsFromConfig[entry];
      if (entryPoint) {
        entryPoints[entry] = entryPoint;
      }
    }
    return entryPoints;
  }

  // If no comma is found, it could be a single entry point
  if (
    entryPointsFromConfig &&
    entryFileOrEntryPoints in entryPointsFromConfig
  ) {
    const singleEntryPoint = entryPointsFromConfig[entryFileOrEntryPoints];
    return { [entryFileOrEntryPoints]: singleEntryPoint };
  }

  return undefined;
}
