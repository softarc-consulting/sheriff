import {
  MatcherContext,
  ModuleConfig,
  TagConfigValue,
} from '../config/module-config';
import getFs from '../fs/getFs';
import { FsPath } from '../file-info/fs-path';
import {
  ExistingTagPlaceholderError,
  InvalidPlaceholderError,
  NoAssignedTagError,
  TagWithoutValueError,
} from '../error/user-error';

export const FOLDER_CHARACTERS_REGEX_STRING = '[a-zA-Z-_]';
export const PLACE_HOLDER_REGEX = /<[a-zA-Z-_]+>/g;

export const calcTagsForModule = (
  moduleDir: FsPath,
  rootDir: FsPath,
  moduleConfig: ModuleConfig,
  autoTagging = true,
): string[] => {
  if (moduleDir === rootDir) {
    return ['root'];
  }
  const fs = getFs();
  const paths = fs.split(moduleDir.slice(rootDir.length + 1));
  const placeholders: Record<string, string> = {};

  const tags = traverseModuleConfig(
    paths,
    moduleConfig,
    placeholders,
    moduleDir,
    [],
    true,
  );

  if (tags === false) {
    if (!autoTagging) {
      throw new NoAssignedTagError(moduleDir);
    }

    return ['noTag'];
  }

  return tags;
};

function traverseModuleConfig(
  paths: string[],
  tagConfig: ModuleConfig,
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

      return traverseModuleConfig(
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
  value: TagConfigValue | ModuleConfig,
): value is TagConfigValue {
  return !(typeof value === 'object' && !Array.isArray(value));
}

function assertLeafHasTag(
  value: TagConfigValue | ModuleConfig,
  tagConfigPath: string[],
): asserts value is TagConfigValue {
  if (!isTagConfigValue(value)) {
    throw new TagWithoutValueError(tagConfigPath.join('/'));
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

  const unavailablePlaceholder = replacedTag.match(PLACE_HOLDER_REGEX);
  if (unavailablePlaceholder) {
    throw new InvalidPlaceholderError(unavailablePlaceholder[0], fullDir);
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
  const placeholderRegex = pathMatcher.replace(PLACE_HOLDER_REGEX, '(.+)');
  const pathMatch = currentPath.match(new RegExp(placeholderRegex));
  if (!pathMatch) {
    return false;
  }

  placeholderMatch.forEach((placeholder, ix) => {
    if (placeholder in placeholders) {
      throw new ExistingTagPlaceholderError(placeholder);
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
    const placeholderMatch = (segmentMatcher.match(PLACE_HOLDER_REGEX) ?? []).map(
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
