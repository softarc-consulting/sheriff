import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LegacyInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

        console.log('LegacyInterceptor (root scope)');

        if (req.url.startsWith('https://demo.angulararchitects.io/api/')) {
            // Setting a dummy token for demonstration
            const headers = req.headers.set('Authorization', 'Bearer Legacy-1234567');
            req = req.clone({headers});
        }

        return next.handle(req).pipe(
            tap(resp => console.log('response', resp))
        );
    }
}
