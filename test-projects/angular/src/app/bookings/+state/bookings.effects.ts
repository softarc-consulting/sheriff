import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { selectSelectedCustomer } from '@eternal/customers/feature';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';
import { bookingsActions } from './bookings.actions';
import { Booking } from './bookings.reducer';

const bookings: Map<number, Booking[]> = new Map<number, Booking[]>();
bookings.set(1, [
  {
    id: 1,
    holidayId: 1,
    bookingDate: new Date(2022, 1, 2),
    status: 'pending',
    comment: "A little bit unsure about the holiday. Let's see",
  },
  {
    id: 2,
    holidayId: 2,
    bookingDate: new Date(2022, 1, 2),
    status: 'cancelled',
    comment: 'Seemed to be a little bit stressed out',
  },
]);
bookings.set(3, [
  {
    id: 3,
    holidayId: 1,
    bookingDate: new Date(2022, 1, 2),
    status: 'finished',
    comment:
      "According to Jeremy, he's a quite a grumbler. Complains all the time and nothing seems to be satisfactory.",
  },
]);

@Injectable()
export class BookingsEffects {
  #httpClient = inject(HttpClient);
  #actions$ = inject(Actions);
  #store = inject(Store);

  load$ = createEffect(() => {
    return this.#actions$.pipe(
      ofType(bookingsActions.load),
      concatLatestFrom(() => this.#store.select(selectSelectedCustomer)),
      map(([, customerId]) => customerId),
      filter(Boolean),
      map((customer) =>
        bookingsActions.loaded({ bookings: bookings.get(customer.id) || [] })
      )
    );
  });
}
