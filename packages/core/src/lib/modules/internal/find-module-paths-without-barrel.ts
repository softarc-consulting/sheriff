import { TagConfig } from "../../config/tag-config";
import { FsPath } from "../../file-info/fs-path";
import { flattenTagging } from "./flatten-tagging";

/**
 * The current criterion for finding modules is via
 * the SheriffConfig's property `tagging`.
 *
 * We iterate through projectPaths, traverse them
 * and find modules assigned by tags.
 */
export function findModulePathsWithoutBarrel(projectDirs: string[], moduleConfig: TagConfig): Set<FsPath> {
  const paths = flattenTagging(moduleConfig, '');

  return new Set<FsPath>();
}
