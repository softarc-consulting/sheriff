import { FsPath, toFsPath } from './fs-path';
import throwIfNull from '../util/throw-if-null';
import getFs from '../fs/getFs';

/**
 * Class representing a TypeScript file with its dependencies.
 * If an import cannot be resolved, it doesn't throw an error
 * but is added to unresolvableImports.
 *
 * It is up to the consumer, e.g. ESLinter, to decide if that
 * should cause an error or not.
 */
export default class UnassignedFileInfo {
  #rawImportMap = new Map<string, string>();
  #unresolvableImports: string[] = [];
  constructor(
    public path: FsPath,
    public imports: UnassignedFileInfo[] = [],
  ) {}

  addUnresolvableImport(importCommand: string) {
    this.#unresolvableImports.push(importCommand);
  }

  isUnresolvableImport(importCommand: string) {
    return this.#unresolvableImports.includes(importCommand);
  }

  hasUnresolvableImports() {
    return this.#unresolvableImports.length > 0;
  }

  addImport(importedFileInfo: UnassignedFileInfo, rawImport: string) {
    this.imports.push(importedFileInfo);
    this.#rawImportMap.set(importedFileInfo.path, rawImport);
  }

  getRawImportForImportedFileInfo(path: FsPath): string {
    return throwIfNull(
      this.#rawImportMap.get(path),
      `raw import for ${path} is not available in ${this.path}`,
    );
  }
}

type NestedArray = (string | NestedArray)[];

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

/**
 * utility function generate a FileInfo Tree for testing purposes
 * @param path
 * @param imports
 */
export const buildFileInfo = (
  path: string,
  imports: NestedArray = [],
): UnassignedFileInfo => {
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
};
