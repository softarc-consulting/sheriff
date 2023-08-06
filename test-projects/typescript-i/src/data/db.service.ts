import { credentials } from './credentials';

export class DbService {
  init() {
    console.log(`connecting with ${credentials.name}`);
  }

  select(sql: string): void {
    console.log(sql);
  }

  exec(sql: string): void {
    console.log(sql);
  }
}
