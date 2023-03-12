import FileInfo from './file-info';
import prepareTsData from './prepare-ts-data';
import traverseFilesystem from './traverse-filesystem';
import getFs from '../fs/getFs';

/**
 * initialises the generation of the `FileInfo` tree.
 * @param filePath
 * @param tsConfigPath
 */
export default (filePath: string, tsConfigPath: string): FileInfo => {
  const fileInfoDict = new Map<string, FileInfo>();
  const tsData = prepareTsData(tsConfigPath, getFs().cwd());

  return traverseFilesystem(filePath, fileInfoDict, tsData);
};
