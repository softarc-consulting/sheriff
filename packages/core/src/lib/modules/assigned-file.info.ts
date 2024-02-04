import FileInfo from '../file-info/file-info';
import { Module } from './module';
import { FsPath } from '../file-info/fs-path';

/**
 * Central element representing a TypeScript file with its
 * imports and assigned module.
 *
 * Due to ESLint, we can have partial imports (dev is still
 * typing). That's why there is `getRawImportForImportedFileInfo`.
 */
export class AssignedFileInfo {
  constructor(private fileInfo: FileInfo, public moduleInfo: Module) {}

  get path(): FsPath {
    return this.fileInfo.path;
  }

  get imports(): FileInfo[] {
    return this.fileInfo.imports;
  }

  /**
   * For unresolvable imports (ESLint while user is typing) we want
   * to get the string as it is in the file.
   */
  getRawImportForImportedFileInfo(path: FsPath): string {
    return this.fileInfo.getRawImportForImportedFileInfo(path);
  }
}
