import { UserError } from '@softarc/sheriff-core';
import { Rule } from 'eslint';
import path from 'path';
import { Executor, ExecutorNode } from './executor';
import { FileFilter } from './file-filter';

/**
 * Factory function generating a rule that traverses
 * through `ImportExpression` and `ImportDeclaration` nodes.
 *
 * We keep the information, if the rule is executed for
 * the first time and pass it on to Sheriff which needs
 * this information for caching.
 *
 * In case Sheriff throws an error, we stop, show the error
 * in the first line, and don't process any further.
 */
export const createRule: (
  ruleName: string,
  fileFilter: FileFilter,
  executor: Executor,
) => Rule.RuleModule = (ruleName, fileFilter, executor) => ({
  create: (context) => {
    const filename = context.filename ?? context.getFilename();
    if (isExcluded(fileFilter, filename)) {
      return {};
    }

    let isFirstRun = true;
    let hasInternalError = false;
    const executeRuleWithContext = (node: ExecutorNode) => {
      const sourceCode =
        context.sourceCode?.text ?? context.getSourceCode().text;

      if (!hasInternalError) {
        try {
          // don't process special export `export const value = {n: 1};`
          if (!node.source) {
            return;
          }

          executor(context, node, isFirstRun, filename, sourceCode);
        } catch (error) {
          hasInternalError = true;
          const message =
            error instanceof UserError
              ? `User Error: ${error.code} - ${error.message}`
              : `${ruleName} (internal error): ${
                  error instanceof Error ? error.message : String(error)
                }`;
          context.report({
            message,
            node,
          });
        }
        isFirstRun = false;
      }
    };

    return {
      ImportExpression: executeRuleWithContext,
      ImportDeclaration: executeRuleWithContext,
      ExportAllDeclaration: executeRuleWithContext,
      ExportNamedDeclaration: executeRuleWithContext,
    };
  },
});

function isExcluded({ include, exclude }: FileFilter, filePath: string) {
  const fileName = path.basename(filePath);
  return (
    (include && !include.some((includeFile) => fileName === includeFile)) ||
    (exclude && exclude.some((excludeFile) => fileName === excludeFile))
  );
}
