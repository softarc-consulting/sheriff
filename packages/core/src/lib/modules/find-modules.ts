import FileInfo from '../file-info/file-info';
import getFs from '../fs/getFs';

export default async (projectDirs: string[], fileInfo: FileInfo) => {
  const fs = getFs();
  let modules: string[] = [];
  const files = await fs.findFiles(projectDirs[0], 'index.ts');

  for (const projectDir of projectDirs) {
    modules = modules.concat(await fs.findFiles(projectDir, 'index.ts'));
  }

  return modules;
};
