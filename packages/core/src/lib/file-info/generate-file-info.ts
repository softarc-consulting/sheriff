import FileInfo from "./file-info";
import prepareTsData from "./prepare-ts-data";
import traverseFilesystem from "./traverse-filesystem";
import getFs from "../fs/getFs";

export default async (
  filePath: string,
  tsConfigPath: string
): Promise<FileInfo> => {
  const fileInfoDict = new Map<string, FileInfo>();
  const tsData = await prepareTsData(tsConfigPath, getFs().cwd());

  return traverseFilesystem(filePath, fileInfoDict, tsData);
};
