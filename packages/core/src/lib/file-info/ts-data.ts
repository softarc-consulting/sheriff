import type * as ts from 'typescript';
import { FsPath } from './fs-path';
import { TsConfigContext } from "./get-ts-config-context";

export type TsPaths = Record<string, FsPath>;

/**
 * Contains data needed by `traverseFilesystem`.
 */
export type TsData = TsConfigContext & {
  configObject: ReturnType<typeof ts.parseJsonConfigFileContent>;
  cwd: string;
  sys: typeof ts.sys;
}
