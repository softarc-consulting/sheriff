import path from 'path';

export interface FileFilter {
  include?: string[];
  exclude?: string[];
}

export const sheriffConfigFileName = 'sheriff.config.ts';

export const excludeSheriffConfig: FileFilter = {
  exclude: [sheriffConfigFileName],
};

export const onlySheriffConfig: FileFilter = {
  include: [sheriffConfigFileName],
};

export function isExcluded({ include, exclude }: FileFilter, filePath: string) {
  const fileName = path.basename(filePath);
  return (
    (include && !include.some((includeFile) => fileName === includeFile)) ||
    (exclude && exclude.some((excludeFile) => fileName === excludeFile))
  );
}
