import { RuleTester } from 'eslint';
import { parser } from 'typescript-eslint';
import { describe, it, vi } from 'vitest';
import { validateSheriffConfig } from '../validate-sheriff-config';

vi.mock('fs', () => ({
  default: {
    existsSync: (path: string) =>
      path.startsWith('/project/existing-folder/src'),
  },
}));

const tester = new RuleTester({
  languageOptions: { parser, sourceType: 'module' },
});

describe('validate-sheriff-config', () => {
  it('should pass when all file paths exist', () => {
    tester.run('validate-sheriff-config', validateSheriffConfig, {
      valid: [
        {
          code: `
            const config = {
              modules: {
                'existing-folder/src': {
                  holidays: {
                    '<type>': ['domain:holidays', 'type:<type>'],
                  },
                  customers: {
                    feature: ['domain:customers', 'type:feature'],
                    data: ['domain:customers', 'type:data'],
                  },
                },
              },
            };
          `,
          filename: '/project/sheriff.config.ts',
        },
      ],
      invalid: [],
    });
  });

  it('should fail when a file path does not exist', () => {
    tester.run('validate-sheriff-config', validateSheriffConfig, {
      valid: [],
      invalid: [
        {
          code: `
            const config = {
              modules: {
                './non-existent-folder': {},
              },
            };
          `,
          filename: '/project/sheriff.config.ts',
          errors: [
            {
              message:
                "User Error: File path '/project/non-existent-folder' is not a real folder or barrel file",
            },
          ],
        },
      ],
    });
  });
});
