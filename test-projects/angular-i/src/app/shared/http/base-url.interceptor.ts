import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Configuration } from '@eternal/shared/config';
import { Observable } from 'rxjs';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  #config = inject(Configuration);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith('/')) {
      return next.handle(req);
    }
    return next.handle(
      req.clone({
        url: `${this.#config.baseUrl}${req.url}`,
        withCredentials: true,
      })
    );
  }
}
