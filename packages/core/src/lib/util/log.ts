import * as process from 'process';

export const log = (title: string, value: string) => {
  if (process.env['DEBUG']) {
    console.log('==========');
    console.log(title);
    console.log('==========');
    console.log(value);
  }
};
