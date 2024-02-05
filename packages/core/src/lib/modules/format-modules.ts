import { Module } from './module';
import { EOL } from 'os';

export const formatModules = (modules: Module[]): string => {
  const output: string[] = [];
  for (const module of modules) {
    output.push(
      `${module.path}: ${module.fileInfos.map((afi) => afi.path).join(', ')}`,
    );
  }
  return output.join(EOL);
};
