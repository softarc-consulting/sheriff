import defaultFs from './default-fs';
import virtualFs from './virtual-fs';
import { Fs } from './fs';

let fsImplementation: 'default' | 'virtual' = 'default';

export function useDefaultFs() {
  fsImplementation = 'default';
  return defaultFs
}

export function useVirtualFs() {
  fsImplementation = 'virtual'
  return virtualFs;
}

const getFs = (): Fs =>
  fsImplementation === 'default' ? defaultFs : virtualFs;

export const isFsVirtualised = () => fsImplementation === 'virtual';

export default getFs;
