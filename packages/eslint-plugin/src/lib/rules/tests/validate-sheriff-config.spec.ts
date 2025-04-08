import { RuleTester } from 'eslint';
import { parser } from 'typescript-eslint';
import { describe, it, vi } from 'vitest';
import { validateSheriffConfig } from '../validate-sheriff-config';

vi.mock('fs', () => ({
  default: {
    existsSync: (_path: string) => _path === '/project/existing-folder/shared',
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
                './existing-folder': {
                  'shared/<type>': ['shared', 'shared:<type>'],
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
