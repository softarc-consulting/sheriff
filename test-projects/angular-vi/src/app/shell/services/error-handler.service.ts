import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { MessageService } from '@eternal/shared/ui-messaging';

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: unknown): void {
    const messageService = this.injector.get(MessageService);
    messageService.error('We are sorry. An error happened.');
    console.error(error);
  }
}
