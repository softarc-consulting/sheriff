import FileInfo from '../file-info/file-info';
import getFs from '../fs/getFs';

export default (projectDirs: string[], fileInfo: FileInfo) => {
  const fs = getFs();
  let modules: string[] = [];
  const files = fs.findFiles(projectDirs[0], 'index.ts');

  for (const projectDir of projectDirs) {
    modules = modules.concat(fs.findFiles(projectDir, 'index.ts'));
  }

  return modules;
};
