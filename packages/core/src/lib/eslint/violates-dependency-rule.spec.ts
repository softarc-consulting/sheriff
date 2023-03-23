import { describe, it } from 'vitest';

describe('violates dependency rules', () => {
  it.todo('should only run once');
  it.todo('should only run once if there is no config file available');
});
