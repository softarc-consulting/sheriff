import { RuleMetaData } from '@typescript-eslint/utils/dist/ts-eslint';
import { Rule } from 'eslint';
import { ObjectExpression, Property } from 'estree';

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
const placeholderRegex = /<[a-zA-Z0-9]+>/;

export const validateSheriffConfig = createSheriffConfigRule(
  sheriffConfigRuleMeta,
  (node, context) => {
    const filename = context.filename;
    const projectRoot = filename.slice(
      0,
      filename.indexOf(physicalFilenamePostfix),
    );
    if (
      node.key.type === 'Identifier' &&
      filePathConfigKeys.includes(node.key.name)
    ) {
      if (node.value.type === 'ObjectExpression') {
        const modules = node.value.properties;
        modules.forEach((module) => {
          if (module.type === 'Property' && module.key.type === 'Literal') {
            const modulePath = module.key.value;
            if (typeof modulePath === 'string') {
              const fullPath = path.join(projectRoot, modulePath);

              if (module.value.type === 'ObjectExpression') {
                const paths: string[] = [];
                const traverse = (obj: ObjectExpression, prefix = '') => {
                  for (const property of obj.properties) {
                    if (
                      property.type === 'Property' &&
                      (property.key.type === 'Identifier' ||
                        property.key.type === 'Literal')
                    ) {
                      const key = (
                        property.key.type === 'Identifier'
                          ? property.key.name
                          : property.key.value
                      ) as string;
                      const currentPath = prefix ? `${prefix}/${key}` : key;

                      if (property.value.type === 'ArrayExpression') {
                        paths.push(
                          currentPath
                            .split(placeholderRegex)[0]
                            .replace(/\/$/g, ''),
                        );
                      } else if (property.value.type === 'ObjectExpression') {
                        traverse(property.value, currentPath);
                      }
                    }
                  }
                };

                traverse(module.value, fullPath);

                for (const path of paths) {
                  if (!fs.existsSync(path)) {
                    console.log('invalidPath', path);
                    context.report({
                      node: module,
                      messageId: 'invalidPath',
                      data: { filePath: path },
                    });
                  }
                }
              }
            }
          }
        });
      }
    }
  },
);
