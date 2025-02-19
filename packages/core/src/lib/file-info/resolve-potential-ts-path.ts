import { TsPaths } from './ts-data';
import { FsPath, isFsPath, toFsPath } from './fs-path';
import { ResolveFn } from './traverse-filesystem';
import getFs from '../fs/getFs';
import { fixPathSeparators } from './fix-path-separators';

/**
 * Resolves a import statements which use a TypeScript alias.
 * If resolving does not work, it returns an undefined.
 *
 * It only works if the import state is using aliases from tsconfig.json.
 *
 * ```typescript
 * import { AppComponent } from '@app/app.component';
 * ```
 *
 * @param moduleName name as it is in the import statement, e.g. '../app.component'
 * @param tsPaths resolved paths from the tsconfig.json file
 * @param resolveFn function to resolve the path, built-in TypeScript resolver
 */
export function resolvePotentialTsPath(
  moduleName: string,
  tsPaths: TsPaths,
  resolveFn: ResolveFn,
): FsPath | undefined {
  let unpathedImport: string | undefined;
  for (const tsPath in tsPaths) {
    const { isWildcard, clearedTsPath } = clearTsPath(tsPath);
    // import from '@app/app.component' & paths: {'@app/*': ['src/app/*']}
    if (isWildcard && moduleName.startsWith(clearedTsPath)) {
      const pathMapping = tsPaths[tsPath];
      unpathedImport = moduleName.replace(clearedTsPath, pathMapping);
    }
    // import from '@app' & paths: { '@app': [''] }
    else if (tsPath === moduleName) {
      unpathedImport = tsPaths[tsPath];
    }

    // current path applies -> resolve it
    if (unpathedImport) {
      // path is file -> return as is
      if (isPathFile(unpathedImport)) {
        return fixPathSeparators(toFsPath(unpathedImport));
      }
      // path is directory or something else -> rely on TypeScript resolvers
      else {
        const resolvedImport = resolveFn(unpathedImport);
        // if path applies but import is for external library with same time,
        // we need to rely on the native TypeScript resolver, which is done
        // outside the path resolving.
        if (resolvedImport.resolvedModule) {
          return toFsPath(
            fixPathSeparators(resolvedImport.resolvedModule.resolvedFileName),
          );
        }
      }
    }
  }

  return undefined;
}

function clearTsPath(tsPath: string) {
  const [isWildcard, clearedPath] = tsPath.endsWith('/*')
    ? [true, tsPath.slice(0, -2)]
    : [false, tsPath];
  return { isWildcard, clearedTsPath: clearedPath };
}

/**
 * Checks if the path is a file.
 *
 * For example in tsconfig.json:
 * ```json
 *   "paths": {
 *     "@app": ["src/app/index"]
 *   }
 * ```
 *
 * 'src/app/index' comes already as absolute path with ts extension from
 * pre-processing of @generateTsData.
 *
 * @param path '/.../src/app/index.ts' according to the example above
 */
function isPathFile(path: string): boolean {
  const fs = getFs();
  return fs.exists(path) && isFsPath(path) && fs.isFile(path);
}
