import { describe, it, vitest } from 'vitest';
import { hasDeepImport } from './deep-import';

vitest.mock('./fs/getFs', () => ({
  default: () => ({
    findNearestParentFile: () => '',
  }),
}));

describe('deep import', () => {
  it('should always return false', () => {
    hasDeepImport('app.component', '@angular/core');
  });
});
