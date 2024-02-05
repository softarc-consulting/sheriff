import UnassignedFileInfo from '../file-info/unassigned-file-info';
import { Module } from './module';
import { FsPath } from '../file-info/fs-path';

/**
 * Central element representing a TypeScript file with its
 * imports and assigned module.
 *
 * Due to ESLint, we can have partial imports (dev is still
 * typing). That's why there is `getRawImportForImportedFileInfo`.
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
   * For unresolvable imports (ESLint while user is typing) we want
   * to get the string as it is in the file.
   */
  getRawImportForImportedFileInfo(path: FsPath): string {
    return this.unassignedFileInfo.getRawImportForImportedFileInfo(path);
  }

  isUnresolvableImport(importCommand: string) {
    return this.unassignedFileInfo.isUnresolvableImport(importCommand);
  }
}
