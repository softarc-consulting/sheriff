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
  tagConfig: TagConfig
): string[] => {
  if (moduleDir === rootDir) {
    return ['root'];
  }
  const fs = getFs();
  const tags: string[] = [];
  let paths = fs.split(moduleDir.slice(rootDir.length + 1));
  const placeholders: Record<string, string> = {};
  let currentTagConfig = tagConfig;

  while (paths.length > 0) {
    let foundMatch = false;
    for (const pathMatcher in currentTagConfig) {
      const value = currentTagConfig[pathMatcher];
      const { matcherContext, matches, pathFragmentSpan } = matchSegment(
        pathMatcher,
        paths,
        placeholders
      );

      if (!matches) {
        continue;
      }

      if (isTagConfigValue(value)) {
        const tagProperty = value;
        if (typeof tagProperty === 'function') {
          addToTags(
            tags,
            tagProperty(placeholders, matcherContext),
            placeholders,
            moduleDir
          );
        } else {
          addToTags(tags, tagProperty, placeholders, moduleDir);
        }
      }
      paths = paths.slice(pathFragmentSpan);

      foundMatch = true;
      if (paths.length > 0) {
        if (isTagConfig(value)) {
          currentTagConfig = value;
        } else {
          throw new Error(
            `tag configuration has no match for module ${moduleDir}`
          );
        }
      }
      break;
    }

    if (!foundMatch) {
      throw new Error(`did not find a match for ${moduleDir} `);
    }
  }

  return tags;
};

function isTagConfigValue(
  value: TagConfigValue | TagConfig
): value is TagConfigValue {
  return !(typeof value === 'object' && !Array.isArray(value));
}

function isTagConfig(value: TagConfigValue | TagConfig): value is TagConfig {
  return !isTagConfigValue(value);
}

function addToTags(
  tags: string[],
  newTags: string | string[],
  placeholders: Record<string, string>,
  moduleDir: string
) {
  tags.push(
    ...(Array.isArray(newTags) ? newTags : [newTags]).map((tag) =>
      replacePlaceholdersInTag(tag, placeholders, moduleDir)
    )
  );
}

function replacePlaceholdersInTag(
  tag: string,
  placeholders: Record<string, string>,
  fullDir: string
) {
  let replacedTag = tag;
  for (const placeholder in placeholders) {
    const value = placeholders[placeholder];
    replacedTag = replacedTag.replace(
      new RegExp(`<${placeholder}>`, 'g'),
      value
    );
  }

  const unavailablePlaceholder = replacedTag.match(/<([a-zA-Z]+)>/);
  if (unavailablePlaceholder) {
    throw new Error(
      `cannot find a placeholder for "${unavailablePlaceholder[1]}" in tag configuration. Module: ${fullDir}`
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
  placeholders: Record<string, string>
) {
  const placeholderRegex = pathMatcher.replace(/<[a-zA-Z]+>/g, '(.+)');
  const pathMatch = currentPath.match(new RegExp(placeholderRegex));
  if (!pathMatch) {
    return false;
  }

  placeholderMatch.forEach((placeholder, ix) => {
    if (placeholder in placeholders) {
      throw new Error(
        `placeholder for value "${placeholder}" does already exist`
      );
    }
    placeholders[placeholder] = pathMatch[ix + 1];
  });
  return true;
}

function handleRegularExpression(
  paths: string[],
  segment: string
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
  placeholders: Record<string, string>
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
      (str) => str.slice(1, str.length - 1)
    );
    if (placeholderMatch.length) {
      matches = handlePlaceholderMatching(
        segmentMatcher,
        pathFragment,
        placeholderMatch,
        placeholders
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
