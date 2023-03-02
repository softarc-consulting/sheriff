export const hasDeepImport: (
  filename: string,
  importCommand: string
) => boolean = (filename: string, importCommand: string) => {
  console.log(filename);
  return true;
};
