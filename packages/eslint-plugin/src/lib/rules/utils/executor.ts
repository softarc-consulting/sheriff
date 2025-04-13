import { Rule } from 'eslint';
import {ExportAllDeclaration, ExportNamedDeclaration, ImportDeclaration, ImportExpression} from 'estree';

export type ExecutorNode = ImportExpression | ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration;

export type Executor = (
  context: Rule.RuleContext,
  node: ExecutorNode,
  isFirstRun: boolean,
  filename: string,
  sourceCode: string,
) => void;
