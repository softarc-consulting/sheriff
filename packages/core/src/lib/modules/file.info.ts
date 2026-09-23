import { UnassignedFileInfo } from '../file-info/unassigned-file-info';
import { Module } from './module';
import { FsPath } from '../file-info/fs-path';

/**
 * Central element representing a TypeScript file with its
 * imports and assigned module.
 *
 * Imports are resolved to file paths. The specifiers as written
 * in the file are available via `getRawImportsForImportedFileInfo`.
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
   * Returns every specifier with which the file at `path` is imported.
   *
   * ESLint reports on the import as it is written, so we need the raw
   * string and not only the resolved path.
   *
   * It is an array, because different specifiers can resolve to the
   * same file, and a file can import it more than once:
   *
   * ```ts
   * // tsconfig: "paths": { "@lib/*": ["libs/*"] }
   *
   * // libs/kit/index.ts
   * import { x } from '@lib/kit/sub'; // path alias
   * export * from './sub';            // relative
   * ```
   *
   * Both resolve to `libs/kit/sub/index.ts`, so the result is
   * `['@lib/kit/sub', './sub']`.
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
