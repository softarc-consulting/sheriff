export interface FileFilter {
  include?: string[];
  exclude?: string[];
}

const sheriffConfigFileName = 'sheriff.config.ts';

export const excludeSheriffConfig: FileFilter = {
  exclude: [sheriffConfigFileName],
};

export const onlySheriffConfig: FileFilter = {
  include: [sheriffConfigFileName],
};
