import FileInfo from '../file-info/file-info';
import { ModuleInfo } from './module-info';

export default class AssignedFileInfo extends FileInfo {
  constructor(
    path: string,
    imports: FileInfo[],
    public moduleInfo: ModuleInfo
  ) {
    super(path, imports);
  }
}
