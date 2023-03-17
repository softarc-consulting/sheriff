import getFs from '../fs/getFs';
import { FsPath } from './fs-path';

/**
 *
 * @param refPath
 */
export const findConfig = (refPath: FsPath): string =>
  getFs().findNearestParentFile(refPath, 'sheriff.config.ts');
