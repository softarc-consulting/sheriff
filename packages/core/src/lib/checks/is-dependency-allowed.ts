import {
  DependencyCheckContext,
  DependencyRulesConfig,
} from '../config/dependency-rules-config';
import { wildcardToRegex } from '../util/wildcard-to-regex';

export const isDependencyAllowed = (
  from: string,
  to: string,
  config: DependencyRulesConfig,
  context: DependencyCheckContext
): boolean => {
  for (const tag in config) {
    if (from.match(wildcardToRegex(tag))) {
      const value = config[tag];
      const matchers = Array.isArray(value) ? value : [value];
      for (const matcher of matchers) {
        if (typeof matcher === 'string' && matcher === to) {
          return true;
        } else if (
          typeof matcher === 'function' &&
          matcher({ from, to, ...context })
        ) {
          return true;
        }
      }
      return false;
    }
  }

  throw new Error(`cannot find module tag "${from}" in the dependency rules`);
};
