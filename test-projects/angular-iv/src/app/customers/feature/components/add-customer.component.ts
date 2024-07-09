import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Customer } from '@eternal/customers/model';
import { selectCountries } from '@eternal/shared/master-data';
import { Store } from '@ngrx/store';
import { CustomerComponent } from '@eternal/customers/ui';
import { CustomersRepository } from '../../data';

@Component({
  selector: 'eternal-add-customer',
  template: ` <eternal-customer
    [customer]="customer"
    *ngIf="countries$ | async as countries"
    [countries]="countries"
    (save)="submit($event)"
    [showDeleteButton]="false"
  ></eternal-customer>`,
  standalone: true,
  imports: [CustomerComponent, NgIf, AsyncPipe],
})
export class AddCustomerComponent {
  #store = inject(Store);
  #customersRepository = inject(CustomersRepository);
  customer: Customer = {
    id: 0,
    firstname: '',
    name: '',
    country: '',
    birthdate: '',
  };
  countries$ = this.#store.select(selectCountries);

  submit(customer: Customer) {
    this.#customersRepository.add({ ...customer, id: 0 });
  }
}
