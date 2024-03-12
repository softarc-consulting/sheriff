import {
  MatcherContext,
  TagConfig,
  TagConfigValue,
} from '../config/tag-config';
import getFs from '../fs/getFs';
import { FsPath } from '../file-info/fs-path';

export const calcTagsForModule = (
  moduleDir: FsPath,
  rootDir: FsPath,
  tagConfig: TagConfig,
): string[] => {
  if (moduleDir === rootDir) {
    return ['root'];
  }
  const fs = getFs();
  const paths = fs.split(moduleDir.slice(rootDir.length + 1));
  const placeholders: Record<string, string> = {};

  const tags = traverseTagConfig(
    paths,
    tagConfig,
    placeholders,
    moduleDir,
    [],
    true,
  );

  if (tags === false) {
    throw new Error(`No assigned Tag for '${moduleDir}' in sheriff.config.ts`);
  }

  return tags;
};

function traverseTagConfig(
  paths: string[],
  tagConfig: TagConfig,
  placeholders: Record<string, string>,
  moduleDir: string,
  tagConfigPath: string[],
  isRoot: boolean,
): string[] | false {
  for (const pathMatcher in tagConfig) {
    if (isRoot) {
      placeholders = {};
    }
    // might be reset below
    const originalPlaceholders = { ...placeholders };

    const { matcherContext, matches, pathFragmentSpan } = matchSegment(
      pathMatcher,
      paths,
      placeholders,
    );

    if (!matches) {
      continue;
    }

    const restPaths = paths.slice(pathFragmentSpan);

    const value = tagConfig[pathMatcher];
    if (restPaths.length === 0) {
      assertLeafHasTag(value, [...tagConfigPath, pathMatcher]);
      const tagProperty = value;
      if (typeof tagProperty === 'function') {
        return addToTags(
          tagProperty(placeholders, matcherContext),
          placeholders,
          moduleDir,
        );
      } else {
        return addToTags(tagProperty, placeholders, moduleDir);
      }
    } else {
      if (isTagConfigValue(value)) {
        /**
         * Nested Module use case. Example:
         *
         * tags requested for moduleDir libs/src/holiday/data
         *
         * TagConfig:
         * {
         *   'libs/<domain>/src': 'nx-lib', // <-- we are here!
         *   'libs/<domain>/src/data': ['domain:<domain>']
         * }
         */
        placeholders = originalPlaceholders;
        continue;
      }

      return traverseTagConfig(
        restPaths,
        value,
        placeholders,
        moduleDir,
        [...tagConfigPath, pathMatcher],
        false,
      );
    }
  }

  return false;
}

function isTagConfigValue(
  value: TagConfigValue | TagConfig,
): value is TagConfigValue {
  return !(typeof value === 'object' && !Array.isArray(value));
}

function assertLeafHasTag(
  value: TagConfigValue | TagConfig,
  tagConfigPath: string[],
): asserts value is TagConfigValue {
  if (!isTagConfigValue(value)) {
    throw new Error(
      `Tag configuration '/${tagConfigPath.join(
        '/',
      )}' in sheriff.config.ts has no value`,
    );
  }
}

function addToTags(
  newTags: string | string[],
  placeholders: Record<string, string>,
  moduleDir: string,
) {
  return (Array.isArray(newTags) ? newTags : [newTags]).map((tag) =>
    replacePlaceholdersInTag(tag, placeholders, moduleDir),
  );
}

function replacePlaceholdersInTag(
  tag: string,
  placeholders: Record<string, string>,
  fullDir: string,
) {
  let replacedTag = tag;
  for (const placeholder in placeholders) {
    const value = placeholders[placeholder];
    replacedTag = replacedTag.replace(
      new RegExp(`<${placeholder}>`, 'g'),
      value,
    );
  }

  const unavailablePlaceholder = replacedTag.match(/<([a-zA-Z]+)>/);
  if (unavailablePlaceholder) {
    throw new Error(
      `cannot find a placeholder for "${unavailablePlaceholder[1]}" in tag configuration. Module: ${fullDir}`,
    );
  }

  return replacedTag;
}

function isRegularExpression(segment: string) {
  return segment.startsWith('/') && segment.endsWith('/');
}

function handlePlaceholderMatching(
  pathMatcher: string,
  currentPath: string,
  placeholderMatch: string[],
  placeholders: Record<string, string>,
) {
  const placeholderRegex = pathMatcher.replace(/<[a-zA-Z]+>/g, '(.+)');
  const pathMatch = currentPath.match(new RegExp(placeholderRegex));
  if (!pathMatch) {
    return false;
  }

  placeholderMatch.forEach((placeholder, ix) => {
    if (placeholder in placeholders) {
      throw new Error(
        `placeholder for value "${placeholder}" does already exist`,
      );
    }
    placeholders[placeholder] = pathMatch[ix + 1];
  });
  return true;
}

function handleRegularExpression(
  paths: string[],
  segment: string,
): RegExpMatchArray | null {
  const currentPath = paths[0];
  const regExpString = segment.substring(1, segment.length - 1);
  const regExp = new RegExp(regExpString);
  const match = currentPath.match(regExp);
  return match && match[0] === currentPath ? match : null;
}

function matchSegment(
  segmentMatcher: string,
  paths: string[],
  placeholders: Record<string, string>,
) {
  let matches = true;
  let pathFragment = paths[0];
  const matcherContext: MatcherContext = { segment: pathFragment };
  let pathFragmentSpan = 1;

  if (isRegularExpression(segmentMatcher)) {
    const regExpMatchArray = handleRegularExpression(paths, segmentMatcher);
    if (regExpMatchArray) {
      matcherContext.regexMatch = regExpMatchArray;
    } else {
      matches = false;
    }
  } else {
    pathFragmentSpan = segmentMatcher.split('/').length;
    if (pathFragmentSpan > paths.length) {
      matches = false;
    }
    pathFragment = paths.slice(0, pathFragmentSpan).join('/');
    const placeholderMatch = (segmentMatcher.match(/<[a-zA-Z]+>/g) ?? []).map(
      (str) => str.slice(1, str.length - 1),
    );
    if (placeholderMatch.length) {
      matches = handlePlaceholderMatching(
        segmentMatcher,
        pathFragment,
        placeholderMatch,
        placeholders,
      );
    } else {
      if (segmentMatcher !== pathFragment) {
        matches = false;
      }
    }
  }
  return {
    pathFragment,
    pathFragmentSpan,
    matches,
    matcherContext,
  };
}
