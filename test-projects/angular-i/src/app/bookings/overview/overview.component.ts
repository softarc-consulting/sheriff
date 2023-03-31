import { Component, inject, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Booking } from '../+state/bookings.reducer';
import { fromBookings } from '../+state/bookings.selectors';
import { bookingsActions } from '../+state/bookings.actions';
import { CustomersApi } from '@eternal/customers/api';
import { map } from 'rxjs/operators';
import { filterDefined } from '@eternal/shared/ngrx-utils';

@Component({
  selector: 'eternal-overview',
  templateUrl: './overview.component.html',
  standalone: true,
  imports: [MatTableModule, DatePipe],
})
export class OverviewComponent implements OnInit {
  userName = '';
  displayedColumns = ['holidayId', 'date', 'status', 'comment'];
  dataSource = new MatTableDataSource<Booking>([]);
  customersApi = inject(CustomersApi);

  #store = inject(Store);

  bookings$ = combineLatest({
    customer: this.customersApi.selectedCustomer$,
    bookings: this.#store.select(fromBookings.selectBookings),
    loaded: this.#store.select(fromBookings.selectLoaded),
  }).pipe(
    map(({ customer, bookings, loaded }) => {
      if (customer === undefined) {
        return undefined;
      }

      return {
        customerName: customer.name + ', ' + customer.firstname,
        bookings,
        loaded,
      };
    }),
    filterDefined
  );

  ngOnInit(): void {
    this.bookings$.subscribe((bookingData) => {
      if (bookingData?.loaded === false) {
        this.#store.dispatch(bookingsActions.load());
      } else {
        this.userName = bookingData.customerName;
        this.dataSource.data = bookingData.bookings;
      }
    });
  }
}
