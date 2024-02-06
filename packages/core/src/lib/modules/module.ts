import UnassignedFileInfo from '../file-info/unassigned-file-info';
import { FileInfo } from './file.info';
import { FsPath, toFsPath } from '../file-info/fs-path';

export class Module {
  readonly directory: FsPath;
  fileInfos: FileInfo[] = [];
  constructor(
    public readonly path: FsPath,
    private readonly fileInfoMap: Map<FsPath, FileInfo>,
    private readonly getFileInfo: (fsPath: FsPath) => FileInfo,
    public readonly isRoot: boolean,
  ) {
    if (path.endsWith('index.ts')) {
      this.directory = toFsPath(
        this.path.substring(0, this.path.length - '/index.ts'.length),
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
