import { SheriffViolations } from '../../sheriff-violations';

export interface Reporter {
  createReport(validationResults: SheriffViolations): void;
}
