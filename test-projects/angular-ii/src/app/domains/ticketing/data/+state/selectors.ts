import { createFeatureSelector, createSelector } from "@ngrx/store";
import { BookingState, BOOKING_FEATURE_KEY } from "./reducers";

export const selectBooking = createFeatureSelector<BookingState>(BOOKING_FEATURE_KEY);

export const selectFlights = createSelector(
    selectBooking,
    booking => booking.flights
);
