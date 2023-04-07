import FileInfo from '../2-file-info/file-info';
import { AssignedFileInfo } from './assigned-file.info';
import { FsPath } from '../2-file-info/fs-path';

export class Module {
  readonly directory: string;
  assignedFileInfos: AssignedFileInfo[] = [];
  constructor(public path: FsPath) {
    if (path.endsWith('index.ts')) {
      this.directory = this.path.substring(
        0,
        this.path.length - '/index.ts'.length
      );
    } else {
      this.directory = path;
    }
  }

  assignFileInfo(fileInfo: FileInfo) {
    this.assignedFileInfos.push(new AssignedFileInfo(fileInfo, this));
  }
}
