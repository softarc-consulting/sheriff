import { TagConfig } from './tag-config';
import { DependencyRulesConfig } from './dependency-rules-config';

export type SheriffConfig = {
  tagging: TagConfig;
  depRules: DependencyRulesConfig;
};
