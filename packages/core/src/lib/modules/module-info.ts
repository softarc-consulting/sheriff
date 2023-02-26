import FileInfo from '../file-info/file-info';
import AssignedFileInfo from './assigned-file.info';

export const ROOT_MODULE = '';

export class ModuleInfo {
  directory = '';
  assignedFileInfos: AssignedFileInfo[] = [];
  constructor(public path: string) {
    if (['.', '', 'index.ts', './index.ts'].includes(this.path)) {
      this.directory = ROOT_MODULE;
    }
    this.directory = this.path.substring(0, this.path.length - 9);
  }

  assignFileInfo(fileInfo: FileInfo) {
    this.assignedFileInfos.push(
      new AssignedFileInfo(fileInfo.path, fileInfo.imports, this)
    );
  }
}
