export function isEmptyRecord<T extends object>(arg: T): boolean{
  return Object.keys(arg)?.length === 0
}
