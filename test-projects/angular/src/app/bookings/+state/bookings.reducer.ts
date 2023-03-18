import { createFeature, createReducer, on } from '@ngrx/store';
import { bookingsActions } from './bookings.actions';

export type BookingStatus =
  | 'pending'
  | 'booked'
  | 'paid'
  | 'cancelled'
  | 'finished';

export interface Booking {
  id: number;
  holidayId: number;
  bookingDate: Date;
  status: BookingStatus;
  comment: string;
}

export interface BookingsState {
  bookings: Booking[];
  loaded: boolean;
}

const initialState: BookingsState = {
  bookings: [],
  loaded: false,
};

export const bookingsFeature = createFeature({
  name: 'bookings',
  reducer: createReducer(
    initialState,
    on(bookingsActions.loaded, (state, action): BookingsState => {
      return {
        ...state,
        bookings: action.bookings,
        loaded: true,
      };
    })
  ),
});
