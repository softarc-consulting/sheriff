import UnassignedFileInfo from '../file-info/unassigned-file-info';
import { inVfs } from './in-vfs';

export const vfsFileInfo = (path: string, imports: UnassignedFileInfo[] = []) =>
  new UnassignedFileInfo(inVfs(path), imports);
