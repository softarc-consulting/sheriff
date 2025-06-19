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
                './non-existent-folder': {
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
          errors: [
            {
              message:
                "User Error: File path '/project/non-existent-folder/holidays' is not a real folder or barrel file",
            },
            {
              message:
                "User Error: File path '/project/non-existent-folder/customers/feature' is not a real folder or barrel file",
            },
            {
              message:
                "User Error: File path '/project/non-existent-folder/customers/data' is not a real folder or barrel file",
            },
          ],
        },
      ],
    });
  });

  it('should fail when a file path does not exist and paths are not nested', () => {
    tester.run('validate-sheriff-config', validateSheriffConfig, {
      valid: [],
      invalid: [
        {
          code: `
            const config = {
              modules: {
                'libs/feature-booking/src': ['domain:booking', 'type:feature'],
                'libs/feature-booking/src/internal/data-booking': [
                  'domain:booking',
                  'type:data',
                ],
                'libs/feature-booking/src/internal/feature-flight-search': [
                  'domain:booking',
                  'type:feature',
                ],
              },
            };
          `,
          filename: '/project/sheriff.config.ts',
          errors: [
            {
              message:
                "User Error: File path '/project/libs/feature-booking/src' is not a real folder or barrel file",
            },
            {
              message:
                "User Error: File path '/project/libs/feature-booking/src/internal/data-booking' is not a real folder or barrel file",
            },
            {
              message:
                "User Error: File path '/project/libs/feature-booking/src/internal/feature-flight-search' is not a real folder or barrel file",
            },
          ],
        },
      ],
    });
  });

  it('should NOT run the rule if the file is excluded', () => {
    tester.run('validate-sheriff-config', validateSheriffConfig, {
      valid: [
        {
          code: `
            const config = {
              modules: {
                'non-existent-folder': {
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
          filename: '/project/not-a-sheriff-config-file.ts',
        },
      ],
      invalid: [],
    });
  });
});
