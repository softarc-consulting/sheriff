import { Rule } from 'eslint';
import { ImportDeclaration, ImportExpression } from 'estree';
import { Executor } from './executor';
import { UserError } from '@softarc/sheriff-core';

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
  executor: Executor,
) => Rule.RuleModule = (ruleName, executor) => ({
  create: (context) => {
    let isFirstRun = true;
    let hasInternalError = false;
    const executeRuleWithContext = (
      node: ImportExpression | ImportDeclaration,
    ) => {
      const filename = context.filename ?? context.getFilename();
      const sourceCode =
        context.sourceCode?.text ?? context.getSourceCode().text;
      if (!hasInternalError) {
        try {
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
    };
  },
});
