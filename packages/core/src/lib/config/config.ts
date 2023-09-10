import { TagConfig } from './tag-config';
import { DependencyRulesConfig } from './dependency-rules-config';

export interface SheriffConfig {
  version: 1;
  tagging: TagConfig;
  depRules: DependencyRulesConfig;
}
