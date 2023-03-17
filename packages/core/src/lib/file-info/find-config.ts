import getFs from '../fs/getFs';

/**
 *
 * @param refPath
 */
export const findConfig = (refPath: string): string =>
  getFs().findNearestParentFile(refPath, 'sheriff.config.ts');
