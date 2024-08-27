import { TagConfig } from '../../config/tag-config';
import { PLACE_HOLDER_REGEX } from "../../tags/calc-tags-for-module";

export function flattenTagging(tagging: TagConfig, prefix = ''): string[] {
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
      flattened = [...flattened, ...flattenTagging(value, fullPath)];
    }
  }

  return flattened;
}
