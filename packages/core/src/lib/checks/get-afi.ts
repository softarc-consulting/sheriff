import { FsPath } from '../file-info/fs-path';
import throwIfNull from '../util/throw-if-null';
import { FileInfo } from '../modules/file.info';

export function getAfi(
  path: FsPath,
  assignedFileInfoMap: Map<FsPath, FileInfo>,
) {
  return throwIfNull(
    assignedFileInfoMap.get(path),
    `cannot find AssignedFileInfo for ${path}`,
  );
}
