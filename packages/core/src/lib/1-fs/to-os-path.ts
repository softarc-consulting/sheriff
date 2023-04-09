import { FsPath } from '../2-file-info/fs-path';
import throwIfNull from '../util/throw-if-null';
import * as path from 'path';
import { PotentialFsPath } from './potential-fs-path';

export function toOsPath(fsPath: FsPath | PotentialFsPath): string {
  if (path.sep === '\\') {
    const [, driveLetter, rest] = throwIfNull(
      fsPath.match(/^\/([a-zA-Z])\/(.*)$/),
      `Cannot convert ${fsPath} to a Window-specific path`
    );
    return `${driveLetter}:\\${rest.replace(/\//g, '\\')}`;
  }

  return fsPath;
}
