import { FsPath } from '../2-file-info/fs-path';

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
export type RuleMatcher = string | null | RuleMatcherFn;
export type DependencyRulesConfig = Record<string, RuleMatcher | RuleMatcher[]>;
