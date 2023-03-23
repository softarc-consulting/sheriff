import { Rule } from 'eslint';
import { violatesDependencyRule } from '@softarc/sheriff-core';
import { toFsPath } from '@softarc/sheriff-core/src/lib/file-info/fs-path';

export const dependencyRule: Rule.RuleModule = {
  create: (context) => {
    let firstRun = true;
    return {
      ImportDeclaration: (node) => {
        try {
          const message = violatesDependencyRule(
            toFsPath(context.getFilename()),
            String(node.source.value) || '',
            firstRun
          );
          if (message) {
            context.report({
              message,
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
