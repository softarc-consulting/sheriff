import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { customersActions } from './customers.actions';
import { Customer } from '@eternal/customers/model';
import { fromCustomers } from './customers.selectors';

@Injectable({ providedIn: 'root' })
export class CustomersRepository {
  #store = inject(Store);

  get pagedCustomers$() {
    return this.#store.select(fromCustomers.selectPagedCustomers);
  }

  findById(id: number) {
    return this.#store.select(fromCustomers.selectById(id));
  }

  add(customer: Customer) {
    this.#store.dispatch(customersActions.add({ customer }));
  }

  update(customer: Customer) {
    this.#store.dispatch(customersActions.update({ customer }));
  }

  remove(customer: Customer) {
    this.#store.dispatch(customersActions.remove({ customer }));
  }

  load(page: number) {
    this.#store.dispatch(customersActions.load({ page }));
  }

  select(id: number) {
    this.#store.dispatch(customersActions.select({ id }));
  }

  unselect() {
    this.#store.dispatch(customersActions.unselect());
  }
}
