import {
  DependencyCheckContext,
  DependencyRulesConfig,
  Rule,
  RuleMatcher,
  RuleMatcherFn,
  RuleWithCustomMessage,
} from '../config/dependency-rules-config';
import { wildcardToRegex } from '../util/wildcard-to-regex';
import toArray from '../util/to-array';

interface AllowedDependencyResponse {
  allowed: boolean;
  customMessage?: string;
}

export const isDependencyAllowed = (
  froms: string[],
  to: string,
  config: DependencyRulesConfig,
  context: DependencyCheckContext
): AllowedDependencyResponse => {
  let result: AllowedDependencyResponse | undefined = undefined;
  for (const from of froms) {
    const resultForFrom = findDependencyRuleForFrom(from, to, context, config);

    if (resultForFrom === undefined) {
      throw new Error(`cannot find any dependency rule for tag ${from}`);
    }
    result = resultForFrom;
    if (resultForFrom?.allowed) {
      return resultForFrom;
    }
  }

  return result as AllowedDependencyResponse;
};

const findDependencyRuleForFrom = (
  from: string,
  to: string,
  context: DependencyCheckContext,
  config: DependencyRulesConfig
): AllowedDependencyResponse | undefined => {
  let isAllowed: AllowedDependencyResponse | undefined;

  for (const [tag, rule] of Object.entries(config)) {
    if (from.match(wildcardToRegex(tag))) {
      const ruleWithCustomMessage = toRuleWithCustomMessage(rule);
      const matchers = toArray(ruleWithCustomMessage.matcher);

      const foundMatcher = matchers.find(testMatch(from, to, context));
      if (foundMatcher) {
        return { allowed: true };
      }
      // the current matcher does not allow it.
      // But we may have other matchers which might fit. So dont return immediately
      isAllowed = {
        allowed: false,
        customMessage: ruleWithCustomMessage.message(to),
      };
    }
  }
  return isAllowed;
};

const testMatch =
  (from: string, to: string, context: DependencyCheckContext) =>
  (matcher: RuleMatcher) =>
    (isRuleMatcher(matcher) && to.match(wildcardToRegex(matcher))) ||
    (isRuleMatcherFn(matcher) && matcher({ from, to, ...context }));

const isRuleMatcherFn = (matcher: Rule): matcher is RuleMatcherFn =>
  typeof matcher === 'function';
const isRuleMatcher = (matcher: Rule): matcher is string =>
  typeof matcher === 'string';

const isRuleWithCustomMessage = (
  matcher: Rule
): matcher is RuleWithCustomMessage =>
  !!(matcher as RuleWithCustomMessage).matcher;

const toRuleWithCustomMessage = (matcher: Rule): RuleWithCustomMessage => {
  if (isRuleWithCustomMessage(matcher)) {
    return matcher;
  }
  return {
    matcher,
    message: () => undefined,
  };
};
