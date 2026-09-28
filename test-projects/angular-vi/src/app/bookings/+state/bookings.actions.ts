import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Booking } from './bookings.reducer';

export const bookingsActions = createActionGroup({
  source: 'Customer Bookings',
  events: {
    Load: emptyProps(),
    Loaded: props<{ bookings: Booking[] }>(),
    Reset: emptyProps(),
  },
});
