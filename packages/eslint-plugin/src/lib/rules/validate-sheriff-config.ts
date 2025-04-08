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
      "User Error: File path '{{ filePath }}' is not a real folder or barrel file",
  },
  schema: [],
};

const physicalFilenamePostfix = '/sheriff.config.ts';
const filePathConfigKeys = ['modules', 'tagging'];

export const validateSheriffConfig = createSheriffConfigRule(
  sheriffConfigRuleMeta,
  (node, context) => {
    if (
      node.key.type === 'Identifier' &&
      filePathConfigKeys.includes(node.key.name)
    ) {
      if (node.value.type === 'ObjectExpression') {
        const modules = node.value.properties;
        modules.forEach((module) => {
          if (module.type === 'Property' && module.key.type === 'Literal') {
            let modulePath = module.key.value;
            if (typeof modulePath === 'string') {
              // Get nested module properties
              if (module.value.type === 'ObjectExpression') {
                const subModules = module.value.properties;
                for (const subModule of subModules) {
                  if (
                    subModule.type === 'Property' &&
                    subModule.key.type === 'Literal'
                  ) {
                    const subPath = subModule.key.value;
                    if (typeof subPath === 'string') {
                      modulePath = path.join(modulePath, subPath);
                    }
                  }
                }
              }
              // remove placeholder from path
              modulePath = modulePath.split('<')[0];
              const fullPath = path.resolve(
                context.physicalFilename.replace(physicalFilenamePostfix, ''),
                modulePath,
              );
              if (!fs.existsSync(fullPath)) {
                context.report({
                  node,
                  messageId: 'invalidPath',
                  data: {
                    filePath: fullPath,
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
