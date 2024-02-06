import { FileInfo } from './file.info';

export function* traverseFileInfo(fileInfo: FileInfo) {
  const traversed = new Set<string>();

  function* traverse(
    fileInfo: FileInfo,
    level = 1,
  ): Generator<{ fileInfo: FileInfo; level: number }, void> {
    if (traversed.has(fileInfo.path)) {
      return;
    }

    traversed.add(fileInfo.path);
    yield { fileInfo, level };

    for (const child of fileInfo.imports) {
      yield* traverse(child, level + 1);
    }
  }

  yield* traverse(fileInfo);
}
