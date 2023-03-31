import { HttpInterceptorFn } from "@angular/common/http";
import { tap } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    
    console.log('authInterceptor (root scope)');

    if (req.url.startsWith('https://demo.angulararchitects.io/api/')) {
        // Setting a dummy token for demonstration
        const headers = req.headers.set('Authorization', 'Bearer Auth-1234567');
        req = req.clone({headers});
    }

    return next(req).pipe(
        tap(resp => console.log('response', resp))
    );
}