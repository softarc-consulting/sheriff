import { UnassignedFileInfo } from '../file-info/unassigned-file-info';
import { FileInfo } from './file.info';
import { FsPath } from '../file-info/fs-path';
import { matchGlob } from '../util/match-glob';

/**
 * Since modules are constructed incrementally with in-place
 * modification, e.g. `addFileInfo`, a class is the better
 * approach here.
 */
export class Module {
  readonly fileInfos: FileInfo[] = [];

  constructor(
    public readonly path: FsPath,
    private readonly fileInfoMap: Map<FsPath, FileInfo>,
    private readonly getFileInfo: (fsPath: FsPath) => FileInfo,
    public readonly isRoot: boolean,
    public readonly hasBarrel: boolean,
    private readonly barrelFilePatterns: string[],
  ) {
  }

  addFileInfo(unassignedFileInfo: UnassignedFileInfo) {
    const fileInfo = new FileInfo(unassignedFileInfo, this, this.getFileInfo);
    this.fileInfoMap.set(fileInfo.path, fileInfo);
    this.fileInfos.push(fileInfo);
  }

  /**
   * Checks whether the given file path is a barrel (entry) file
   * of this module by matching its filename against the configured
   * barrel file patterns.
   *
   * Only files directly inside the module root directory qualify;
   * nested files with barrel-like names (e.g. `internal/index.ts`)
   * are not treated as barrel entries.
   */
  isBarrelFile(filePath: FsPath): boolean {
    const lastSep = Math.max(
      filePath.lastIndexOf('/'),
      filePath.lastIndexOf('\\'),
    );
    const fileDir = lastSep === -1 ? '' : filePath.substring(0, lastSep);
    const fileName =
      lastSep === -1 ? filePath : filePath.substring(lastSep + 1);

    if (fileDir !== this.path) {
      return false;
    }

    return this.barrelFilePatterns.some((pattern) =>
      matchGlob(pattern, fileName),
    );
  }
}
