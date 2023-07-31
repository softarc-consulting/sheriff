import { DbService } from '../data';

export class Checkout {
  constructor() {
    const dbService = new DbService();
    dbService.init();
  }

  checkout(basket: number) {
    return basket;
  }
}
