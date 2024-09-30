import { FsPath } from './fs-path';
import throwIfNull from '../util/throw-if-null';

/**
 * Represents a TypeScript file with its dependencies but does
 * not yet have an assignment to a module.
 *
 * After module assignment is done, it becomes a type `FileInfo`.
 *
 * If an import cannot be resolved, it doesn't throw an error
 * but is added to unresolvableImports.
 *
 * It is up to the consumer, e.g. ESLinter, to decide if that
 * should cause an error or not.
 */
export class UnassignedFileInfo {
  #rawImportMap = new Map<string, string>();
  #unresolvableImports: string[] = [];
  #externalLibraries: string[] = [];

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

  addExternalLibrary(libraryImport: string) {
    if (this.#externalLibraries.includes(libraryImport)) {
      return;
    }

    this.#externalLibraries.push(libraryImport);
  }

  getExternalLibraries(): Readonly<string[]> {
    return [...this.#externalLibraries] as const;
  }
}
