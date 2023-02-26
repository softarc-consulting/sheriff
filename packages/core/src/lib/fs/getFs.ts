import defaultFs from './default-fs';
import virtualFs from './virtual-fs';
import Fs from './fs';

let fsImplementation: 'default' | 'virtual' = 'default';

export const useDefaultFs = () => (fsImplementation = 'default');
export const useVirtualFs = () => (fsImplementation = 'virtual');

const getFs = (): Fs =>
  fsImplementation === 'default' ? defaultFs : virtualFs;

export default getFs;
