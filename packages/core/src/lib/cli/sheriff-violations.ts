import { ValidationsMap } from './verify';

export type SheriffViolations = {
  totalDeepImportsViolations: number;
  totalDependencyRulesViolations: number;
  totalEncapsulationViolations: number;
  totalViolatedFiles: number;
  hasError: boolean;
  violations: ValidationsMap[];
};
