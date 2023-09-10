import { SheriffConfig } from '../config/sheriff-config';

const sheriffConfigContentSymbol = Symbol();

/**
 * TypeScript object literals which are used
 * as content in @FileTree.
 */
export interface SheriffConfigContent {
  content: SheriffConfig;
  _type: typeof sheriffConfigContentSymbol;
}

/**
 * Type FileTree makes it a directory
 * string for a one-line (mainly import)
 * string[] for multiple imports
 * SheriffConfigContent for the sheriff configuration
 */
export type FileTreeContentType =
  | FileTree
  | string
  | string[]
  | SheriffConfigContent;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface FileTree {
  [key: string]: FileTreeContentType;
}

export const isSheriffConfigContent = (
  fileTreeContentType: FileTreeContentType
): fileTreeContentType is SheriffConfigContent => {
  return (
    typeof fileTreeContentType !== 'string' &&
    !Array.isArray(fileTreeContentType) &&
    fileTreeContentType._type === sheriffConfigContentSymbol
  );
};

export const sheriffConfig = (config: SheriffConfig): SheriffConfigContent => ({
  content: config,
  _type: sheriffConfigContentSymbol,
});
