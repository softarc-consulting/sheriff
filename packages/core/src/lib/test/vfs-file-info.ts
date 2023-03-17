import FileInfo from '../file-info/file-info';
import { inVfs } from './in-vfs';

export const vfsFileInfo = (path: string, imports: FileInfo[] = []) =>
  new FileInfo(inVfs(path), imports);
