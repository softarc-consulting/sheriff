import { importProvidersFrom, LOCALE_ID } from '@angular/core';

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { Configuration } from '@eternal/shared/config';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BaseUrlInterceptor } from '@eternal/shared/http';
import {
  LoadingInterceptor,
  sharedUiMessagingProvider,
} from '@eternal/shared/ui-messaging';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { securityProvider } from '@eternal/shared/security';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { sharedMasterDataProvider } from '@eternal/shared/master-data';
import { appRoutes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';

import localeDeAt from '@angular/common/locales/de-AT';
import { deAT } from 'date-fns/locale';
import { environment } from './environments/environment';
import { MatDateFnsModule } from '@angular/material-date-fns-adapter';

registerLocaleData(localeDeAt, 'de-AT');

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(appRoutes),

    provideStore(),
    provideEffects([]),
    provideStoreDevtools({connectInZone: true}),

    ...securityProvider,
    sharedMasterDataProvider,

    importProvidersFrom(
      FormlyModule.forRoot({
        extras: { lazyRender: true },
        validationMessages: [
          {
            name: 'required',
            message: 'This field is mandatory',
          },
        ],
      }),
      FormlyMaterialModule,
      MatDateFnsModule
    ),
    sharedUiMessagingProvider,
    {
      provide: Configuration,
      useFactory: () => new Configuration(environment.baseUrl),
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: deAT,
    },
    { provide: HTTP_INTERCEPTORS, multi: true, useClass: BaseUrlInterceptor },
    { provide: HTTP_INTERCEPTORS, multi: true, useClass: LoadingInterceptor },
    { provide: LOCALE_ID, useValue: 'de-AT' },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
});
