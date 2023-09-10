import { FsPath } from '../file-info/fs-path';

export type DependencyCheckContext = {
  fromModulePath: FsPath;
  toModulePath: FsPath;
  fromFilePath: FsPath;
  toFilePath: FsPath;
};

export type RuleMatcherFn = (
  context: {
    from: string;
    to: string;
  } & DependencyCheckContext
) => boolean;
type CustomMessageFn = (to: string) => string | undefined;

export interface RuleWithCustomMessage {
  message: CustomMessageFn;
  matcher: RuleMatcher | RuleMatcher[];
}
export type Rule = RuleWithCustomMessage | RuleMatcher[] | RuleMatcher;
export type RuleMatcher = string | null | RuleMatcherFn;
export type DependencyRulesConfig = Record<string, Rule>;
