import getFs from "../fs/getFs";
import {toFsPath} from "../file-info/fs-path";
import UnassignedFileInfo from "../file-info/unassigned-file-info";

type NestedArray = (string | NestedArray)[];

/**
 * utility function generate a FileInfo Tree for testing purposes
 * @param path
 * @param imports
 */
export function buildFileInfo(
  path: string,
  imports: NestedArray = [],
): UnassignedFileInfo {
  const fs = getFs();
  const children: UnassignedFileInfo[] = imports.map((entry) => {
    if (
      Array.isArray(entry) &&
      entry.length === 2 &&
      typeof entry[0] === 'string'
    ) {
      const [childPath, childImports] = entry;
      const currentPath = createPath(childPath, path);
      return buildFileInfo(currentPath, childImports as NestedArray[]);
    } else if (typeof entry === 'string') {
      return buildFileInfo(createPath(entry, path), []);
    } else {
      throw new Error(`import not in right structure`);
    }
  });

  fs.writeFile(path, '');
  const fileInfo = new UnassignedFileInfo(toFsPath(path));
  for (const child of children) {
    fileInfo.addImport(child, fs.relativeTo(fileInfo.path, child.path));
  }
  return fileInfo;
}

function createPath(path: string, parentPath: string): string {
  let currentPath = path;
  if (path.startsWith('./')) {
    const parentPaths = parentPath.split('/');
    parentPaths.pop();
    const normalisedPaths = path.split('/').slice(1);

    currentPath = [...parentPaths, ...normalisedPaths].join('/');
  }

  return currentPath;
}
