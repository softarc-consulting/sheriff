import { FsPath } from '../file-info/fs-path';
import throwIfNull from '../util/throw-if-null';
import { AssignedFileInfo } from '../modules/assigned-file.info';

export function getAfi(
  path: FsPath,
  assignedFileInfoMap: Map<FsPath, AssignedFileInfo>
) {
  return throwIfNull(
    assignedFileInfoMap.get(path),
    `cannot find AssignedFileInfo for ${path}`
  );
}
