import { Rule } from 'eslint';
import { ImportDeclaration, ImportExpression } from 'estree';

export type Executor = (
  context: Rule.RuleContext,
  node: ImportExpression | ImportDeclaration,
  isFirstRun: boolean,
  filename: string,
  sourceCode: string,
) => void;
