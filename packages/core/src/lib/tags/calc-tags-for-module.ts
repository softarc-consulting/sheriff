import { MultiTags, PathMatcher, SingleTag, TagConfig } from './tag-config';
import getFs from '../fs/getFs';
import { FsPath } from '../file-info/fs-path';

export const calcTagsForModule = <Type extends string>(
  moduleDir: FsPath,
  rootDir: FsPath,
  tagConfig: TagConfig<Type>
): string[] => {
  const fs = getFs();
  const tags: string[] = [];
  const paths = fs.split(moduleDir.slice(rootDir.length + 1));

  for (const [segment, value] of Object.entries(tagConfig)) {
    let matches: boolean;
    let matchContext: string | RegExpMatchArray;
    let placeholders: Record<string, string> = {};

    if (isRegularExpression(segment)) {
      const currentPath = paths[0];
      const regExpString = segment.substring(1, segment.length - 1);
      const regExp = new RegExp(regExpString);
      const result = currentPath.match(regExp);
      matches = Boolean(result);
      matchContext = result || '';
    } else {
      const partsLength = segment.split('/').length;
      if (partsLength > paths.length) {
        continue;
      }
      const currentPath = paths.slice(0, partsLength).join('/');
      matchContext = currentPath;
      const placeholderMatch = segment.match(/{([a-zA-Z]+)}/);
      if (placeholderMatch) {
        const result = handlePlaceholderMatching(
          segment,
          currentPath,
          placeholderMatch
        );
        matches = result.matches;
        placeholders = result.placeholders;
      } else {
        matches = segment === currentPath;
      }
    }

    if (matches && isTagMatcher<Type>(value)) {
      const tagOrTagsProperty = 'tag' in value ? value.tag : value.tags;

      if (typeof tagOrTagsProperty === 'function') {
        addToTags(
          tags,
          tagOrTagsProperty(matchContext as PathMatcher<Type>, placeholders)
        );
      } else {
        addToTags(tags, tagOrTagsProperty);
      }
    }
  }

  return tags;
};

function isTagMatcher<Type extends string>(
  value: unknown
): value is SingleTag<Type> | MultiTags<Type> {
  if (value && typeof value === 'object') {
    return 'tag' in value || 'tags' in value;
  }
  return false;
}

function addToTags(tags: string[], value: string | string[]) {
  if (typeof value === 'string') {
    tags.push(value);
  } else {
    tags.push(...value);
  }
}

function isRegularExpression(segment: string) {
  return segment.startsWith('/') && segment.endsWith('/');
}

function handlePlaceholderMatching(
  segment: string,
  currentPath: string,
  placeholderMatch: RegExpMatchArray
) {
  let matches = false;
  let placeholders: Record<string, string> = {};
  const placeholderRegex = segment.replace(/{[a-zA-Z]+}/g, '(.+)');
  const pathMatch = currentPath.match(new RegExp(placeholderRegex));
  if (pathMatch) {
    matches = true;
    placeholders = Object.fromEntries(
      placeholderMatch
        .slice(1)
        .map((placeholder, ix) => [placeholder, pathMatch[ix + 1]])
    );
  } else {
    matches = false;
  }
  return { matches, placeholders };
}
