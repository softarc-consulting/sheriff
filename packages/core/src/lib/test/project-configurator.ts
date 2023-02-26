export type FileTree = { [key: string]: FileTree | string | string[] };

export type ProjectConfig = {
  nodeModules: string[];
  fileTree: FileTree;
};
