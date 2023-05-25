import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MessageService } from '@eternal/shared/ui-messaging';
import { catchError, Observable, throwError } from 'rxjs';
import { ERROR_MESSAGE_CONTEXT } from './error-message.context';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  #uiMessage = inject(MessageService);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err) => {
        const errorMessageContext = req.context.get(ERROR_MESSAGE_CONTEXT);
        this.#uiMessage.error(errorMessageContext);
        return throwError(() => err);
      })
    );
  }
}
