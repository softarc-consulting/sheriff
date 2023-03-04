import defaultFs from './default-fs';
import virtualFs, { VirtualFs } from './virtual-fs';
import Fs from './fs';

let fsImplementation: 'default' | 'virtual' = 'default';

export const useDefaultFs = () => (fsImplementation = 'default');
export const useVirtualFs = () => (fsImplementation = 'virtual');

const getFs = (): Fs =>
  fsImplementation === 'default' ? defaultFs : new VirtualFs();

export default getFs;
