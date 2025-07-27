import { Violation } from './verify';

export type ProjectViolation = {
  totalDependencyRuleViolations: number;
  totalEncapsulationViolations: number;
  totalViolatedFiles: number;
  hasError: boolean;
  violations: Violation[];
};
