import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, switchMap } from "rxjs";
import { FlightService } from "../flight.service";
import { loadFlights, loadFlightsSuccess } from "./actions";

@Injectable({
    providedIn: 'root'
})
export class BookingEffects {

    loadFlights$ = createEffect(() => this.actions$.pipe(
        ofType(loadFlights),
        switchMap(a => this.flightService.find(a.from, a.to)),
        map(flights => loadFlightsSuccess({flights}))
    ));

    constructor(private actions$: Actions, 
        private flightService: FlightService) { }
}
