import { createFeature, createReducer, on } from "@ngrx/store";
import { Flight } from "../flight";
import { delayFlight, loadFlightsSuccess } from "./actions";

export const BOOKING_FEATURE_KEY = 'booking';

export interface BookingSlice {
    [BOOKING_FEATURE_KEY]: BookingState
}

export interface BookingState {
    flights: Flight[];
}

export const initialState: BookingState = {
    flights: []
}

function updateDate(flight: Flight): Flight {
    return {...flight, date: new Date().toISOString() }
}

export const bookingFeature = createFeature({
    name: BOOKING_FEATURE_KEY,
    reducer: createReducer(
        initialState,
        on(loadFlightsSuccess, (state, action) => {
            return { ...state, flights: action.flights };
        }),
        on(delayFlight, (state, action) => {
            const flights = state.flights.map(f => f.id !== action.id ? f : updateDate(f) )
            return { ...state, flights };
        })
    )
});
