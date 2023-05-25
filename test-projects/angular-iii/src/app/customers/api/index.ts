import { inject, Injectable } from '@angular/core';
import { CustomersRepository } from '../data';

@Injectable({ providedIn: 'root' })
export class CustomersApi {
  repo = inject(CustomersRepository);
  get selectedCustomer$() {
    return this.repo.selectedCustomer$;
  }
}
