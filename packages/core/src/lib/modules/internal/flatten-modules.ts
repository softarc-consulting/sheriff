import { ModuleConfig } from '../../config/module-config';
import { PLACE_HOLDER_REGEX } from "../../tags/calc-tags-for-module";

export function flattenModules(tagging: ModuleConfig, prefix = ''): string[] {
  let flattened: string[] = [];
  for (const [rawPath, value] of Object.entries(tagging)) {
    const path = rawPath.replace(PLACE_HOLDER_REGEX, '*');
    const fullPath = prefix ? `${prefix}/${path}` : path;
    if (
      typeof value === 'string' ||
      typeof value === 'function' ||
      Array.isArray(value)
    ) {
      flattened.push(fullPath);
    } else {
      flattened = [...flattened, ...flattenModules(value, fullPath)];
    }
  }

  return flattened;
}
