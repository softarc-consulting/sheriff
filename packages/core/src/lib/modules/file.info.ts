import { UnassignedFileInfo } from '../file-info/unassigned-file-info';
import { Module } from './module';
import { FsPath } from '../file-info/fs-path';

/**
 * Central element representing a TypeScript file with its
 * imports and assigned module.
 *
 * ESLint and the public export API need the specifiers as written
 * in the file. These are available via `getRawImportsForImportedFileInfo`.
 */
export class FileInfo {
  #imports: FileInfo[] | undefined;

  constructor(
    private unassignedFileInfo: UnassignedFileInfo,
    public moduleInfo: Module,
    private getFileInfo: (fsPath: FsPath) => FileInfo,
  ) {}

  get path(): FsPath {
    return this.unassignedFileInfo.path;
  }

  get imports(): FileInfo[] {
    if (this.#imports === undefined) {
      this.#imports = this.unassignedFileInfo.imports.map(
        (unassignedFileInfo) => this.getFileInfo(unassignedFileInfo.path),
      );
    }
    return this.#imports;
  }

  /**
   * Specifiers as written in the file (ESLint reports on those). An array,
   * because several can resolve to the same file:
   *
   * ```ts
   * // tsconfig: "paths": { "@lib/*": ["libs/*"] }
   * // libs/kit/index.ts
   * import { x } from '@lib/kit/sub'; // alias
   * export * from './sub';            // relative, same file
   * ```
   *
   * gives `['@lib/kit/sub', './sub']`.
   */
  getRawImportsForImportedFileInfo(path: FsPath): string[] {
    return this.unassignedFileInfo.getRawImportsForImportedFileInfo(path);
  }

  get unresolvableImports() {
    return this.unassignedFileInfo.unresolvableImports;
  }

  isUnresolvableImport(importCommand: string) {
    return this.unassignedFileInfo.isUnresolvableImport(importCommand);
  }

  hasUnresolvedImports() {
    return this.unassignedFileInfo.hasUnresolvableImports();
  }

  getExternalLibraries() {
    return this.unassignedFileInfo.getExternalLibraries();
  }
}
