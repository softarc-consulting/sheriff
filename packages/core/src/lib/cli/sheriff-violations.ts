import { ValidationsMap } from './verify';

export type SheriffViolations = {
  totalDependencyRulesViolations: number;
  totalEncapsulationViolations: number;
  totalViolatedFiles: number;
  hasError: boolean;
  violations: ValidationsMap[];
};
