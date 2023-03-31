import { HttpInterceptorFn } from "@angular/common/http";
import { tap } from "rxjs";

export const bookingInterceptor: HttpInterceptorFn = (req, next) => {
    
    console.log('bookingInterceptor (lazy scope)');

    if (req.url.startsWith('https://demo.angulararchitects.io/api/')) {
        // Setting a dummy token for demonstration
        const headers = req.headers.set('Authorization', 'Bearer Booking-ABCDEFG');
        req = req.clone({headers});
    }

    return next(req).pipe(
        tap(resp => console.log('response', resp))
    );
}