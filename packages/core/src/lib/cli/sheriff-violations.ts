import { ValidationsMap } from './verify';

export type SheriffViolations = {
  totalDependencyRuleViolations: number;
  totalEncapsulationViolations: number;
  totalViolatedFiles: number;
  hasError: boolean;
  violations: ValidationsMap[];
};
