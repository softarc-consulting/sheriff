import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoadingInterceptor } from './loader/loading.interceptor';
import { importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

export const sharedUiMessagingProvider = [
  {
    provide: HTTP_INTERCEPTORS,
    multi: true,
    useClass: LoadingInterceptor,
  },
  importProvidersFrom(MatDialogModule),
];
