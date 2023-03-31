import { createAction, props } from "@ngrx/store";
import { Flight } from "../flight";

export const loadFlights = createAction(
    "[booking] loadFlights",
    props<{from: string, to: string}>()
);

export const delayFlight = createAction(
    "[booking] delayFlight",
    props<{id: number}>()
);

export const loadFlightsSuccess = createAction(
    "[booking] loadFlightsSuccess",
    props<{flights: Flight[]}>()
);