import { DependencyRulesConfig } from './dependency-rules-config';

const dependencyRulesConfigExample: DependencyRulesConfig = {
  'domain:*': [({ from, to }) => from === to, 'domain:shared'],
  'type:feature': ['type:data', 'type:ui', 'type:model'],
  'type:data': ['type:model'],
  'type:ui': ['type:model'],
};
