import FileInfo from '../file-info/file-info';
import { ModuleInfo } from './module-info';
import { FsPath } from '../file-info/fs-path';

export class AssignedFileInfo {
  constructor(private fileInfo: FileInfo, public moduleInfo: ModuleInfo) {}

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
