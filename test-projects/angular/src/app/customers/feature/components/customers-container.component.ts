import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CustomersComponent, CustomersViewModel } from '@eternal/customers/ui';
import { CustomersRepository } from '../../data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AddressLookuper } from '@eternal/holidays/feature';

@Component({
  template: ` <eternal-customers
    *ngIf="viewModel$ | async as viewModel"
    [viewModel]="viewModel"
    (setSelected)="setSelected($event)"
    (setUnselected)="setUnselected()"
    (switchPage)="switchPage($event)"
  ></eternal-customers>`,
  standalone: true,
  imports: [CustomersComponent, NgIf, AsyncPipe],
})
export class CustomersContainerComponent {
  #customersRepository = inject(CustomersRepository);
  viewModel$: Observable<CustomersViewModel> =
    this.#customersRepository.pagedCustomers$.pipe(
      map((pagedCustomers) => ({
        customers: pagedCustomers.customers,
        pageIndex: pagedCustomers.page - 1,
        length: pagedCustomers.total,
      }))
    );

  setSelected(id: number) {
    this.#customersRepository.select(id);
  }

  setUnselected() {
    this.#customersRepository.unselect();
  }

  switchPage(page: number) {
    console.log('switch to page ' + page + ' is not implemented');
  }
}
