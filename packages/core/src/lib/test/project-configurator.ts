export interface FileTree {
  [key: string]: FileTree | string | string[];
}

export interface ProjectConfig {
  nodeModules: string[];
  fileTree: FileTree;
}
