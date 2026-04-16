import { UnassignedFileInfo } from '../file-info/unassigned-file-info';
import { FileInfo } from './file.info';
import { FsPath, toFsPath } from '../file-info/fs-path';
import getFs from '../fs/getFs';

/**
 * Since modules are constructed incrementally with in-place
 * modification, e.g. `addFileInfo`, a class is the better
 * approach here.
 */
export class Module {
  readonly fileInfos: FileInfo[] = [];
  private readonly barrelPrefix: string;
  private readonly barrelExt: string;

  constructor(
    public readonly path: FsPath,
    private readonly fileInfoMap: Map<FsPath, FileInfo>,
    private readonly getFileInfo: (fsPath: FsPath) => FileInfo,
    public readonly isRoot: boolean,
    public readonly hasBarrel: boolean,
    private readonly barrelFile: string,
  ) {
    const dotIndex = barrelFile.lastIndexOf('.');
    this.barrelPrefix = dotIndex !== -1 ? barrelFile.slice(0, dotIndex + 1) : '';
    this.barrelExt = dotIndex !== -1 ? barrelFile.slice(dotIndex) : '';
  }

  addFileInfo(unassignedFileInfo: UnassignedFileInfo) {
    const fileInfo = new FileInfo(unassignedFileInfo, this, this.getFileInfo);
    this.fileInfoMap.set(fileInfo.path, fileInfo);
    this.fileInfos.push(fileInfo);
  }

  get barrelPath(): FsPath {
    return toFsPath(getFs().join(this.path, this.barrelFile));
  }

  /**
   * Checks if the given file path is the main barrel file or a sub-barrel
   * file of this module.
   *
   * Sub-barrel files follow the naming convention `<barrelBaseName>.<suffix>.<ext>`.
   * For example, if the barrel file is `public-api.ts`, then `public-api.routing.ts`
   * and `public-api.bookmarks.ts` are sub-barrel files.
   *
   * Uses only string operations for performance — no filesystem or path API calls.
   */
  isBarrelFile(filePath: FsPath): boolean {
    if (!filePath.startsWith(this.path)) {
      return false;
    }

    const sepChar = filePath.charAt(this.path.length);
    if (sepChar !== '/' && sepChar !== '\\') {
      return false;
    }

    const fileName = filePath.slice(this.path.length + 1);

    if (fileName.includes('/') || fileName.includes('\\')) {
      return false;
    }

    if (fileName === this.barrelFile) {
      return true;
    }

    return (
      this.barrelPrefix !== '' &&
      fileName.startsWith(this.barrelPrefix) &&
      fileName.endsWith(this.barrelExt)
    );
  }
}
