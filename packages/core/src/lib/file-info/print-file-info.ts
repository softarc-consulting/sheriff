import FileInfo from './file-info';
import traverseFileInfo from './traverse-file-info';

export default (fileInfo: FileInfo, indent = 0) => {
  traverseFileInfo(fileInfo, (fileInfo, level) => {
    const prefix = ' '.repeat(indent);
    console.log(`${prefix}${fileInfo.path}`);
    return true;
  });
};
