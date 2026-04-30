import { FsPath } from '../file-info/fs-path';

export interface DependencyCheckContext {
  from: string;
  to: string;
  fromModulePath: FsPath;
  toModulePath: FsPath;
  fromFilePath: FsPath;
  toFilePath: FsPath;
  fromTags: string[];
  toTags: string[];
}

export type RuleMatcherFn = (context: DependencyCheckContext) => boolean;

export type RuleMatcher = string | null | RuleMatcherFn;
export type DependencyRulesConfig = Record<string, RuleMatcher | RuleMatcher[]>;
