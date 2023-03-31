import {provideHttpClient, withInterceptors, withRequestsMadeViaParent} from "@angular/common/http";
import {EnvironmentProviders} from "@angular/core";
import {provideEffects} from "@ngrx/effects";
import {provideState} from "@ngrx/store";
import {combineEnvironmentProviders} from "../../shared/util-common";
import {BookingEffects, bookingFeature} from "../data";
import {bookingInterceptor} from "./utils/booking.interceptor";

export function provideBooking(): EnvironmentProviders {
    return combineEnvironmentProviders([
        // NGRX
        provideState(bookingFeature),
        provideEffects(BookingEffects),

        // Http
        provideHttpClient(
            withRequestsMadeViaParent(),
            withInterceptors([bookingInterceptor])
        ),
    ]);
}
