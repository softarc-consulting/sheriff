import FileInfo from '../file-info/file-info';
import { Module } from './module';
import { FsPath } from '../file-info/fs-path';

export class AssignedFileInfo {
  constructor(private fileInfo: FileInfo, public moduleInfo: Module) {}

  get path(): FsPath {
    return this.fileInfo.path;
  }

  get imports(): FileInfo[] {
    return this.fileInfo.imports;
  }

  getRawImportForImportedFileInfo(path: FsPath) {
    return this.fileInfo.getRawImportForImportedFileInfo(path);
  }
}
