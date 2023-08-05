import { Checkout } from '../logic';
import { DbService } from '@app/data';

export class CheckoutController {
  constructor() {
    const dbService = new DbService();
    console.log(`attempting to connect to db...`);
  }

  init() {
    const checkout = new Checkout();
    checkout.checkout(5);
    console.log('starting');
  }
}
