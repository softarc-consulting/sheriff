import { TagConfig } from './tag-config';
import { DependencyRulesConfig } from './dependency-rules-config';

export type SheriffConfig = {
  version: 1;
  tagging: TagConfig;
  depRules: DependencyRulesConfig;
};
