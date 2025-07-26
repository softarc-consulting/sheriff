import { DependencyRuleViolation } from '../checks/check-for-dependency-rule-violation';

export type SheriffViolations = {
  encapsulationsCount: number;
  encapsulationValidations: string[];
  dependencyRuleViolationsCount: number;
  dependencyRuleViolations: DependencyRuleViolation[];
};
