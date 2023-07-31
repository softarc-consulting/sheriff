import { credentials } from '../data/credentials';
import { Checkout } from '../logic';

export class CheckoutController {
  constructor() {
    console.log(
      `attempting to connect to db with ${credentials.name}/${credentials.password}`
    );
  }

  init() {
    const checkout = new Checkout();
    checkout.checkout(5);
    console.log('starting');
  }
}
