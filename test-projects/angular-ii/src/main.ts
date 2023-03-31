import { LayoutModule } from '@angular/cdk/layout';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
} from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { reducer } from './app/+state';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import { authInterceptor } from './app/domains/shared/util-auth';
import { LegacyInterceptor } from './app/domains/shared/util-common';
import { DefaultLogAppender, LogLevel, provideLogger, withColor } from './app/domains/shared/util-logger';
import { TicketsModule } from './app/domains/ticketing/feature-my-tickets';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withInterceptorsFromDi()
    ),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: LegacyInterceptor,
      multi: true,
    },

    provideRouter(
      APP_ROUTES,
      withPreloading(PreloadAllModules)
      // withDebugTracing(),
    ),

    provideLogger(
      {
        level: LogLevel.DEBUG,
        appenders: [DefaultLogAppender],
        formatter: (level, cat, msg) => [level, cat, msg].join(';'),
      },
      withColor({
        debug: 3,
      })
    ),

    // provideCategory('home', DefaultLogAppender),

    provideStore(reducer),
    provideEffects(),
    provideStoreDevtools(),
    provideAnimations(),

    importProvidersFrom(TicketsModule),
    importProvidersFrom(LayoutModule),
  ],
});

// {
//   provide: INJECTOR_INITIALIZER,
//   multi: true,
//   useValue: () => inject(InitService).init()
// }
