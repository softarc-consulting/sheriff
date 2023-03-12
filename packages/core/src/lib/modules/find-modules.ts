import getFs from '../fs/getFs';

export default (projectDirs: string[]) => {
  const fs = getFs();
  let modules: string[] = [];

  for (const projectDir of projectDirs) {
    modules = modules.concat(fs.findFiles(projectDir, 'index.ts'));
  }

  return modules;
};
