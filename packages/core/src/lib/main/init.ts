import { FsPath, toFsPath } from '../file-info/fs-path';
import { SheriffConfig } from '../config/sheriff-config';
import getFs from '../fs/getFs';
import { generateTsData } from '../file-info/generate-ts-data';
import { findConfig } from '../config/find-config';
import { parseConfig } from '../config/parse-config';
import TsData from '../file-info/ts-data';

export type Callback = (config: SheriffConfig | undefined) => void;

const callbacks: Callback[] = [];

let _isInitialised = false;
let config: SheriffConfig | undefined;

export const isInitialised = () => _isInitialised;

export const afterInit = (
  callback: (config: SheriffConfig | undefined) => void
) => {
  if (_isInitialised) {
    callback(config);
  } else {
    callbacks.push(callback);
  }
};

export type InitData = {
  tsData: TsData;
  config: SheriffConfig | undefined;
};

export const init = (entryFile: FsPath, loadConfig: boolean) => {
  const fs = getFs();
  const tsConfigPath = toFsPath(
    fs.findNearestParentFile(entryFile, 'tsconfig.json')
  );
  const tsData = generateTsData(tsConfigPath);
  config = getConfig(tsData.rootDir, loadConfig);

  _isInitialised = true;
  for (const callback of callbacks) {
    callback(config);
  }

  return { tsData, config };
};

function getConfig(rootPath: FsPath, loadConfig: boolean) {
  if (!loadConfig) {
    return undefined;
  }
  const configFile = findConfig(rootPath);
  if (configFile) {
    return parseConfig(configFile);
  }

  return undefined;
}
