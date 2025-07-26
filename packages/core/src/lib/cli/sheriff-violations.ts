import { DependencyRuleViolation } from '../checks/check-for-dependency-rule-violation';
import { ValidationsMap } from './verify';

export type SheriffViolations = {
  deepImportsCount: number;
  dependencyRulesCount: number;
  filesCount: number;
  hasError: boolean;
  validationsMap: ValidationsMap;
};
