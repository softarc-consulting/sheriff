import { SheriffViolations } from '../../sheriff-violations';

export interface Reporter {
  createReport(args: {
    exportDir: string;
    projectName: string;
    validationResults: SheriffViolations;
  }): void;
}
