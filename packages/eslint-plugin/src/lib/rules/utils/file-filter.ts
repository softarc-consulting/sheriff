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

export function isExcluded(
  { include, exclude }: FileFilter,
  filePath: string,
): boolean {
  const fileName = path.basename(filePath);

  // exclusions have precedence
  if (exclude) {
    const isExcluded = exclude.includes(fileName);
    if (isExcluded) {
      return true;
    }
  }

  if (include) {
    const isIncluded = include.includes(fileName);
    if (isIncluded) {
      return false;
    }
    return true;
  }

  return false;
}
