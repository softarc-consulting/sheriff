const isInNodeModules = (filename: string, nodeModulesDir: string) => {
  return filename.startsWith(nodeModulesDir);
};

export default isInNodeModules;
