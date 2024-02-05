import UnassignedFileInfo from './unassigned-file-info';

export function* traverseUnassignedFileInfo(fileInfo: UnassignedFileInfo) {
  const traversed = new Set<string>();

  function* traverse(
    fileInfo: UnassignedFileInfo,
    level = 1,
  ): Generator<{ fileInfo: UnassignedFileInfo; level: number }, void> {
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

export default traverseUnassignedFileInfo;
