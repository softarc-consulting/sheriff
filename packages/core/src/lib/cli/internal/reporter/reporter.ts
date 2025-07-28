import { ProjectViolation } from '../../project-violation';

export interface Reporter {
  createReport(validationResults: ProjectViolation): void;
}
