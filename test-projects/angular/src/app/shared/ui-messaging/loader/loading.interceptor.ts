import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { SILENT_LOAD_CONTEXT } from './silent-load.context';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  #loadingService = inject(LoadingService);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (req.context.get(SILENT_LOAD_CONTEXT)) {
      return next.handle(req);
    }

    this.#loadingService.start();
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.#loadingService.stop();
        }
      }),
      catchError((err) => {
        this.#loadingService.stop();
        return throwError(() => err);
      })
    );
  }
}
