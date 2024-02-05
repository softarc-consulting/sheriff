import UnassignedFileInfo from '../file-info/unassigned-file-info';
import { FileInfo } from './file.info';
import { FsPath } from '../file-info/fs-path';

export class Module {
  readonly directory: string;
  fileInfos: FileInfo[] = [];
  constructor(
    public path: FsPath,
    private fileInfoMap: Map<FsPath, FileInfo>,
    private getFileInfo: (fsPath: FsPath) => FileInfo,
  ) {
    if (path.endsWith('index.ts')) {
      this.directory = this.path.substring(
        0,
        this.path.length - '/index.ts'.length,
      );
    } else {
      this.directory = path;
    }
  }

  addFileInfo(unassignedFileInfo: UnassignedFileInfo) {
    const fileInfo = new FileInfo(unassignedFileInfo, this, this.getFileInfo);
    this.fileInfoMap.set(fileInfo.path, fileInfo);
    this.fileInfos.push(fileInfo);
  }
}
