import FileInfo from '../file-info/file-info';
import { AssignedFileInfo } from './assigned-file.info';
import { FsPath } from '../file-info/fs-path';

export class Module {
  readonly directory: string;
  assignedFileInfos: AssignedFileInfo[] = [];
  constructor(public path: FsPath) {
    this.directory = this.path.substring(
      0,
      this.path.length - '/index.ts'.length
    );
  }

  assignFileInfo(fileInfo: FileInfo) {
    this.assignedFileInfos.push(new AssignedFileInfo(fileInfo, this));
  }
}
