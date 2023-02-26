export default <T>(value: T, prefix: string = ''): NonNullable<T> => {
  if (value === undefined || value === null) {
    throw new Error(`${prefix} value cannot be null`);
  }

  return value;
};
