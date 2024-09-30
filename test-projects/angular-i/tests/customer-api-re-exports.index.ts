import { inject, Injectable } from '@angular/core';
import { CustomersRepository } from '../data';
export { bookingsRoutes } from '../../bookings';

@Injectable({ providedIn: 'root' })
export class CustomersApi {
  repo = inject(CustomersRepository);
  get selectedCustomer$() {
    return this.repo.selectedCustomer$;
  }
}
