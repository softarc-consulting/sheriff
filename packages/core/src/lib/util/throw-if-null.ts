export default <T>(value: T, prefix = ''): NonNullable<T> => {
  if (value === undefined || value === null) {
    throw new Error(`${prefix} value cannot be null`);
  }

  return value;
};
