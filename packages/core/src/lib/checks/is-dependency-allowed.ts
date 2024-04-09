import {
  DependencyCheckContext,
  DependencyRulesConfig,
} from '../config/dependency-rules-config';
import { wildcardToRegex } from '../util/wildcard-to-regex';
import { NoDependencyRuleForTagError } from '../error/user-error';

export const isDependencyAllowed = (
  froms: string[],
  to: string,
  config: DependencyRulesConfig,
  context: DependencyCheckContext,
): boolean => {
  let isAllowed: boolean | undefined;
  for (const from of froms) {
    isAllowed = undefined;
    for (const tag in config) {
      if (from.match(wildcardToRegex(tag))) {
        const value = config[tag];
        const matchers = Array.isArray(value) ? value : [value];
        for (const matcher of matchers) {
          if (
            typeof matcher === 'string' &&
            to.match(wildcardToRegex(matcher))
          ) {
            return true;
          } else if (
            typeof matcher === 'function' &&
            matcher({ from, to, ...context })
          ) {
            return true;
          }
        }
        isAllowed = false;
      }
    }

    if (isAllowed === undefined) {
      throw new NoDependencyRuleForTagError(from);
    }
  }

  return false;
};
