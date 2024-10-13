import { Module } from './module';

export function warnOnBarrelFileLessCollision(modules: Module[], barrelFileName: string, encapsulatedFolderName: string): void {
  const barrelModulesWithEncapsulatedFolder = modules
    .filter((module) => module.hasBarrel)
    .filter((module) => module.getEncapsulatedFolder() !== undefined);

  for (const module of barrelModulesWithEncapsulatedFolder) {
    console.warn(
      `Module ${module.path} has both a barrel file (${barrelFileName}) and an encapsulated folder (${encapsulatedFolderName})`,
    );
  }

  if (barrelModulesWithEncapsulatedFolder.length > 0) {
    console.warn(
      `You can disable this warning by setting the property warnOnBarrelFileLessCollision in 'sheriff.config.ts' to false`,
    );
  }
}
