import { FileTree, isFileTree } from "./project-configurator";
import { FsPath, toFsPath } from "../file-info/fs-path";

export function* traverseProject(project: FileTree, parentPath: string): Generator<FsPath> {
  function* traverse(
    fileTree: FileTree,
    parentPath: string
  ): Generator<FsPath> {
    for (const filename in fileTree) {
      const subFileTree = fileTree[filename];
      if (Array.isArray(subFileTree)) {
        yield toFsPath(`${parentPath}/${filename}`)
        continue;
      }

      if (isFileTree(subFileTree)) {
        yield* traverse(subFileTree, `${parentPath}/${filename}`);
      }
    }
  }

  yield* traverse(project, parentPath);
}
