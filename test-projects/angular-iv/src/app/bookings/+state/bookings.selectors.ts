import { bookingsFeature } from './bookings.reducer';

const { selectBookings, selectLoaded } = bookingsFeature;

export const fromBookings = { selectBookings, selectLoaded };
