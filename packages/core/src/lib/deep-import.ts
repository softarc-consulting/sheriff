import getFs from './fs/getFs';

const fileSet = new Set<string>();

/* c8 ignore next */
export const hasDeepImport: (
  filename: string,
  importCommand: string
) => boolean = (filename: string) => {
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
