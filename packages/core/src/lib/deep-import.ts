import generateFileInfo from './file-info/generate-file-info';
import getFs from './fs/getFs';
const fileSet = new Set<string>();

export const hasDeepImport: (
  filename: string,
  importCommand: string
) => boolean = (filename: string, importCommand: string) => {
  if (fileSet.has(filename)) {
    return false;
  } else {
    fileSet.add(filename);
    const tsConfigFile = getFs().findNearestParentFile(
      filename,
      'tsconfig.json'
    );
    console.log(`${filename} - ${tsConfigFile}`);

    return false;
  }
};
