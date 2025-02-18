import { RuleMetaData } from '@typescript-eslint/utils/dist/ts-eslint';
import { Rule } from 'eslint';
import { Property } from 'estree';
import fs from 'fs';
import path from 'path';

const createSheriffConfigRule: (
  meta: RuleMetaData<string>,
  executor: (
    node: Property & Rule.NodeParentExtension,
    context: Rule.RuleContext,
  ) => void,
) => Rule.RuleModule = (meta, executor) => ({
  meta,
  create: (context) => {
    // TODO: involve UserError concept in executor
    // const message =
    //         error instanceof UserError
    //           ? `User Error: ${error.code} - ${error.message}`
    //           : `${ruleName} (internal error): ${
    //               error instanceof Error ? error.message : String(error)
    //             }`;

    return {
      Property(node) {
        executor(node, context);
      },
    };
  },
});

const sheriffConfigRuleMeta: RuleMetaData<string> = {
  type: 'problem',
  docs: {
    description: 'Ensure file paths in sheriff.config.ts are valid',
  },
  messages: {
    invalidPath:
      "File path '{{ filePath }}' is not a real folder or barrel file",
  },
  schema: [],
};

export const sheriffConfigRule = createSheriffConfigRule(
  sheriffConfigRuleMeta,
  (node, context) => {
    if (node.key.type === 'Identifier' && node.key.name === 'modules') {
      if (node.value.type === 'ObjectExpression') {
        const modules = node.value.properties;
        modules.forEach((module) => {
          if (module.type === 'Property' && module.key.type === 'Literal') {
            const modulePath = module.key.value;
            if (typeof modulePath === 'string') {
              const fullPath = path.resolve(__dirname, modulePath);
              if (!fs.existsSync(fullPath)) {
                context.report({
                  node,
                  messageId: 'invalidPath',
                  data: {
                    filePath: modulePath,
                  },
                });
              }
            }
          }
        });
      }
    }
  },
);
