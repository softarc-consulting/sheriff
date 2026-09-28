import { AsyncPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CustomersComponent, CustomersViewModel } from '@eternal/customers/ui';
import { CustomersRepository } from '../../data/customers-repository.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    template: ` @if (viewModel$ | async; as viewModel) {
  <eternal-customers
    [viewModel]="viewModel"
    (setSelected)="setSelected($event)"
    (setUnselected)="setUnselected()"
    (switchPage)="switchPage($event)"
  ></eternal-customers>
}`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CustomersComponent, AsyncPipe]
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
