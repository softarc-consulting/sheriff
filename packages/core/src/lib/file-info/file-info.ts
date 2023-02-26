export default class FileInfo {
  constructor(public path: string, public imports: FileInfo[] = []) {}
}

interface NestedArray extends Array<string | NestedArray> {}

const createPath = (path: string, parentPath: string) => {
  let currentPath = path;
  if (path.startsWith('./')) {
    const parentPaths = parentPath.split('/');
    parentPaths.pop();
    const normalisedPaths = path.split('/').slice(1);

    currentPath = [...parentPaths, ...normalisedPaths].join('/');
  }

  return currentPath;
};

export const buildFileInfo = (
  path: string,
  imports: NestedArray = []
): FileInfo => {
  const children: FileInfo[] = imports.map((entry) => {
    if (
      Array.isArray(entry) &&
      entry.length === 2 &&
      typeof entry[0] === 'string'
    ) {
      const [childPath, childImports] = entry;
      let currentPath = createPath(childPath, path);
      return buildFileInfo(currentPath, childImports as NestedArray[]);
    } else if (typeof entry === 'string') {
      return buildFileInfo(createPath(entry, path), []);
    } else {
      throw new Error(`import not in right structure`);
    }
  });

  return new FileInfo(path, children);
};
