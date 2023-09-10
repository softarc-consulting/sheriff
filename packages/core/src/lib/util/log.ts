import * as process from 'process';

export const log = (title: string, value: string) => {
  // @ts-expect-error eslint-recommended does recommend it this way
  if (process.env.DEBUG) {
    console.log('==========');
    console.log(title);
    console.log('==========');
    console.log(value);
  }
};
