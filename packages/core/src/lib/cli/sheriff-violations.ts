import { Violation } from './verify';

export type SheriffViolations = {
  totalDependencyRuleViolations: number;
  totalEncapsulationViolations: number;
  totalViolatedFiles: number;
  hasError: boolean;
  violations: Violation[];
};
