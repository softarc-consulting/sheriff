import FileInfo from './file-info';

export default (
  fileInfo: FileInfo,
  callback: (fileInfo: FileInfo, level: number) => boolean
) => {
  const traversed = new Set<string>();

  const traverse = <Context>(
    fileInfo: FileInfo,
    callback: (fileInfo: FileInfo, level: number) => boolean,
    level = 0
  ) => {
    if (traversed.has(fileInfo.path)) {
      return;
    }

    traversed.add(fileInfo.path);
    const shouldContinue = callback(fileInfo, level);

    if (shouldContinue) {
      for (const child of fileInfo.imports) {
        traverse(child, callback, level++);
      }
    }
  };

  traverse(fileInfo, callback);
};

export function* traverseFileInfo(fileInfo: FileInfo) {
  const traversed = new Set<string>();

  function* traverse(
    fileInfo: FileInfo,
    level = 0
  ): Generator<{ fileInfo: FileInfo; level: number }, void> {
    if (traversed.has(fileInfo.path)) {
      return;
    }

    traversed.add(fileInfo.path);
    yield { fileInfo, level };

    for (const child of fileInfo.imports) {
      yield* traverse(child, level++);
    }
  }

  yield* traverse(fileInfo);
}
