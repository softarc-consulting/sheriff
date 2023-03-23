// https://www.delftstack.com/howto/javascript/wildcard-string-comparison-in-javascript

export const wildcardToRegex = (wildcardRule: string): RegExp => {
  const escapeRegex = (str: string) =>
    str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
  const regexpString = `^${wildcardRule
    .split('*')
    .map(escapeRegex)
    .join('.*')}$`;
  return new RegExp(regexpString);
};
