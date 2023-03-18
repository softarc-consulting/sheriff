import { Component, inject, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { bookingsActions } from '../+state/bookings.actions';
import { Booking } from '../+state/bookings.reducer';
import { fromBookings } from '../+state/bookings.selectors';
import { DatePipe } from '@angular/common';

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

  #store = inject(Store);

  ngOnInit(): void {
    this.#store
      .select(fromBookings.selectBookingData)
      .pipe(filter(Boolean))
      .subscribe((bookingData) => {
        if (bookingData?.loaded === false) {
          this.#store.dispatch(bookingsActions.load());
        } else {
          this.userName = bookingData.customerName;
          this.dataSource.data = bookingData.bookings;
        }
      });
  }
}
