export function removeCliFlagsFromArgs(args: string[]): string[] {
  return args.filter((arg) => !arg.startsWith('--'));
}
