import { Rule } from 'eslint';
import { violatesDependencyRule } from '@softarc/sheriff-core';
import { toFsPath } from '@softarc/sheriff-core/src/lib/file-info/fs-path';

export const dependencyRule: Rule.RuleModule = {
  create: (context) => {
    let firstRun = true;
    return {
      ImportDeclaration: (node) => {
        try {
          if (
            violatesDependencyRule(
              toFsPath(context.getFilename()),
              String(node.source.value) || '',
              firstRun
            )
          ) {
            context.report({
              message: 'Access to this module is not allowed',
              node,
            });
          }
          firstRun = false;
        } catch (error) {
          if (error instanceof Error) {
            context.report({
              message: `Dependency Rule (internal error): ${error.message}`,
              node,
            });
          } else {
            context.report({
              message: String(error),
              node,
            });
          }
        }
      },
    };
  },
};
